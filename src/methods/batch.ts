'use strict';

import * as gaxios from 'gaxios';
import { OAuth2Client } from '@googleapis/drive/node_modules/google-auth-library';

import { UtilsGDrive } from '..';
import { refreshAccessToken } from '../utils/refreshAccessToken';
import { UtilsGDriveError } from '../utils/utilsGDriveError';
import { ApplyExpBack } from '../utils/ApplyExpBack';

export interface Call$Batch {
  url: string,
  method: 'GET' | 'HEAD' | 'POST' | 'DELETE' | 'PUT' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH',
  data: Record<string, any>,
  headers: { Authorization: string }
}

export interface Response$Batch extends Call$Batch {
  responseStatus: number,
  responseData: Record<string, any>
}

/**
 * Make a batch request.
 */
export async function batch(this: UtilsGDrive, calls: Call$Batch[]): Promise<Response$Batch[]>  { 
  if (calls.length > 100) {
    throw new UtilsGDriveError(`Number of calls in batch request exceeds limit of 100: ${calls.length}`);
  }

  // refresh access token if needed
  const credentials = (this.drive.permissions.context._options.auth as OAuth2Client).credentials;
  const tokenType = credentials.token_type;
  const accessToken = credentials.access_token;
  let token = [ tokenType, accessToken ].join(' ');

  try {
    await ApplyExpBack(async () => {
      await this.limiter.removeTokens(1);
      return gaxios.request({ ...calls[0], headers: { Authorization: token } });
    }, this.optsExpBack)();
  } catch (e) {
    if (e.response.status === 401) {
      const newAccessToken = await refreshAccessToken(this);
      token = [tokenType, newAccessToken].join(' ');
    }
  }

  // individual calls
  const reqTexts = [];
  for (const call of calls) {
    const reqHeaders =
      `${call.method} ${call.url}\n` +
      `Authorization: ${token}\n` +
      `Content-Type: application/json; charset=UTF-8`;
    const reqText = reqHeaders + '\r\n\r\n' + JSON.stringify(call.data);
    reqTexts.push(reqText);
  }

  // parts
  const boundary = 'END_OF_PART';
  const partHeader = `--${boundary}\nContent-Type: application/http`;
  const partTexts = [];
  for (const reqText of reqTexts) {
    const partText = partHeader + '\n\r\n' + reqText + '\r\n';
    partTexts.push(partText);
  }

  // batch request
  const batchRequestText = partTexts.slice(0, 2).join('') + `--${boundary}--`;
  const batchResponse = await ApplyExpBack(async () => {
    await this.limiter.removeTokens(1);
    return gaxios.request<string>({
      url: 'https://www.googleapis.com/batch/drive/v3',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/mixed; boundary='+boundary,
      },
      data: batchRequestText
    })
  }, this.optsExpBack)();

  // parse batch response data
  const resData = batchResponse.data;
  const resBoundary = resData.slice(0, resData.indexOf('\r\n'));
  const responseStrings = resData.split(resBoundary).slice(1, -1);

  const responses: Response$Batch[] = [];
  for (let i = 0; i < responseStrings.length; ++i) {
    const responseString = responseStrings[i];
    const statusLine = responseString.match(/HTTP.*/)[0];
    const status = Number(statusLine.match(/ .* /)[0].slice(1, -1));
    const data = JSON.parse(responseString.match(/{[^]*}/)[0]);
    const response: Response$Batch = {
      ...calls[i],
      responseStatus: status,
      responseData: data
    }
    responses.push(response);
  }

  return responses;
}
