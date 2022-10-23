'use strict';

import * as path from 'path';

import { UtilsGDrive } from '..';
import { UtilsGDriveError } from './utilsGDriveError';

import { Identifiers$GetFileId } from '../methods/getFileId';

// fileName required if fileId not specified
export interface Identifiers {
  fileId?: string,
  fileName?: string,
  parentId?: string,
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

export type FileMetadata = {
  name: string,
  mimeType: string,
  parents: string[]
}

export async function overwrite(utilsGDrive: UtilsGDrive, fileMetadata: FileMetadata) {
  const { name, mimeType, parents } = fileMetadata;
  const q = `name='${name}' and mimeType='${mimeType}' and '${parents[0]}' in parents and trashed=false`;
  const data = await utilsGDrive.listFiles({ q });
  if (data) {
    if (data.files.length > 0) {
      await utilsGDrive.del(data.files[0].id);
    }
  }
}
