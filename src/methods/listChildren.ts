'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';
import { resolveId, Identifiers } from '../utils/utilsMethods';

/**
 * List information on a parent folder's children in Google Drive.
 */
export async function listChildren(
  this: UtilsGDrive,
  identifiers: Identifiers | string,
  fields = 'files(name, id, mimeType)'
): Promise<drive_v3.Schema$File[]> {
  const folderId = await resolveId(this, identifiers);
  const listFilesParams: drive_v3.Params$Resource$Files$List = {
    q: `"${folderId}" in parents`,
    fields
  };
  const data = await this.listFiles(listFilesParams);
  return data.files;
}