'use strict';

const assert = require('assert').strict;
const path = require('path');

const { UtilsGDrive } = require('../../dist');
const utils = require('../../dist/utils/utilsMethods');

const vals = require('../vals');

const utilsGDrive = new UtilsGDrive();

module.exports = { resolveIdentifiers };

function resolveIdentifiers(timeout) {
    
  describe('resolve identifiers', function() {
    if (timeout) this.timeout(timeout);

    it('utils.resolveId(), default to root', async function() {
      const fileId = await utils.resolveId(utilsGDrive);
      assert(fileId === 'root');
    })

    it('utils.resolveId(), file id given as string', async function() {
      const fileId = await utils.resolveId(utilsGDrive, vals.fileIdTest);
      assert(fileId === vals.fileIdTest);
    })

    it('utils.resolveId(), file id given as object property', async function() {
      const fileId = await utils.resolveId(utilsGDrive, {
        fileId: vals.fileIdTest,
        fileName: 'testName',
        test: 'test',
      })
      assert(fileId === vals.fileIdTest);
    })

    it('utils.resolveId(), path given as string', async function() {
      const p = [vals.parentNameTest, vals.fileNameTest].join(path.sep);
      const fileId = await utils.resolveId(utilsGDrive, p);
      assert(fileId === vals.fileIdTest);
    })

    it('utils.resolveId(), filename given', async function() {
      const fileId = await utils.resolveId(utilsGDrive, { fileName: vals.parentNameTest });
      assert(fileId === vals.parentIdTest);
    })

    it('utils.resolveId(), filename and parent id given', async function() {
      const fileId = await utils.resolveId(utilsGDrive, {
        fileName: vals.fileNameTest,
        parentId: vals.parentIdTest,
      });
      assert(fileId == vals.fileIdTest);
    })

    it('utils.resolveId(), filename and parent name given', async function() {
      const fileId = await utils.resolveId(utilsGDrive, {
        fileName: vals.fileNameTest,
        parentName: vals.parentNameTest,
      })
      assert(fileId === vals.fileIdTest);
    })

  })
  
}