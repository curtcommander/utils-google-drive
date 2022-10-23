'use strict';

const assert = require('assert').strict;

const { UtilsGDrive } = require('../../dist');

const utilsGDrive = new UtilsGDrive();

module.exports = { errors };

function errors(timeout) {

    describe('errors', function() {
        if (timeout) this.timeout(timeout);

        const consoleError = console.error;
        let output;

        beforeEach(function(done) {
            output = '';
            console.error = (msg) => {
                output += msg + '\n';
            };
            done();
        })

        afterEach(function() {
            console.error = consoleError;
            if (this.currentTest.state === 'failed') {
                console.error(output);
            }
        })

        it('call(), handle error from response', function() {
            assert.rejects(async () => {
                await utilsGDrive.call('files', 'list', {q: 'test1234'});
            })
        })

        it('getFiles(), file id not specified', function() {
            assert.rejects(async function() {
                await utilsGDrive.getFiles({shouldBeFileId: 'foo'});
            }, utilsGDrive.Error);
        })

        it('updateFiles(), file id not specified', function() {
            assert.rejects(async function() {
                await utilsGDrive.updateFiles({shouldBeFileId: 'foo'});
            }, utilsGDrive.Error);
        })

        it('getMimeType(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.getMimeType({f: fileIdTest});
            })
        })

        it('listChildren(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.listChildren({f: fileIdTest}, 'files(id)');
            })
        })

        it('download(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.download({f: 'test'}, '.');
            })
        })

        it('upload(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.upload({
                    localPath: 'test',
                    parentIdentifiers: {f: 'test'},
                })
            })
        })

        it('makeFolder(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.makeFolder({
                    folderName: 'test',
                    parentIdentifiers: {f: 'test'},
                })
            })
        })

        it('move(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.move({f: 'test'});
            })
        })

        it('rename(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.rename({f: 'test'});
            })
        })

        it('del(), invalid identifier name', async function() {
            assert.rejects(async () => {
                await utilsGDrive.del({f: fileIdTest});
            })
        })

    })
    
}
