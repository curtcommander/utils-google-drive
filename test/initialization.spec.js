'use strict';

import * as fs from 'fs';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

import { UtilsGDrive } from '../dist';

const pathCredentials = 'credentialsGDrive.json';
const pathToken = 'tokenGDrive.json';

const credentialsObject = {
  installed: {
    client_id: 'test',
    client_secret: 'test',
    redirect_uris: ['test'],
  },
};

const tokenObject = {
  tokens: { access_token: 'test' },
};

function parseClientId(credentialsObject) {
  return credentialsObject.installed.client_id;
}

function parseAccessToken(tokenObject) {
  return tokenObject.tokens.access_token;
}

const credentialsString = JSON.stringify(credentialsObject);
const tokenString = JSON.stringify(tokenObject);

let credentialsFileMocked;
let tokenFileMocked;

let clientIdTest;
let accessTokenTest;

beforeAll(() => {
  if (!fs.existsSync(pathCredentials)) {
    fs.writeFileSync(pathCredentials, credentialsString);
    credentialsFileMocked = true;
    clientIdTest = parseClientId(credentialsObject);
  } else {
    clientIdTest = parseClientId(
      JSON.parse(fs.readFileSync(pathCredentials).toString())
    );
  }

  if (!fs.existsSync(pathToken)) {
    fs.writeFileSync(pathToken, tokenString);
    tokenFileMocked = true;
    accessTokenTest = parseAccessToken(tokenObject);
  } else {
    accessTokenTest = parseAccessToken(
      JSON.parse(fs.readFileSync(pathToken).toString())
    );
  }
});

afterAll(() => {
  if (credentialsFileMocked) {
    fs.rmSync(pathCredentials);
  }

  if (tokenFileMocked) {
    fs.rmSync(pathToken);
  }
});

describe.concurrent('initialization', () => {
  test('initialize with credentials as string', () => {
    const credentials = fs.readFileSync(pathCredentials).toString();

    const utilsGDrive = new UtilsGDrive({ credentials });
    const clientIdInit = utilsGDrive.drive.context._options.auth._clientId;

    expect(clientIdInit).toEqual(clientIdTest);
  });

  test('initialize with credentials as object', () => {
    const credentials = JSON.parse(fs.readFileSync(pathCredentials).toString());

    const utilsGDrive = new UtilsGDrive({ credentials });
    const clientIdInit = utilsGDrive.drive.context._options.auth._clientId;

    expect(clientIdInit).toEqual(clientIdTest);
  });

  test('initialize with path to credentials', () => {
    const utilsGDrive = new UtilsGDrive({ pathCredentials });
    const clientIdInit = utilsGDrive.drive.context._options.auth._clientId;

    expect(clientIdInit).toEqual(clientIdTest);
  });

  test('initialize with token as string', () => {
    const token = fs.readFileSync(pathToken).toString();

    const utilsGDrive = new UtilsGDrive({ token });
    const accessTokenInit =
      utilsGDrive.drive.context._options.auth.credentials.access_token;

    expect(accessTokenInit).toEqual(accessTokenTest);
  });

  test('initialize with token as object', () => {
    const token = JSON.parse(fs.readFileSync(pathToken).toString());

    const utilsGDrive = new UtilsGDrive({ token: JSON.stringify(token) });
    const accessTokenInit =
      utilsGDrive.drive.context._options.auth.credentials.access_token;

    expect(accessTokenInit).toEqual(accessTokenTest);
  });

  test('initialize with path to token', () => {
    const utilsGDrive = new UtilsGDrive({ pathToken });
    const accessTokenInit =
      utilsGDrive.drive.context._options.auth.credentials.access_token;

    expect(accessTokenInit).toEqual(accessTokenTest);
  });

  test('empty initialization', () => {
    const utilsGDrive = new UtilsGDrive();
    const accessToken =
      utilsGDrive.drive.context._options.auth.credentials.access_token;
    const clientId = utilsGDrive.drive.context._options.auth._clientId;

    expect(accessToken).toEqual(accessTokenTest);
    expect(clientId).toBeDefined(clientIdTest);
  });

  test('initialize with opts specified and params set as null', () => {
    const initialize = () => new UtilsGDrive(null, {});

    expect(initialize).not.toThrowError();
  });
});
