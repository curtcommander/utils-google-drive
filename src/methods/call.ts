'use strict';

import * as google from '@googleapis/drive';

import { UtilsGDrive } from '..';
import { ApplyExpBack } from '../utils/ApplyExpBack';

/**
 * Possible values of `reource` parameter in `UtilsGDrive.call()` method.
 */
export type Resource$Call =
  | 'about'
  | 'changes'
  | 'channels'
  | 'comments'
  | 'context'
  | 'drives'
  | 'files'
  | 'permissions'
  | 'replies'
  | 'revisions'
  | 'teamdrives';

/**
 * Possible values of `method` parameter in `UtilsGDrive.call()` method.
 */
export type Method$Call<T extends Resource$Call> =
  /* eslint-disable @typescript-eslint/indent */
  T extends 'about'
    ? 'context' | 'get'
    : T extends 'changes'
    ? 'context' | 'getStartPageToken' | 'list' | 'watch'
    : T extends 'channels'
    ? 'context' | 'stop'
    : T extends 'comments'
    ? 'context' | 'create' | 'delete' | 'list' | 'update'
    : T extends 'drives'
    ?
        | 'context'
        | 'create'
        | 'delete'
        | 'get'
        | 'hide'
        | 'list'
        | 'unhide'
        | 'update'
    : T extends 'files'
    ?
        | 'context'
        | 'copy'
        | 'create'
        | 'delete'
        | 'emptyTrash'
        | 'export'
        | 'generateIds'
        | 'get'
        | 'list'
        | 'update'
        | 'watch'
    : T extends 'permissions'
    ? 'context' | 'create' | 'delete' | 'get' | 'list' | 'update'
    : T extends 'replies'
    ? 'context' | 'create' | 'delete' | 'get' | 'list' | 'update'
    : T extends 'revisions'
    ? 'context' | 'delete' | 'get' | 'list' | 'update'
    : 'context' | 'create' | 'delete' | 'get' | 'list' | 'update'; // teamdrives
/* eslint-enable @typescript-eslint/indent */

/**
 * Base function for calling Google Drive API.
 * Consult https://developers.google.com/drive/api/v3/reference
 * for information on the resources and methods available.
 */
export async function call<
  ParamsMethod,
  ReturnData,
  Resource extends Resource$Call
>(
  this: UtilsGDrive,
  resource: Resource,
  method: Method$Call<Resource>,
  params: ParamsMethod,
  opts?: google.StreamMethodOptions
): Promise<ReturnData> {
  return await ApplyExpBack(async () => {
    await this.limiter.removeTokens(1);
    // @ts-expect-error
    const res = await this.drive[resource][method](params, opts);
    return res.data as ReturnData;
  }, this.optsExpBack)();
}
