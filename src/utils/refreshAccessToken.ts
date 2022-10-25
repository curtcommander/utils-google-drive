'use strict';

import * as gaxios from 'gaxios';
import * as fs from 'fs';
import { OAuth2Client } from '@googleapis/drive/node_modules/google-auth-library';

import { UtilsGDrive } from '..';

interface RefreshTokenOpts {
  url: 'https://accounts.google.com/o/oauth2/token',
  method: 'POST',
  body?: string
}

const refreshTokenOpts: RefreshTokenOpts = {
  url: 'https://accounts.google.com/o/oauth2/token',
  method: 'POST',
}

interface ResponseRefreshToken {
  access_token: string,
  expires_in: number,
  scope: string,
  token_type: string
}

export async function refreshAccessToken(utilsGDrive: UtilsGDrive) {
  const oAuth2Client = utilsGDrive.drive.permissions.context._options.auth as OAuth2Client;
  refreshTokenOpts.body = JSON.stringify({
    client_id: oAuth2Client._clientId,
    client_secret: oAuth2Client._clientSecret,
    refresh_token: oAuth2Client.credentials.refresh_token,
    grant_type: 'refresh_token'
  });
  const res = await gaxios.request<ResponseRefreshToken>(refreshTokenOpts);

  const tokenGDrive = JSON.parse(fs.readFileSync('tokenGDrive.json').toString());
  tokenGDrive.access_token = res.data.access_token;
  const expiryDate = new Date().getTime() + res.data.expires_in - 60;
  tokenGDrive.expiry_date = expiryDate;
  fs.writeFileSync('tokenGDrive.json', JSON.stringify(tokenGDrive));
  return tokenGDrive.access_token;
}
