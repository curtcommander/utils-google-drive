#!/usr/bin/env node
'use strict';

import * as google from '@googleapis/drive';
import { RateLimiter } from 'limiter';

import { getDrive } from './utils/getDrive';

import { batch } from './methods/batch';
import { call } from './methods/call';
import { del } from './methods/del';
import { download } from './methods/download';
import { getFileId } from './methods/getFileId';
import { getFileName } from './methods/getFileName';
import { getFiles } from './methods/getFiles';
import { getMimeType } from './methods/getMimeType';
import { listChildren } from './methods/listChildren';
import { listFiles } from './methods/listFiles';
import { makeFolder } from './methods/makeFolder';
import { move } from './methods/move';
import { rename } from './methods/rename';
import { updateFiles } from './methods/updateFiles';
import { upload } from './methods/upload';

import { Credentials$GoogleApi } from './utils/getOAuth2Client';
import { Token$GoogleApi } from './utils/getDrive';
import { Opts$ExpBack } from './utils/ApplyExpBack';

export { Identifiers } from './utils/utilsMethods';

export { Call$Batch, Response$Batch } from './methods/batch';
export { Resource$Call, Method$Call } from './methods/call';
export { Identifiers$Download } from './methods/download';
export { Identifiers$GetFileId } from './methods/getFileId';
export { Params$MakeFolder } from './methods/makeFolder';
export { Params$Upload } from './methods/upload';

export { drive_v3, StreamMethodOptions } from '@googleapis/drive';

/**
 * Authentication parameters for initializing `UtilsGDrive` base class.
 */
export interface Auth$UtilsGDrive {
  /**
   * The credentials used for authentication.
   */
  credentials?: Credentials$GoogleApi | string,
  /**
   * The token used for authentication.
   */
  token?: Token$GoogleApi | string,
  /**
   * Path to file containing credentials.
   */
  pathCredentials?: string,
  /**
   * Path to file containing token.
   */
  pathToken?: string
}

export { Credentials$GoogleApi, Token$GoogleApi };

/**
 * Options for UtilsGDrive base class.
 */
export interface Opts$UtilsGDrive {
  rateLimiter?: {
    /**
     * Number of API calls that can be made within given interval.
     */
    tokensPerInterval: number,
    /**
     * Interval of time in miliseconds.
     */
    interval: number
  },
  expBack?: Opts$ExpBack
}

export { Opts$ExpBack };

export { getTokenGDrive, Params$GetTokenGDrive } from './utils/getTokenGDrive';

export class UtilsGDrive {
  public limiter: RateLimiter;
  protected optsExpBack: Opts$ExpBack;
  public drive: google.drive_v3.Drive;

  public batch: typeof batch;
  public call: typeof call;
  public del: typeof del;
  public download: typeof download;
  public getFileId: typeof getFileId;
  public getFileName: typeof getFileName;
  public getFiles: typeof getFiles;
  public getMimeType: typeof getMimeType;
  public listChildren: typeof listChildren;
  public listFiles: typeof listFiles;
  public makeFolder: typeof makeFolder;
  public move: typeof move;
  public rename: typeof rename;
  public updateFiles: typeof updateFiles;
  public upload: typeof upload;

  /**
   * Base class containing utils-google-drive methods.
   * 
   * The token and credentials used for authentication can be
   * provided as strings or objects during initialization (`auth.token` and `auth.credentials`).
   * Alternatively, paths to the token and credentials can be provided (`auth.pathToken` and `auth.pathCredentials`).
   * 
   * The token is retreived from ./tokenGDrive.json when
   * neither `auth.token` nor `auth.pathToken` is specified.
   * Similarly, the credentials are retreived from ./credentialsGDrive.json when
   * neither `auth.credentials` nor `auth.pathCredentials` is specified.
   * 
   * Use `opts.rateLimiter` and `opts.expBack` to set rate-limiting and exponential backoff behaviors for API calls.
   * The default rate limit is 1,000 requests per 100 seconds.
   * The default behavior for exponential backoff is retrying up to three times for any error thrown. 
   */
  constructor(auth: Auth$UtilsGDrive = {}, opts: Opts$UtilsGDrive = {}) {
    if (auth === null) auth = {};

    // rate limit
    if (!opts.rateLimiter) opts.rateLimiter = { tokensPerInterval: 1000, interval: 100*1000 };
    this.limiter = new RateLimiter(opts.rateLimiter);

    // exponential backoff
    if (!opts.expBack) opts.expBack = {};
    this.optsExpBack = opts.expBack;

    // client
    this.drive = getDrive(auth);

    // methods
    this.batch = batch;
    this.call = call;
    this.del = del;
    this.download = download;
    this.getFileId = getFileId;
    this.getFileName = getFileName;
    this.getFiles = getFiles;
    this.getMimeType = getMimeType;
    this.listChildren = listChildren;
    this.listFiles = listFiles;
    this.makeFolder = makeFolder;
    this.move = move;
    this.rename = rename;
    this.updateFiles = updateFiles;
    this.upload = upload;
  }
}
