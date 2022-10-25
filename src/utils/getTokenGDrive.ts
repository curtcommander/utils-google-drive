'use strict';

import * as fs from 'fs';
import * as readline from 'readline';

import { Credentials$GoogleApi, getOAuth2Client, resolveCredentials } from './getOAuth2Client';

/**
 * Parameters for getting a token for accessing Google Drive API.
 */
export interface Params$GetTokenGDrive {
  /**
   * Authentication credentials.
   */
  credentials?: string | Credentials$GoogleApi,
  /**
   * Path to file containing authentication credentials.
   */
  pathCredentials?: string,
  /**
   * OAuth 2.0 scope for accessing Google Drive API.
   * Consult https://developers.google.com/identity/protocols/oauth2/scopes
   * for details on the scopes to choose from.
   */
  scope?: string,
  /**
   * Location where token should be written.
   */
  pathOut?: string
}

/**
 * Gets and stores a token for making calls to the Google Drive API.
 * Default scope is `https://www.googleapis.com/auth/drive` if `params.scope` isn't specified.
 * Writes to ./tokenGDrive.json if `params.pathOut` isn't specified.
 */
export function getTokenGDrive(params: Params$GetTokenGDrive = {
  scope: 'https://www.googleapis.com/auth/drive',
  pathOut: 'tokenGDrive.json'
}): Promise<void> {
  const credentials = resolveCredentials(params);
  const oAuth2Client = getOAuth2Client(credentials);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [params.scope],
  });

  console.log('Authorize this app by visiting this url:\n\n' + authUrl + '\n');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', async (code: string) => {
      rl.close();
      const token = await oAuth2Client.getToken(code);
      fs.writeFileSync(params.pathOut, JSON.stringify(token));
      console.log(`Token stored to ${params.pathOut}\n`);
      resolve();
    })
  })
}

