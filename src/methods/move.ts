'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';

import { resolveId, Identifiers } from '../utils/utilsMethods';

/**
 * Move a file or folder in Google Drive.
 */
export async function move(
  this: UtilsGDrive,
  identifiers: Identifiers | string,
  newParentIdentifiers: Identifiers | string
): Promise<drive_v3.Schema$File> {
  const fileId = await resolveId(this, identifiers);
  const data = await this.getFiles({ fileId, fields: 'parents' });
  const oldParentId = data.parents[0];
  const newParentId = await resolveId(this, newParentIdentifiers);
  const params: drive_v3.Params$Resource$Files$Update = {
    fileId,
    removeParents: oldParentId,
    addParents: newParentId,
  };
  return await this.updateFiles(params);
}
