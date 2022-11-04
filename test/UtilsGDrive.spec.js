'use strict';

const { initialization } = require('./suites/initialization');
const { api } = require('./suites/api');
const { resolveIdentifiers } = require('./suites/resolveIdentifiers');
const { errors } = require('./suites/errors');
const { methods } = require('./suites/methods');

describe('UtilsGDrive', function() {
  this.timeout(10000);
  initialization();
  api();
  resolveIdentifiers();
  errors();
  methods(25000);
})
