'use strict';

import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';

import * as utils from '../utils/utilsMethods';

export interface Params$MakeFolder {
  folderName: string,
  parentIdentifiers?: utils.Identifiers | string,
  overwrite?: boolean
}

/**
 * Make a folder in Google Drive.
 */
export async function makeFolder(this: UtilsGDrive, params: Params$MakeFolder | string): Promise<string> {
  let folderName: string;
  let parentIdentifiers: utils.Identifiers | string | undefined;
  let overwrite: boolean = false;

  if (typeof(params) === 'string') {
    folderName = arguments[0];
  } else { 
    ({ folderName } = params);
    if (params.parentIdentifiers) ({ parentIdentifiers } = params);
    if (params.overwrite) ({ overwrite } = params);
  }
  
  // get file metadata
  const parentId = await utils.resolveId(this, parentIdentifiers);
  const fileMetadata: utils.FileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  }

  if (overwrite) await utils.overwrite(this, fileMetadata);

  // https://developers.google.com/drive/api/guides/folder
  const data = await this.call<Record<string, any>, drive_v3.Schema$File, 'files'>('files', 'create', {
    resource: fileMetadata,
    fields: 'id',
  });

  return data.id;
}
