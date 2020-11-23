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
    },
    ali_sms: {
        sign: '茼蒿科技',
        regionId: 'cn-hangzhou',
        hospitalName: '上海瑞金医院古北分院',
        configuration: {
          accessKeyId: 'LTAI4G62xjd8TEWAHheAqMPv',
          accessKeySecret: 'Y593lANAAPfYJeoppoA6jqMbZX8WxH',
          endpoint: 'https://dysmsapi.aliyuncs.com',
          apiVersion: '2017-05-25'
        },
        templates: {
          stop_appointment: 'SMS_205585561',
          cancel_appointment: 'SMS_205580628',
          appointment_success: 'SMS_205580630'
        }
    }
};
