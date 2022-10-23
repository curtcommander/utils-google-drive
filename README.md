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
 - Flexible file/folder specification
 - Request throttling
 - Batch requests
 
## **Examples**
```javascript
const utilsGDrive = require('utils-google-drive');
 
/* get metadata */
// get id of file in Google Drive whose name is 'fileName'
// and whose parent folder is named 'parentName'
utilsGDrive.getFileId({
  fileName: 'fileName',
  parentName: 'parentName'
}).then(fileId => {console.log(fileId)});

/* download */
// download file 'excelFile.xlsx' in the folder 'dataFolder'
// to the local folder 'driveDownloads'
utilsGDrive.download({
  fileName: 'excelFile.xlsx',
  parentName: 'dataFolder'
}, 'path/to/driveDownloads');

/* upload */
// upload file 'report.pdf' to the folder in Google Drive
// with the id 'folderId'
utilsGDrive.upload({
  localPath: 'path/to/report.pdf',
  parentIdentifiers: 'folderId' 
});

/* move */
// move folder 'reports2020' to the folder 'reports'
utilsGDrive.move('path/to/reports2020', 'path/to/reports');

/* rename */
// change name of folder from 'beforeName' to 'afterName'
utilsGDrive.rename({folderName: 'beforeName'}, 'afterName');

/* delete */
// delete file with id 'fileId'
utilsGDrive.del('fileId');

/* make folder */
// make a new folder named 'newFolder' in the folder 'parentFolder'
utilsGDrive.makeFolder({
  folderName: 'newFolder',
  parentIdentifiers: {fileName: 'parentFolder'}
});

/* batch request */
// create array of objects
// each object in the array represents a request
const requests = [
 {
    url: 'https://www.googleapis.com/drive/v3/files?q=name%20%3D%20%22Daily%20Logs%22',
    method: 'GET',
 },
 {
    url: 'https://www.googleapis.com/drive/v3/files/fileId/watch',
    method: 'POST',
    data: {
      "kind": "api#channel",
      "id": "channelId"
       ...
    }
 }
];

// make batch request
utilsGDrive.batch(requests)
.then(responses => {console.log(responses)});

```

## **Installation**
```
npm i utils-google-drive
```
 
## **Setup**
You'll need to set up a Google Cloud project to access your user account's Google Drive. You'll also
need to enable the Google Drive API and create desktop application credentials in the Google Cloud Console.
Consult this [quickstart](https://developers.google.com/drive/api/v3/quickstart/nodejs) for steps for completing these prerequisites. Be sure you're logged in to the correct Google account when completing these tasks.

Once you've downloaded the credentials file, place it in your working directory and ensure it is named credentialsGDrive.json. The first time a method from utils-google-drive is executed, you'll be prompted in the console to authorize the app. Follow the link and enter the code. A file named tokenGDrive.json containing an authorization token will be created in your working directory and setup will then be complete.

## **Flexible file/folder specification**
utils-google-drive allows files and folders in Google Drive to be specified by either name or id. Information on the parent folder can and many times should also be included. Specifying a parent will resolve the ambiguity of trying to access a file or folder by name when there are multiple files/folders in Google Drive with that name.

Objects with the properties `fileId`, `fileName`, `parentId`, and `parentName` are generally used to specify a file or folder and are passed as arguments to utils-google-drive methods. For convenience, a string containing the file/folder id or path to the file or folder in Google Drive may be passed instead.

If specifying a path, partial paths can be used and are encouraged. Ideally, you would specify a partial path that contains just enough information to uniquely identify the file in Google Drive. For example, suppose you wanted to download the file 'annualReport.pdf' in the folder 'reports2020'. If there are multiple files named 'annualReport.pdf' in Google Drive but no other folders with the name 'reports2020', you could use the partial path `'reports2020/annualReport.pdf'` to identify the file of interest. This path is preferable to a longer one because it finds the file quicker, jumping in at the uniquely-named folder 'reports2020' and not worrying itself with folders that are higher up in the file path.

There is some variation in how to specify a file or folder across utils-google-drive methods. Consult the [docs](https://curtcommander.github.io/utils-google-drive/) for details.

## **Request Throttling**

utils-google-drive uses [throttled-queue](https://www.npmjs.com/package/throttled-queue) to throttle API requests. The default rate is 2 requests per 200 ms which complies with the Google Drive API's default rate limit of 1,000 requests per 100 seconds per user. You can adjust the throttle rate using the `nRequests` and `interval` variables in this package's index.js file. Note that setting an interval of less than 200 ms can cause performance issues.