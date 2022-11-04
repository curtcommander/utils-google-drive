'use strict';

const assert = require('assert').strict;
const path = require('path');

const { UtilsGDrive } = require('../../dist');
const utils = require('../../dist/utils/utilsMethods');

const vals = require('../vals');

const utilsGDrive = new UtilsGDrive();

module.exports = { resolveIdentifiers };

function resolveIdentifiers(timeout) {
    
  describe('resolve identifiers using utils.resolveId()', function() {
    if (timeout) this.timeout(timeout);

    it('default to root', async function() {
      const fileId = await utils.resolveId(utilsGDrive);
      assert(fileId === 'root');
    })

    it('file id given as string', async function() {
      const fileId = await utils.resolveId(utilsGDrive, vals.fileIdTest);
      assert(fileId === vals.fileIdTest);
    })

    it('file id given as object property', async function() {
      const fileId = await utils.resolveId(utilsGDrive, {
        fileId: vals.fileIdTest,
        fileName: 'testName',
        test: 'test',
      })
      assert(fileId === vals.fileIdTest);
    })

    it('path given as string', async function() {
      const p = [vals.parentNameTest, vals.fileNameTest].join(path.sep);
      const fileId = await utils.resolveId(utilsGDrive, p);
      assert(fileId === vals.fileIdTest);
    })

    it('filename given', async function() {
      const fileId = await utils.resolveId(utilsGDrive, { fileName: vals.parentNameTest });
      assert(fileId === vals.parentIdTest);
    })

    it('filename and parent id given', async function() {
      const fileId = await utils.resolveId(utilsGDrive, {
        fileName: vals.fileNameTest,
        parentId: vals.parentIdTest,
      });
      assert(fileId == vals.fileIdTest);
    })

    it('filename and parent name given', async function() {
      const fileId = await utils.resolveId(utilsGDrive, {
        fileName: vals.fileNameTest,
        parentName: vals.parentNameTest,
      })
      assert(fileId === vals.fileIdTest);
    })
  })
}