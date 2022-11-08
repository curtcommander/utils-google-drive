'use strict';

import { describe, test, expect } from 'vitest';

import { GaxiosError } from 'gaxios';
import { UtilsGDrive } from '../dist';

const utilsGDrive = new UtilsGDrive(null, {
  expBack: { shouldRetry: () => false },
});

describe('errors', () => {
  test.concurrent('call(), handle error from response', async () => {
    const fn = () => utilsGDrive.call('files', 'list', { q: 'test1234' });

    await expect(fn()).rejects.toThrowError(GaxiosError);
  });

  describe.concurrent('UtilsGDriveError', () => {
    describe.concurrent('file id not specified', () => {
      const identifiers = { shouldBeFileId: 'foo' };
      const errorMessage = /^File id not specified.$/;
      const testFileIdNotSpec = (method, argsMethod) =>
        testUtilsGDriveError(method, argsMethod, errorMessage);

      test('getFiles()', () => {
        testFileIdNotSpec('getFiles', identifiers);
      });

      test('updateFiles()', () => {
        testFileIdNotSpec('updateFiles', identifiers);
      });
    });

    describe.concurrent('invalid identifier name', () => {
      const identifiers = { f: 'test' };
      const errorMessage = new RegExp(
        `^Invalid property name: ${Object.keys(identifiers)[0]}$`
      );
      const testInvalidIdent = (method, argsMethod) =>
        testUtilsGDriveError(method, argsMethod, errorMessage);

      const args = {
        getMimeType: identifiers,
        listChildren: [identifiers, 'files(id)'],
        download: [identifiers, '.'],
        upload: {
          localPath: 'test',
          parentIdentifiers: identifiers,
        },
        makeFolder: {
          folderName: 'test',
          parentIdentifiers: identifiers,
        },
        move: identifiers,
        rename: identifiers,
        del: identifiers,
      };

      for (const method of Object.keys(args)) {
        const argsMethod = args[method];
        test(`${method}()`, async () => {
          await testInvalidIdent(method, argsMethod);
        });
      }
    });
  });
});

async function testUtilsGDriveError(method, argsMethod, errorMessage) {
  if (!Array.isArray(argsMethod)) argsMethod = [argsMethod];

  const fn = () => utilsGDrive[method](...argsMethod);

  let err;
  try {
    await fn();
  } catch (errCall) {
    err = errCall;
  }

  expect(() => {
    throw err;
  }).toThrowError(UtilsGDrive.Error);
  expect(err.message).toMatch(errorMessage);
}
