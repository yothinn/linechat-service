'use strict'

const app = require('./express');
const mongoose = require('./mongoose');

mongoose.connection();

module.exports = app;