'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

import { UtilsGDrive } from '../dist';
import utils from '../dist/utils/utilsMethods';

const utilsGDrive = new UtilsGDrive(null, {
  expBack: {
    shouldRetry: (err) => {
      console.error(err);
      return false;
    },
  },
});

const parentName = 'parentMethods-' + uuid.v4();
const childName = 'childMethods-' + uuid.v4();
const localPathBase = '/tmp/utilsGDriveMethods';
const timeout = 10000;

let parentId;
let childId;

beforeAll(async () => {
  parentId = await utilsGDrive.makeFolder(parentName);
  childId = await utilsGDrive.makeFolder({
    folderName: childName,
    parentIdentifiers: parentId,
  });

  if (!fs.existsSync(localPathBase)) fs.mkdirSync(localPathBase);
});

afterAll(async () => {
  await utilsGDrive.del(parentId);

  fs.rmdirSync(localPathBase, {
    recursive: true,
    force: true,
  });
});

describe.concurrent('methods', () => {
  test(
    'listFiles()',
    async () => {
      const files = await utilsGDrive.listFiles({ fileId: 'root' });

      expect(files).toBeTypeOf('object');
    },
    timeout
  );

  test(
    'getFiles()',
    async () => {
      const res = await utilsGDrive.getFiles({
        fileId: 'root',
        fields: 'name',
      });

      expect(res.name).toBe('My Drive');
    },
    timeout
  );

  test.concurrent(
    'updateFiles()',
    async () => {
      const fileName1 = generateFileName('moveFile');
      const fileName2 = generateFileName('moveFile');
      const localPath = `${localPathBase}/${fileName1}`;
      fs.writeFileSync(localPath, uuid.v4());
      const fileId = await utilsGDrive.upload({
        localPath,
        parentIdentifiers: parentId,
      });
      const res = await utilsGDrive.updateFiles({
        fileId,
        resource: { name: fileName2 },
      });

      expect(res).toBeTypeOf('object');
    },
    timeout
  );

  describe.concurrent('getFileId()', () => {
    test(
      'file id given as object property',
      async () => {
        const fileId = await utilsGDrive.getFileId({
          fileName: childName,
          parentId,
        });

        expect(fileId).toEqual(childId);
      },
      timeout
    );

    test(
      'filename given as string',
      async () => {
        const fileId = await utilsGDrive.getFileId(childName);

        expect(fileId).toEqual(childId);
      },
      timeout
    );

    test(
      'path given as string',
      async () => {
        const p = [parentName, childName].join(path.sep);

        const fileId = await utilsGDrive.getFileId(p);

        expect(fileId).toEqual(childId);
      },
      timeout
    );
  });

  test(
    'getFileName()',
    async () => {
      const fileName = await utilsGDrive.getFileName(childId);

      expect(fileName).toEqual(childName);
    },
    timeout
  );

  test(
    'getMimeType()',
    async () => {
      const mimeType = await utilsGDrive.getMimeType(parentId);

      expect(mimeType).toEqual('application/vnd.google-apps.folder');
    },
    timeout
  );

  test(
    'listChildren()',
    async () => {
      const res = await utilsGDrive.listChildren({ fileId: parentId });

      expect(Object.keys(res[0])).toEqual(['id', 'name', 'mimeType']);
      expect(res.filter((file) => file.id === childId).length).toEqual(1);
    },
    timeout
  );

  test(
    'makeFolder()',
    async () => {
      const folderName = generateFolderName('makeFolder');

      const folderId = await utilsGDrive.makeFolder({
        folderName,
        parentIdentifiers: parentId,
      });

      const folderNameGDrive = await utilsGDrive.getFileName(folderId);
      expect(folderNameGDrive).toEqual(folderName);
    },
    timeout
  );

  describe.concurrent('upload()', async () => {
    test(
      'upload file',
      async () => {
        const fileName = generateFileName('uploadFile');
        const localPath = `${localPathBase}/${fileName}`;
        fs.writeFileSync(localPath, uuid.v4());

        const fileId = await utilsGDrive.upload({
          localPath,
          parentIdentifiers: parentId,
        });

        const fileNameGDrive = await utilsGDrive.getFileName(fileId);
        expect(fileNameGDrive).toEqual(fileName);
      },
      timeout
    );

    test(
      'upload folder',
      async () => {
        const folderName = generateFolderName('uploadFolder');
        const localPathFolder = `${localPathBase}/${folderName}`;
        fs.mkdirSync(localPathFolder);

        const fileName = generateFileName('uploadFolder');
        const localPathFile = `${localPathFolder}/${fileName}`;
        fs.writeFileSync(localPathFile, uuid.v4());

        const folderId = await utilsGDrive.upload({
          localPath: localPathFolder,
          parentIdentifiers: parentId,
        });

        const children = await utilsGDrive.listChildren(folderId);
        expect(children.length).toBeGreaterThan(0);
      },
      timeout
    );

    test(
      'overwrite',
      async () => {
        const fileName = generateFileName('overwrite');
        const localPath = `${localPathBase}/${fileName}`;

        for (let i = 0; i < 2; i++) {
          fs.writeFileSync(localPath, String(i));
          await utilsGDrive.upload({
            localPath,
            parentIdentifiers: parentId,
            overwrite: true,
          });
        }

        const files = await utilsGDrive.listChildren({ fileName: parentName });
        const filesOverwrite = files.filter((file) => file.name === fileName);
        expect(filesOverwrite.length).toEqual(1);
      },
      timeout
    );
  });

  describe.concurrent('download()', async () => {
    test(
      'download file',
      async () => {
        const fileName = generateFileName('downloadFile');
        const localPath = `${localPathBase}/${fileName}`;
        const fileContent = uuid.v4();
        fs.writeFileSync(localPath, fileContent);
        const fileId = await utilsGDrive.upload({
          localPath,
          parentIdentifiers: parentId,
        });
        fs.rmSync(localPath);

        await utilsGDrive.download(fileId, localPathBase);

        const fileContentDownloaded = fs.readFileSync(localPath).toString();
        expect(fileContentDownloaded).toEqual(fileContent);
      },
      timeout
    );

    test(
      'download folder',
      async () => {
        const folderName = generateFolderName('downloadFolder');
        const localPathFolder = `${localPathBase}/${folderName}`;
        fs.mkdirSync(localPathFolder);

        const fileName = generateFileName('downloadFolder');
        const localPathFile = `${localPathFolder}/${fileName}`;
        const fileContent = uuid.v4();
        fs.writeFileSync(localPathFile, fileContent);

        const folderId = await utilsGDrive.upload({
          localPath: localPathFolder,
          parentIdentifiers: parentId,
        });
        fs.rmSync(localPathFolder, { recursive: true, force: true });

        await utilsGDrive.download(folderId, localPathBase);

        const fileContentDownloaded = fs.readFileSync(localPathFile).toString();
        expect(fileContentDownloaded).toEqual(fileContent);
      },
      timeout
    );
  });

  describe.concurrent('move()', () => {
    test(
      'move file',
      async () => {
        const fileName = generateFileName('moveFile');
        const localPath = `${localPathBase}/${fileName}`;
        fs.writeFileSync(localPath, uuid.v4());
        const fileId = await utilsGDrive.upload({
          localPath,
          parentIdentifiers: parentId,
        });

        await utilsGDrive.move(fileId, childId);

        const fileIdGDrive = await utils.resolveId(utilsGDrive, {
          fileName,
          parentId: childId,
        });
        expect(fileIdGDrive).toEqual(fileId);
      },
      timeout
    );

    test(
      'move folder',
      async () => {
        const folderName = generateFolderName('moveFolder');
        const folderId = await utilsGDrive.makeFolder({ folderName, parentId });

        await utilsGDrive.move(folderId, childId);

        const folderIdGDrive = await utils.resolveId(utilsGDrive, {
          fileName: folderName,
          parentId: childId,
        });
        expect(folderIdGDrive).toEqual(folderId);
      },
      timeout
    );
  });

  describe.concurrent('rename()', () => {
    test(
      'rename file',
      async () => {
        const fileName1 = generateFileName('renameFile');
        const fileName2 = generateFileName('renameFile');
        const localPath = `${localPathBase}/${fileName1}`;
        fs.writeFileSync(localPath, uuid.v4());
        const fileId = await utilsGDrive.upload({
          localPath,
          parentIdentifiers: parentId,
        });

        await utilsGDrive.rename(fileId, fileName2);

        const fileIdRenamed = await utilsGDrive.getFileId(fileName2);
        expect(fileIdRenamed).toEqual(fileId);
      },
      timeout
    );

    test(
      'rename folder',
      async () => {
        const folderName1 = generateFolderName('renameFolder');
        const folderName2 = generateFolderName('renameFolder');
        const fileId = await utilsGDrive.makeFolder({
          folderName: folderName1,
          parentIdentifiers: parentId,
        });

        await utilsGDrive.rename(fileId, folderName2);

        const fileIdRenamed = await utilsGDrive.getFileId(folderName2);
        expect(fileIdRenamed).toEqual(fileId);
      },
      timeout
    );
  });

  describe.concurrent('del()', () => {
    test(
      'delete file',
      async () => {
        const fileName = generateFileName('deleteFile');
        const localPath = `${localPathBase}/${fileName}`;
        fs.writeFileSync(localPath, uuid.v4());
        const fileId = await utilsGDrive.upload({
          localPath,
          parentIdentifiers: parentId,
        });

        await utilsGDrive.del(fileId);

        const res = await utilsGDrive.listFiles({ q: `name="${fileName}"` });
        expect(res.files.length).toEqual(0);
      },
      timeout
    );

    test(
      'delete folder',
      async () => {
        const folderName = generateFolderName('deleteFolder');
        const folderId = await utilsGDrive.makeFolder({
          folderName,
          parentIdentifiers: parentId,
        });

        await utilsGDrive.del(folderId);

        const res = await utilsGDrive.listFiles({ q: `name="${folderName}"` });
        expect(res.files.length).toEqual(0);
      },
      timeout
    );
  });

  test.concurrent(
    'batch()',
    async () => {
      const request = {
        url: 'https://www.googleapis.com/drive/v3/files',
        method: 'GET',
      };
      const requests = new Array(2).fill(request);

      const responses = await utilsGDrive.batch(requests);

      for (const response of responses) {
        expect(response.responseStatus).toEqual(200);
        expect(response.responseData).toBeDefined();
      }
    },
    timeout
  );
});

function generateFolderName(descriptor) {
  return `${descriptor}-${uuid.v4()}`;
}

function generateFileName(descriptor) {
  return `${descriptor}-${uuid.v4()}.txt`;
}
