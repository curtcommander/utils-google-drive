'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';

import { Params$MakeFolder } from './makeFolder';
import * as utils from '../utils/utilsMethods';

const mimeTypesByExt: { [ext: string]: string} = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsm: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls:  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt:  'text/plain',
  html: 'text/html',
  htm:  'text/html',
  csv:  'text/csv',
  pdf:  'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  json: 'application/vnd.google-apps.script+json',
  jpeg: 'image/jpeg',
  jpg:  'image/jpeg',
  png:  'image/png',
  svg:  'image/svg+xml',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pptm: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt:  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export interface Params$Upload {
  localPath: string,
  parentIdentifiers?: utils.Identifiers | string,
  overwrite?: boolean,
}

/**
 * Upload a file or folder to Google Drive.
 */
export async function upload(this: UtilsGDrive, params: Params$Upload | string): Promise<string> {
  let parentId: string;
  let localPath: string;
  let overwrite: boolean;
  
  if (typeof(params) === 'string') {
    parentId = 'root';
    localPath = params;
    overwrite = false;
    
  } else {
    parentId = await utils.resolveId(this, params.parentIdentifiers);
    ({ localPath } = params);

    if (params.overwrite) {
      overwrite = params.overwrite;
    } else {
      overwrite = false;
    }
  }

  // get filename
  const fileName = path.basename(localPath);
  const that = this;

  if (fs.lstatSync(localPath).isDirectory()) {
    return handleFolderUpload(that);
  } else {
    return handleFileUpload(that);
  }

  async function handleFolderUpload(utilsGDrive: UtilsGDrive): Promise<string> {
    const paramsMakeFolder: Params$MakeFolder = {
      folderName: fileName,
      parentIdentifiers: parentId,
      overwrite
    };
    const folderId = await utilsGDrive.makeFolder(paramsMakeFolder);

    const children = fs.readdirSync(localPath);

    const uploads = [];
    for (const child of children) {
      const localPathChild = path.join(localPath, child);
      const upload = utilsGDrive.upload({
        localPath: localPathChild,
        parentIdentifiers: folderId,
        overwrite
      });
      uploads.push(upload);
    }
    await Promise.all(uploads);
  
    return folderId;
  }

  async function handleFileUpload(utilsGDrive: UtilsGDrive): Promise<string> {
    // file metadata
    const mimeType = mimeTypesByExt[path.extname(localPath).slice(1)];
    const fileMetadata: utils.FileMetadata = {
      name: fileName,
      mimeType,
      parents: [parentId],
    };

    // delete old file
    if (overwrite) await utils.overwrite(utilsGDrive, fileMetadata);

    // upload new file
    return uploadFile(utilsGDrive, localPath, fileMetadata);
  }

}

async function uploadFile(utilsGDrive: UtilsGDrive, localPath: string, fileMetadata: utils.FileMetadata): Promise<string> {
  // https://developers.google.com/drive/api/guides/folder
  const data = await utilsGDrive.call<Record<string, any>, drive_v3.Schema$File, 'files'>('files', 'create', {
    resource: fileMetadata,
    media: {
      mimeType: fileMetadata.mimeType,
      body: fs.createReadStream(localPath)
    },
    fields: 'id',
  });

  return data.id;
}
