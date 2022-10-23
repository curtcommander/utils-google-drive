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
) {
  const fileId = await resolveId(this, identifiers);
  return this.call<drive_v3.Params$Resource$Files$Delete, void, 'files'>('files', 'delete', { fileId });
}

