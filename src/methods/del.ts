'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';
import { resolveId, Identifiers } from '../utils/utilsMethods';

/**
 * Delete a file or folder in Google Drive.
 */
export async function del(
  this: UtilsGDrive,
  identifiers: Identifiers | string
): Promise<undefined> {
  const fileId = await resolveId(this, identifiers);
  return await this.call<
    drive_v3.Params$Resource$Files$Delete,
    undefined,
    'files'
  >('files', 'delete', { fileId });
}
