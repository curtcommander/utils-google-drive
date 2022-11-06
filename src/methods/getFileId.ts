'use strict';

import * as path from 'path';

import { UtilsGDrive } from '..';
import { UtilsGDriveError } from '../utils/utilsGDriveError';

import { resolveIdString } from '../utils/utilsMethods';

/**
 * Identifiers for the file to get the id of.
 */
export interface Identifiers$GetFileId {
  /**
   * Name of file to get the id of.
   */
  fileName: string;
  /**
   * Id of parent of file to get the id of.
   */
  parentId?: string;
  /**
   * Name of parent of file to get the id of.
   */
  parentName?: string;
}

/**
 * Get the id of a file or folder in Google Drive.
 */
export async function getFileId(
  this: UtilsGDrive,
  identifiers: Identifiers$GetFileId | string
): Promise<string> {
  let fileName: string;
  let parentId: string | undefined;
  let parentName: string | undefined;

  // string passed
  if (typeof identifiers === 'string') {
    // path passed
    if (identifiers.match(path.sep)) {
      return await resolveIdString(this, identifiers);

      // fileName passed
    } else {
      fileName = identifiers;
    }

    // object passed
  } else {
    ({ fileName, parentId, parentName } = identifiers);
  }

  // build q
  let q = `name="${fileName}"`;
  if (parentId ?? parentName) {
    let p: string;
    if (parentId) {
      p = parentId;
    } else if (parentName) {
      p = await this.getFileId(parentName);
    }
    q += ` and "${p}" in parents`;
  }

  const data = await this.listFiles({ q, fields: 'files(id)' });
  const filesData = data.files;

  // check file is uniquely identified
  const nFiles = filesData.length;
  if (nFiles === 0) {
    throw new UtilsGDriveError(
      `No files found matching identifiers specified: ${fileName}.`
    );
  } else if (nFiles > 1) {
    throw new UtilsGDriveError(
      `Multiple files found: ${fileName}. Consider specifying parent.`
    );
  }

  return filesData[0].id;
}
