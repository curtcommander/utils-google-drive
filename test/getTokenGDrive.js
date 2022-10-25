#!/usr/bin/env node
'use strict';

const { getTokenGDrive } = require('../dist');
getTokenGDrive().catch(console.error);