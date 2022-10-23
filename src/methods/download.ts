'use strict';

import * as fs from 'fs';
import * as path from 'path';

import { UtilsGDrive } from '..';
import { ApplyExpBack } from '../utils/ApplyExpBack';
import { resolveId, Identifiers } from '../utils/utilsMethods';

export interface Identifiers$Download extends Identifiers {
  mimeType: string
}

/**
 * Download a file or folder in Google Drive. 
 */
export async function download(
  this: UtilsGDrive,
  identifiers: Identifiers$Download | string,
  pathOut = '.'
): Promise<void> {

  // get file id
  let fileId: string;
  if (typeof identifiers === 'string') {
    fileId = identifiers;
  } else if (identifiers.fileId) {
    fileId = identifiers.fileId;
  } else {
    fileId = await resolveId(this, identifiers);
  }  

  // get file name and mime type
  let fileName: string;
  let mimeType: string;
  if (typeof identifiers !== 'string' && identifiers.fileName && identifiers.mimeType) {
      fileName = identifiers.fileName;
      mimeType = identifiers.mimeType;
  } else {
    const metadata = await this.getFiles({ fileId, fields: 'name, mimeType' });
    fileName = metadata.name;
    mimeType = metadata.mimeType;
  }

  if (mimeType === 'application/vnd.google-apps.folder') {
    await handleFolderDownload(this);
  } else {
    await downloadFile(this, fileId, fileName, pathOut);
  }

  async function handleFolderDownload(utilsGDrive: UtilsGDrive) {
    // make folder
    pathOut = path.join(pathOut, fileName);
    fs.mkdirSync(pathOut);
  
    // download children
    const children = await utilsGDrive.listChildren({ fileId });
    if (children) {
      const downloads = [];
      for (const child of children) {
        const identifiersChild: Identifiers$Download = {
          fileId: child.id,
          fileName: child.name,
          mimeType: child.mimeType,
        }
        const download = utilsGDrive.download(identifiersChild, pathOut);
        downloads.push(download);
      }
      await Promise.all(downloads);
    }
  }

}

async function downloadFile(
  utilsGDrive: UtilsGDrive,
  fileId: string,
  fileName: string,
  pathOut: string
): Promise<void> {
  const dest = fs.createWriteStream(path.join(pathOut, fileName));
  const params = { fileId, alt: 'media' };

  return ApplyExpBack(async () => {
    await utilsGDrive.limiter.removeTokens(1);
    const res = await utilsGDrive.drive.files.get(params, { responseType: 'stream' });

    await new Promise((resolve, reject) => {
      res.data
        .on('error', reject)
        .on('end', resolve)
        .pipe(dest);
    })
  })();
}
