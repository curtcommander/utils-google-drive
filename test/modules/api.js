'use strict';

const assert = require('assert').strict;

const { UtilsGDrive } = require('../../dist');

const vals = require('../vals');

const utilsGDrive = new UtilsGDrive();

module.exports = { api };

function api(timeout) {

  describe('api', function() {
    if (timeout) this.timeout(timeout);

    let canMakeRequests;
    it('can make requests to api', async function() {
      const responseData = await utilsGDrive.call('files', 'get', {
        fileId: vals.fileIdTest,
      })
      if (responseData) canMakeRequests = true;
      assert(canMakeRequests);
    })

    it('rate limits api calls', async function() {
      if (!canMakeRequests) this.skip();
      const interval = 5000;
      const utilsGDrive = new UtilsGDrive(null, {
        rateLimiter: { tokensPerInterval: 1, interval }
      });

      const start = new Date();
      await Promise.all([
        await utilsGDrive.getFileName('root'),
        await utilsGDrive.getFileName('root')
      ]);
      const end = new Date();
      
      const time = end - start;
      assert(time > interval);
    });

    // it('performs exponential backoff', function() {
      // if (!canMakeRequests) this.skip();
    // })

  })

}