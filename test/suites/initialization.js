'use strict';

const assert = require('assert').strict;
const fs = require('fs');

const { UtilsGDrive } = require('../../dist');

module.exports = { initialization };

function initialization(timeout) {

    describe('initialization', function() {
        if (timeout) this.timeout(timeout);

        it('initialize with credentials as string', async function() {
            const credentials = fs.readFileSync('test/testFiles/credentialsGDrive.json').toString();
            const utilsGDrive = new UtilsGDrive({ credentials });
            const clientId = utilsGDrive.drive.context._options.auth._clientId;
            assert(clientId === 'test');
        })

        it('initialize with credentials as object', async function() {
            const credentials = JSON.parse(fs.readFileSync('test/testFiles/credentialsGDrive.json').toString());
            const utilsGDrive = new UtilsGDrive({ credentials: JSON.stringify(credentials) });
            const clientId = utilsGDrive.drive.context._options.auth._clientId;
            assert(clientId === 'test');
        })
    
        it('initialize with path to credentials', async function() {
            const utilsGDrive = new UtilsGDrive({ pathCredentials: 'test/testFiles/credentialsGDrive.json' });
            const clientId = utilsGDrive.drive.context._options.auth._clientId;
            assert(clientId === 'test');
        })
    
        it('initialize with token as string', async function() {
            const token = fs.readFileSync('test/testFiles/tokenGDrive.json').toString();
            const utilsGDrive = new UtilsGDrive({ token });
            const accessToken = utilsGDrive.drive.context._options.auth.credentials.access_token;
            assert(accessToken === 'test');
        })

        it('initialize with token as object', async function() {
            const token = JSON.parse(fs.readFileSync('test/testFiles/tokenGDrive.json').toString());
            const utilsGDrive = new UtilsGDrive({ token: JSON.stringify(token) });
            const accessToken = utilsGDrive.drive.context._options.auth.credentials.access_token;
            assert(accessToken === 'test');
        })
    
        it('initialize with path to token', async function() {
            const utilsGDrive = new UtilsGDrive({ pathToken: 'test/testFiles/tokenGDrive.json' });
            const accessToken = utilsGDrive.drive.context._options.auth.credentials.access_token;
            assert(accessToken === 'test');
        })
    
        it('default initialization', async function() {
            const utilsGDrive = new UtilsGDrive();
            const accessToken = utilsGDrive.drive.context._options.auth.credentials.access_token;
            const clientId = utilsGDrive.drive.context._options.auth._clientId;
            const clientSecret = utilsGDrive.drive.context._options.auth._clientSecret;
            assert(accessToken && clientId && clientSecret);
        })

        it('initialize with opts specified and params set as null', async function() {
            new UtilsGDrive(null, {});
            assert(true);
        })
    })
}
