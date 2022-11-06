'use strict';

import { UtilsGDrive } from '..';
import { resolveId, Identifiers } from '../utils/utilsMethods';

/**
 * Get the MIME type of a file or folder in Google Drive.
 */
export async function getMimeType(
  this: UtilsGDrive,
  identifiers: Identifiers | string
): Promise<string> {
  const fileId = await resolveId(this, identifiers);
  const data = await this.getFiles({
    fileId,
    fields: 'mimeType',
  });
  return data.mimeType;
}
