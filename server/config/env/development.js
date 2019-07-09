'use strict';

module.exports = {
    appDb: 'mongodb://localhost/yuyue-system-dev',
    app: {
        title: 'YUYUE-SYSTEM - Development Environment'
    },
    serverAddress:'http://localhost:3302/',
    port: process.env.PORT || 3302,
    wechat_ext: {
        app_id: "",
        app_secret: ""
    },
    sql: {
        host: 'mh-rjgb.com'
    }
};
