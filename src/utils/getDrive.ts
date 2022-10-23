'use strict';

import * as fs from 'fs';
import * as google from '@googleapis/drive';

import { getOAuth2Client, resolveCredentials } from './getOAuth2Client';

import { Params$UtilsGDrive } from '../index';
import { UtilsGDriveError } from './utilsGDriveError';

export interface Token$GoogleApi {
    access_token: string,
    refresh_token: string,
    scope: string,
    token_type: string,
    expiry_date: number
}

export function getDrive(params: Params$UtilsGDrive = {}): google.drive_v3.Drive {
  const credentials = resolveCredentials(params);
  const token = resolveToken(params);
  const oAuth2client = getOAuth2Client(credentials);
  oAuth2client.setCredentials(token);
  return google.drive({ version: 'v3', auth: oAuth2client });
}

function resolveToken(params: Params$UtilsGDrive = {}): Token$GoogleApi {
  if (params.token) { 
    if (typeof params.token === 'string') return destructToken(JSON.parse(params.token));
    return destructToken(params.token);
  } else if (params.pathToken) {
    return getTokenFile(params.pathToken);
  } else {
    try {
      return getTokenFile('tokenGDrive.json');
    } catch (err) {
      throw new UtilsGDriveError('Token not found.');
    }
  }
}

function getTokenFile(pathFile: string): Token$GoogleApi {
  let token = JSON.parse(fs.readFileSync(pathFile).toString());
  return destructToken(token);
}

function destructToken(json: Token$GoogleApi | { tokens: Token$GoogleApi }): Token$GoogleApi {
  if (Object.keys(json)[0] === 'tokens') return (json as { tokens: Token$GoogleApi }).tokens;
  return json as Token$GoogleApi;
}

