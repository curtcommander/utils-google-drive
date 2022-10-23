'use strict';

export class UtilsGDriveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UtilsGDriveError';
  }
};