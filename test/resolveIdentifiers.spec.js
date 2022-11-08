'use strict';

import * as path from 'path';
import * as uuid from 'uuid';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

import { UtilsGDrive } from '../dist';

const utils = require('../dist/utils/utilsMethods');

const utilsGDrive = new UtilsGDrive();

const parentName = 'parentResolveIdentifiers-' + uuid.v4();
const childName = 'childResolveIdentifiers-' + uuid.v4();

let parentId;
let childId;

beforeAll(async () => {
  parentId = await utilsGDrive.makeFolder(parentName);
  childId = await utilsGDrive.makeFolder({
    folderName: childName,
    parentIdentifiers: parentId,
  });
});

afterAll(async () => {
  await utilsGDrive.del(parentId);
});

describe('resolve identifiers using utils.resolveId()', () => {
  test.concurrent('default to root', async () => {
    const fileId = await utils.resolveId(utilsGDrive);

    expect(fileId).toEqual('root');
  });

  test.concurrent('file id given as string', async () => {
    const fileId = await utils.resolveId(utilsGDrive, parentId);

    expect(fileId).toEqual(parentId);
  });

  test.concurrent('file id given as object property', async () => {
    const fileId = await utils.resolveId(utilsGDrive, { fileId: parentId });

    expect(fileId).toEqual(parentId);
  });

  test.concurrent('path given as string', async () => {
    const pathChild = [parentName, childName].join(path.sep);

    const fileId = await utils.resolveId(utilsGDrive, pathChild);

    expect(fileId).toEqual(childId);
  });

  test.concurrent('filename given', async () => {
    const fileId = await utils.resolveId(utilsGDrive, { fileName: parentName });

    expect(fileId).toEqual(parentId);
  });

  test.concurrent('filename and parent id given', async () => {
    const fileId = await utils.resolveId(utilsGDrive, {
      fileName: childName,
      parentId,
    });

    expect(fileId).toEqual(childId);
  });

  test.concurrent('filename and parent name given', async () => {
    const fileId = await utils.resolveId(utilsGDrive, {
      fileName: childName,
      parentName,
    });

    expect(fileId).toEqual(childId);
  });
});
