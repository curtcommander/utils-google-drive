'use strict';

import * as fs from 'fs';
import * as readline from 'readline';

import { getOAuth2Client, resolveCredentials } from './getOAuth2Client';

export function getTokenGDrive(pathOut = 'tokenGDrive.json'): Promise<void> {
  const credentials = resolveCredentials();
  const oAuth2Client = getOAuth2Client(credentials);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
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
      fs.writeFileSync(pathOut, JSON.stringify(token));
      console.log(`Token stored to ${pathOut}\n`);
      resolve();
    })
  })
  
}

