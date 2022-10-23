#!/usr/bin/env node
'use strict';

const { getToken } = require('../dist');

getToken().catch(console.error);