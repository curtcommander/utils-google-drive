'use strict';

import * as fs from 'fs';
import * as google from '@googleapis/drive';
import { OAuth2Client } from '@googleapis/drive/node_modules/google-auth-library';

import { Params$UtilsGDrive } from '../index';
import { UtilsGDriveError } from './utilsGDriveError';

export interface Credentials$GoogleApi {
  installed: {
      client_secret: string,
      client_id: string,
      redirect_uris: string
  }
}

export function getOAuth2Client(credentials: Credentials$GoogleApi): OAuth2Client {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  return oAuth2Client;
}

export function resolveCredentials(params: Params$UtilsGDrive = {}): Credentials$GoogleApi {
    if (params.credentials) { 
      if (typeof params.credentials === 'string') return JSON.parse(params.credentials);
      return params.credentials;
    } else if (params.pathCredentials) {
        return JSON.parse(fs.readFileSync(params.pathCredentials).toString());
    } else {
      try {
        return JSON.parse(fs.readFileSync('credentialsGDrive.json').toString());
      } catch (err) {
        throw new UtilsGDriveError('Credentials not found.');
      }
    }
  }
  