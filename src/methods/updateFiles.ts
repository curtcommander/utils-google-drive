'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';
import { UtilsGDriveError } from '../utils/utilsGDriveError';

/**
 * Base function for calling the update method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/update
 * for information on the request parameters.
 */
export function updateFiles(
  this: UtilsGDrive,
  params: drive_v3.Params$Resource$Files$Update = {}
): Promise<drive_v3.Schema$File> {
  if (!params.fileId) throw new UtilsGDriveError('File id not specified.');
  return this.call<drive_v3.Params$Resource$Files$Update, drive_v3.Schema$File, 'files'>('files', 'update', params);
}