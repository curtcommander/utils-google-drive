'use strict';

import * as path from 'path';

import { UtilsGDrive } from '..';
import { UtilsGDriveError } from './utilsGDriveError';

import { Identifiers$GetFileId } from '../methods/getFileId';

/**
 * Values for identifying a file or folder in Google Drive.
 * `fileName` is required if `fileId` is not specified.
 * If `fileName` is specified and there are multiple files 
 * or folders in Google Drive with that filename,
 * `parentId` or `parentName` should also be specified.
 */
export interface Identifiers {
  /**
   * Id of the file or folder.
   */
  fileId?: string,
  /**
   * Name of the file or folder.
   */
  fileName?: string,
  /**
   * Id of the file or folder's parent.
   */
  parentId?: string,
  /**
   * Name of the file or folder's parent.
   */
  parentName?: string
}

export function resolveId(utilsGDrive: UtilsGDrive, identifiers?: Identifiers | string): string | Promise<string> {
  // default to root
  if (!identifiers) return 'root';

  // handle string
  if (typeof(identifiers) === 'string') return resolveIdString(utilsGDrive, identifiers);

  // pass fileId through if already specified
  if (identifiers.fileId) return identifiers.fileId;

  // validate identifiers
  const validIdentifiers = ['fileId', 'fileName', 'parentId', 'parentName'];
  for (const identifier of Object.keys(identifiers)) {
    if (!validIdentifiers.includes(identifier)) {
      throw new UtilsGDriveError(`Invalid property name: ${identifier}`);
    }
  }

  return utilsGDrive.getFileId(identifiers as Identifiers$GetFileId);
}

export async function resolveIdString(utilsGDrive: UtilsGDrive, str: string): Promise<string> {
  const names = str.split(path.sep);
  if (names.length === 1) return names[0];

  let currentId = await utilsGDrive.getFileId({ fileName: names[0] });
  for (const name of names.slice(1)) {
    currentId = await utilsGDrive.getFileId({
      fileName: name,
      parentId: currentId,
    });
  }

  return currentId;
}

/**
 * Metadata for identifying files and folders to be overwritten in Google Drive.
 */
export type FileMetadata$Overwrite = {
  /**
   * Name of file or folder being written or created.
   */
  name: string,
  /**
   * MIME type of file or folder beign written or created.
   */
  mimeType: string,
  /**
   * Ids of parents of file or folder being written or created.
   */
  parents: string[]
}

export async function overwrite(utilsGDrive: UtilsGDrive, fileMetadata: FileMetadata$Overwrite) {
  const { name, mimeType, parents } = fileMetadata;
  const q = `name='${name}' and mimeType='${mimeType}' and '${parents[0]}' in parents and trashed=false`;
  const data = await utilsGDrive.listFiles({ q });
  if (data) {
    if (data.files.length > 0) {
      await utilsGDrive.del(data.files[0].id);
    }
  }
}
