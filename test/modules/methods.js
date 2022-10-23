'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const { UtilsGDrive } = require('../../dist');
const utils = require('../../dist/utils/utilsMethods');

const vals = require('../vals');

const utilsGDrive = new UtilsGDrive();
const pathDownload = '/tmp';

module.exports = { methods };

function methods(timeout) {

  describe('methods', function() {
    if (timeout) this.timeout(timeout);
    
    it('listFiles()', async function() {
      const files = await utilsGDrive.listFiles({ fileId: vals.fileIdTest });
      assert(files);
    })

    it('getFiles()', async function() {
      const responseData = await utilsGDrive.getFiles({
        fileId: vals.fileIdTest,
        fields: 'name',
      })
      assert(responseData.name);
    })

    it('updateFiles()', async function() {
      const responseData = await utilsGDrive.updateFiles({ fileId: vals.fileIdTest });
      assert(responseData);
    })

    it('getFileId(), file id given as object property', async function() {
      const fileId = await utilsGDrive.getFileId({
        fileName: vals.fileNameTest,
        parentId: vals.parentIdTest,
      })
      assert(fileId === vals.fileIdTest);
    })

    it('getFileId(), filename given as string', async function() {
      const fileId = await utilsGDrive.getFileId(vals.fileNameTest);
      assert(fileId === vals.fileIdTest);
    })

    it('getFileId(), path given as string', async function() {
      const p = [vals.parentNameTest, vals.fileNameTest].join(path.sep);
      const fileId = await utilsGDrive.getFileId(p);
      assert(fileId === vals.fileIdTest);
    })

    it('getFileName()', async function() {
      const fileName = await utilsGDrive.getFileName(vals.fileIdTest);
      assert(fileName === vals.fileNameTest);
    })

    it('getMimeType()', async function() {
      const mimeType = await utilsGDrive.getMimeType(vals.fileIdTest);
      assert(mimeType === vals.mimeTypeTest);
    })

    it('listChildren()', async function() {
      const responseData = await utilsGDrive.listChildren({
        fileId: vals.fileIdTest,
        fields: 'files(id)',
      })
      assert(Array.isArray(responseData));
    })

    let makeFolderPassed;
    it('makeFolder()', async function() {
      const fileId = await utilsGDrive.makeFolder('testMakeFolder');
      const fileName = await utilsGDrive.getFileName(fileId);
      if (fileName === 'testMakeFolder') makeFolderPassed = true;
      assert(makeFolderPassed);
    })

    let uploadFilePassed;
    it('upload(), upload file', async function() {
      if (!makeFolderPassed) this.skip();
      const fileId = await utilsGDrive.upload({
        localPath: 'test/testFiles/testUploadFile.xlsx',
        parentIdentifiers: { fileName: 'testMakeFolder' }
      })
      const fileName = await utilsGDrive.getFileName(fileId);
      uploadFilePassed = fileName === 'testUploadFile.xlsx';
      assert(uploadFilePassed);
    })

    it('upload(), overwrite', async function() {
      if (!uploadFilePassed) this.skip();
      await utilsGDrive.upload({
        localPath: 'test/testFiles/testUploadFile.xlsx',
        parentIdentifiers: { fileName: 'testMakeFolder' },
        overwrite: true,
      })
      const files = await utilsGDrive.listChildren({ fileName: 'testMakeFolder' });
      assert(files.length === 1);
    })

    let uploadFolderPassed;
    it('upload(), upload folder', async function() {
      if (!uploadFilePassed) this.skip();
      await utilsGDrive.upload({
        localPath: 'test/testFiles/testUploadFolder',
        parentIdentifiers: { fileName: 'testMakeFolder' }
      })
      const children = await utilsGDrive.listChildren({
        fileName: 'testUploadFolder',
        parentName: 'testMakeFolder',
      })
      uploadFolderPassed = !!children.length;
      assert(uploadFolderPassed);
    })

    let movePassed;
    it('move()', async function() {
      if (!uploadFolderPassed) this.skip();
      await utilsGDrive.move(
          { fileName: 'testUploadFile.xlsx' },
          { fileName: 'testUploadFolder' },
      );
      const fileId = await utils.resolveId(utilsGDrive, {
        fileName: 'testUploadFile.xlsx',
        parentName: 'testUploadFolder',
      })
      movePassed = !!fileId;
      assert(movePassed);
    })

    let downloadFilePassed;
    it('download(), download file', async function() {
      if (!uploadFilePassed) this.skip();
      const fileName = 'testUploadFile.xlsx';
      await utilsGDrive.download({ fileName }, pathDownload);
      if (fs.readdirSync(pathDownload).includes(fileName)) {
        if (fs.statSync(`${pathDownload}/${fileName}`).size) {
          downloadFilePassed = true;
        }
        fs.unlinkSync(`${pathDownload}/${fileName}`);
      }
      assert(downloadFilePassed);
    })

    let downloadFolderPassed;
    it('download(), download folder', async function() {
      if (!downloadFilePassed) this.skip();
      const fileName = 'testMakeFolder';
      await utilsGDrive.download({ fileName }, pathDownload);
      if (fs.readdirSync(pathDownload).includes(fileName)) {
        if (fs.readdirSync(`${pathDownload}/${fileName}`).length) {
          downloadFolderPassed = true;
        }
        fs.rmSync(`${pathDownload}/${fileName}`, { recursive: true, force: true });
      }
      assert(downloadFolderPassed);
    })


    it('rename()', async function() {
      if (!uploadFilePassed) this.skip();
      const fileId = await utilsGDrive.getFileId('testUploadFile.xlsx');
      await utilsGDrive.rename({ fileName: 'testUploadFile.xlsx' }, 'testUploadFile2.xlsx');
      const fileIdRenamed = await utilsGDrive.getFileId('testUploadFile2.xlsx');
      assert(fileId === fileIdRenamed);
    })

    it('del()', async function() {
      await utilsGDrive.del({fileName: 'testMakeFolder'});
      const files = await utilsGDrive.listFiles({ q: 'name="testMakeFolder"' });
      assert(!files.length);
    })

    it('batch()', async function() {
      const request = {
        url: 'https://www.googleapis.com/drive/v3/files',
        method: 'GET',
      };
      const requests = new Array(2).fill(request);
      const responses = await utilsGDrive.batch(requests);
      const firstResponse = (responses[0].responseStatus === 200 && responses[0].responseData);
      const secondResponse = (responses[1].responseStatus === 200 && responses[1].responseData);
      assert(firstResponse && secondResponse);
    })

  })

}