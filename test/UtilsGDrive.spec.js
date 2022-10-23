'use strict';

const { initialization } = require('./modules/initialization');
const { api } = require('./modules/api');
const { resolveIdentifiers } = require('./modules/resolveIdentifiers');
const { errors } = require('./modules/errors');
const { methods } = require('./modules/methods');

describe('UtilsGDrive', function() {
  this.timeout(10000);
  initialization();
  api();
  resolveIdentifiers();
  errors();
  methods(25000);
})
