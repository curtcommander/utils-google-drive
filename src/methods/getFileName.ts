'use strict';

import { UtilsGDrive } from '..';

/**
 * Get the name of a file or folder in Google Drive.
 */
export async function getFileName(
  this: UtilsGDrive,
  fileId: string
): Promise<string> {
  const data = await this.getFiles({ fileId, fields: 'name' });
  return data.name;
}
