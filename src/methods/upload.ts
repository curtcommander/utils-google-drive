'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { drive_v3 } from '@googleapis/drive';

import { UtilsGDrive } from '..';

import { Params$MakeFolder } from './makeFolder';
import * as utils from '../utils/utilsMethods';

const mimeTypesByExt: { [ext: string]: string } = {
  /* eslint-disable key-spacing */
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsm: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  html: 'text/html',
  htm: 'text/html',
  csv: 'text/csv',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  json: 'application/vnd.google-apps.script+json',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pptm: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  /* eslint-enable key-spacing */
};

/**
 * Parameters for uploading a file to Google Drive.
 */
export interface Params$Upload {
  /**
   * Location of file to be uploaded.
   */
  localPath: string;
  /**
   * Identifiers of parent folder where the file should be uploaded.
   */
  parentIdentifiers?: utils.Identifiers | string;
  /**
   * Delete any files or folders with the same name, location, and MIME type as the
   * file to be uploaded in Google Drive.
   */
  overwrite?: boolean;
}

/**
 * Upload a file or folder to Google Drive.
 */
export async function upload(
  this: UtilsGDrive,
  params: Params$Upload | string
): Promise<string> {
  let parentId: string;
  let localPath: string;
  let overwrite: boolean;

  if (typeof params === 'string') {
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

  if (fs.lstatSync(localPath).isDirectory()) {
    return await handleFolderUpload(this);
  } else {
    return await handleFileUpload(this);
  }

  async function handleFolderUpload(utilsGDrive: UtilsGDrive): Promise<string> {
    const paramsMakeFolder: Params$MakeFolder = {
      folderName: fileName,
      parentIdentifiers: parentId,
      overwrite,
    };
    const folderId = await utilsGDrive.makeFolder(paramsMakeFolder);

    const children = fs.readdirSync(localPath);

    const uploads = [];
    for (const child of children) {
      const localPathChild = path.join(localPath, child);
      const upload = utilsGDrive.upload({
        localPath: localPathChild,
        parentIdentifiers: folderId,
        overwrite,
      });
      uploads.push(upload);
    }
    await Promise.all(uploads);

    return folderId;
  }

  async function handleFileUpload(utilsGDrive: UtilsGDrive): Promise<string> {
    // file metadata
    const mimeType = mimeTypesByExt[path.extname(localPath).slice(1)];
    const fileMetadata: utils.FileMetadata$Overwrite = {
      name: fileName,
      mimeType,
      parents: [parentId],
    };

    // delete old file
    if (overwrite) await utils.overwrite(utilsGDrive, fileMetadata);

    // upload new file
    return await uploadFile(utilsGDrive, localPath, fileMetadata);
  }
}

async function uploadFile(
  utilsGDrive: UtilsGDrive,
  localPath: string,
  fileMetadata: utils.FileMetadata$Overwrite
): Promise<string> {
  // https://developers.google.com/drive/api/guides/folder
  const data = await utilsGDrive.call<
    Record<string, any>,
    drive_v3.Schema$File,
    'files'
  >('files', 'create', {
    resource: fileMetadata,
    media: {
      mimeType: fileMetadata.mimeType,
      body: fs.createReadStream(localPath),
    },
    fields: 'id',
  });

  return data.id;
}
