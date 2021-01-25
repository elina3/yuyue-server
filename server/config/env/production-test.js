/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/yueyue-system-pro-test',
  app: {
    title: 'YUYUE-SYSTEM - Production Test Environment'
  },
  serverAddress: 'http://localhost/',
  port: process.env.PORT || 80,
  wechat_ext: {//茼蒿科技公众号信息
    app_id: "wxa6210d998dd41246",
    app_secret: "f55b2c01ab809977f21b69e615861621",
    notify_templates: {
      appointment_success: 'Yfq-gXXiCPv9bxjOuKQ9f_s_CAdu6C7VgH22z-Wc_zE',
      appointment_cancel: 'ude3bVcu-7vJmg-3R15WHQenHWmN_W1UcDLNRwL4K4s',
      doctor_close: '75hkUvplEgxpv4CWkLjcLkoocLv-1djWdDbssbJKF1M'
    }
  },
  sql: {
    host: 'mh-rjgb.com'
  },
  ali_sms: {
    sign: '茼蒿科技',
    regionId: 'cn-hangzhou',
    hospitalName: '上海瑞金医院古北分院',
    configuration: {
      accessKeyId: '<accessKeyId>',
      accessKeySecret: '<accessSecret>',
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
