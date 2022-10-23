'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';

import { resolveId, Identifiers } from '../utils/utilsMethods';

/**
 * Rename a file or folder in Google Drive.
 */
export async function rename(this: UtilsGDrive, identifiers: Identifiers | string, newName: string): Promise<drive_v3.Schema$File> {
  const fileId = await resolveId(this, identifiers);
  const params = { fileId, resource: {name: newName} };
  return this.updateFiles(params);
}
