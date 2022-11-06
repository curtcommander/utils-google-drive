'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';

/**
 * Base function for calling the list method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/list
 * for information on the request parameters.
 */
export async function listFiles(
  this: UtilsGDrive,
  params: drive_v3.Params$Resource$Files$List = {},
  ignoreTrash = true
): Promise<drive_v3.Schema$FileList> {
  if (!params.fields) params.fields = 'files(name, id, mimeType)';

  if (params.q && ignoreTrash) {
    const regEx = /(and)? trashed ?= ?(true|false)/;
    const matches = regEx.exec(params.q);
    if (matches) params.q = params.q.replace(matches[0], '');
    params.q += ' and trashed=false';
  }

  return await this.call<
    drive_v3.Params$Resource$Files$List,
    drive_v3.Schema$FileList,
    'files'
  >('files', 'list', params);
}
