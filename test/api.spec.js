'use strict';

import { describe, test, expect, vi } from 'vitest';

import { UtilsGDrive } from '../dist';
import { ApplyExpBack } from '../dist/utils/ApplyExpBack';

const maxRetries = 1;
const timeouts = {
  1: 5000,
  2: 10000
}

const timeout = timeouts[maxRetries];

describe.concurrent('api', () => {
  
  test('can make requests to api', async () => {
    const utilsGDrive = new UtilsGDrive();

    const res = await utilsGDrive.call('files', 'get', { fileId: 'root' });

    expect(res).toBeTypeOf('object');    
  })

  test('rate limits api calls', async () => {
    const interval = 2000;
    const utilsGDrive = new UtilsGDrive(null, {
      rateLimiter: { tokensPerInterval: 1, interval }
    });

    const time = await timeAsyncFn(async () => {
      await Promise.all([
        utilsGDrive.getFileName('root'),
        utilsGDrive.getFileName('root')
      ]);
    })
    
    expect(time).toBeGreaterThanOrEqual(interval);
  }, timeout);

  describe('exponential backoff', () => {
    
    test.concurrent('doesn\'t retry when no error is thrown', async () => {
      const fn = vi.fn(() => true);
      const fnExpBackApplied = ApplyExpBack(fn, { maxRetries });

      await fnExpBackApplied().catch(() => {});

      expect(fn).toHaveBeenCalledTimes(1);      
    })

    test.concurrent('retries up to the max number of retries', async () => {
      const fn = vi.fn(() => { throw new Error() });
      const fnExpBackApplied = ApplyExpBack(fn, { maxRetries });

      await fnExpBackApplied().catch(() => {});

      expect(fn).toHaveBeenCalledTimes(maxRetries + 1);
    }, timeout)
  
    const waitTime = getWaitTime(maxRetries);
  
    test.concurrent('delays execution on subsequent retries', async () => {
      const fn = () => { throw new Error() };
      const fnExpBackApplied = ApplyExpBack(fn, { maxRetries });

      const time = await timeAsyncFn(fnExpBackApplied);

      expect(time).toBeGreaterThan(waitTime);

    }, timeout)

  })
})

async function timeAsyncFn(fn) {
  const start = new Date();
  await fn().catch(() => {});
  return new Date() - start;
}

function getWaitTime(nRetries) {
  let cursor = nRetries;
  let waitTime = 0;
  while (cursor) {
    waitTime += 2 ** (cursor - 1) * 1000;
    cursor--;
  }
  return waitTime;
}