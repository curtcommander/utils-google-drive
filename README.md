# **utils-google-drive**
[![Build Status](https://app.travis-ci.com/curtcommander/utils-google-drive.svg?token=jR69Hp9NULPTcnnmq5Z7&branch=main)](https://app.travis-ci.com/curtcommander/utils-google-drive)
[![npm version](https://badge.fury.io/js/utils-google-drive.svg)](https://www.npmjs.com/package/utils-google-drive)
[![repo](https://img.shields.io/badge/repo-gray.svg)](https://github.com/curtcommander/utils-google-drive)
[![docs](https://img.shields.io/badge/docs-gray.svg)](https://curtcommander.github.io/utils-google-drive/)

A simple and flexible package for interacting with Google Drive.

Perform the following actions on files and folders in Google Drive:
 - Get metadata
 - Download
 - Upload
 - Move
 - Rename
 - Delete
 - Make folders

Also features:
 - Batch requests
 - Flexible file/folder specification
 - Rate limiting
 - Exponential backoff
 
## **Examples**
```javascript
const { UtilsGDrive } = require('utils-google-drive');
const utilsGDrive = new UtilsGDrive({
  pathCredentials: 'path/to/credentials.json',
  pathToken: 'path/to/token.json'
});
 
// get id of file in Google Drive whose name is 'todos.txt'
// and whose parent folder is named 'lists'
utilsGDrive.getFileId({
  fileName: 'todos.txt',
  parentName: 'lists'
}).then(fileId => { console.log(fileId) });

// download file 'transactions.xlsx' in the folder 'dataDrive'
// to the local folder 'dataLocal'
utilsGDrive.download({
  fileName: 'transactions.xlsx',
  parentName: 'dataDrive'
}, 'path/to/dataLocal');

// upload file 'report.pdf' to the folder in Google Drive
// with the id 'XXX123XXX'
utilsGDrive.upload({
  localPath: 'path/to/report.pdf',
  parentIdentifiers: 'XXX123XXX' 
});

// move folder '2022' to the folder 'reports'
utilsGDrive.move('path/to/2022', 'path/to/reports');

// change name of folder from 'repolts' to 'reports'
utilsGDrive.rename({folderName: 'repolts'}, 'reports');

// delete file with id 'XXX123XXX'
utilsGDrive.del('XXX123XXX');

// make a new folder named 'Colombia' in the folder 'countries'
utilsGDrive.makeFolder({
  folderName: 'Colombia',
  parentIdentifiers: { fileName: 'countries' }
});

// make a batch request
const requests = [
  {
    url: 'https://www.googleapis.com/drive/v3/files?q=name%20%3D%20%22FILE%22',
    method: 'GET',
  },
  {
    url: 'https://www.googleapis.com/drive/v3/files/fileId/watch',
    method: 'POST',
    data: {
      'kind': 'api#channel',
      'id': 'channelId'
    }
  }
];

utilsGDrive.batch(requests).then(responses => {
  console.log(responses);
});

```

## **Installation**
```
npm i utils-google-drive
```

## **Setup**
You'll need to set up a Google Cloud project to access your user account's Google Drive. You'll also
need to enable the Google Drive API and create desktop application credentials in the Google Cloud Console.
Consult this [quickstart](https://developers.google.com/drive/api/v3/quickstart/nodejs) for steps on how to complete these prerequisites. Be sure you're logged in to the correct Google account when completing these tasks.

You'll also need to get an access token after you've downloaded the credentials from the Google Cloud Console. A stand-alone function named `getTokenGDrive` is included in this package and facilitates obtaining an access token. Simply import the function and call it:

```javascript
const { getTokenGDrive } = require('utils-google-drive');
getTokenGDrive({ pathCredentials: 'path/to/credentials.json' });

```

## **Flexible File/Folder Specification**
utils-google-drive allows files and folders in Google Drive to be specified by either name or id. Information on the parent folder can and many times should also be included. Specifying a parent will resolve the ambiguity of trying to access a file or folder by name when there are multiple files/folders in Google Drive with that name.

Objects with the properties `fileId`, `fileName`, `parentId`, and `parentName` are generally used to specify a file or folder and are passed as arguments to utils-google-drive methods. For convenience, a string containing the file/folder id or path to the file or folder in Google Drive may be passed instead.

If specifying a path, partial paths can be used and are encouraged. Ideally, you would specify a partial path that contains just enough information to uniquely identify the file in Google Drive. For example, suppose you wanted to download the file "annualReport.pdf" in the folder "reports_2022". If there are multiple files named "annualReport.pdf" in Google Drive but no other folders with the name "reports_2022", you could use the partial path "reports_2022/annualReport.pdf" to identify the file of interest. This path is preferable to a longer one because it finds the file quicker, jumping in at the uniquely named folder "reports_2022" and not worrying itself with folders that are higher up in the file path.

There is some variation regarding how to specify a file or folder across utils-google-drive methods. When in doubt, consult the [docs](https://curtcommander.github.io/utils-google-drive/).

As a best practice, favor specifying ids over filenames. Under the hood, a filename is resolved to an id with an extra API call. Specify and work with ids where you can to avoid making these extra API calls and improve performance.

## **Rate Limiting**

utils-google-drive performs client-side rate limiting. The default is 1,000 requests per 100 seconds, which is the same as Google's default per-user rate limit. You can configure the rate limit as an option when initializing the `UtilsGDrive` base class:

```javascript
const { UtilsGDrive } = require('utils-google-drive');

const utilsGDrive = new UtilsGDrive(null, {
  // rate limit of 10 requests per second
  rateLimiter: {
    tokensPerInterval: 10,
    interval: 1000
  }
});

```

## **Exponential Backoff**

You can also configure how exponential backoff is implemented as one of the `UtilsGDrive` base class's options. An API call is retried a maximum of three times for any error thrown by default, but you can change the max number of retries as well as provide your own function for determining what errors warrant a retry.

```javascript
const { UtilsGDrive } = require('utils-google-drive');

const utilsGDrive = new UtilsGDrive(null, {
  expBack: {
    // only 5xx errors should be retried
    shouldRetry: error => Number(error.code) >= 500,
    // max number of retries is 5
    maxRetries: 5
  }
});

```
