'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';
import { UtilsGDriveError } from '../utils/utilsGDriveError';

/**
 * Base function for calling the get method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/get
 * for information on the request parameters.
 */
export function getFiles(
    this: UtilsGDrive,
    params: drive_v3.Params$Resource$Files$Get = {}
): Promise<drive_v3.Schema$File> {
  if (!params.fileId) throw new UtilsGDriveError('File id not specified.');
  if (!params.fields) params.fields = 'name, id, mimeType';
  return this.call<drive_v3.Params$Resource$Files$Get, drive_v3.Schema$File, 'files'>('files', 'get', params);
}