/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/yuyue-system-pro',
  app: {
    title: 'YUYUE-SYSTEM - Production Environment'
  },
  serverAddress:'https://localhost:3302/',
  port: process.env.PORT || 3302,
  wechat_ext: {
    app_id: "",
    app_secret: ""
  },
};
