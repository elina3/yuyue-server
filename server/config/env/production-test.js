/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/yueyue-system-pro-test',
  app: {
    title: 'YUYUE-SYSTEM - Production Test Environment'
  },
  serverAddress:'https://localhost:7001/',
  port: process.env.PORT || 7001
};
