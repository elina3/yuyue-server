'use strict';

module.exports = {
  appDb: 'mongodb://localhost/yuyue-system-dev',
  app: {
    title: 'YUYUE-SYSTEM - Development Environment'
  },
  serverAddress: 'http://localhost:3302/',
  port: process.env.PORT || 3302,
  wechat_ext: {
    app_id: "wxa6210d998dd41246",
    app_secret: "f55b2c01ab809977f21b69e615861621",
    notify_templates: {
      appointment_success: 'Yfq-gXXiCPv9bxjOuKQ9f_s_CAdu6C7VgH22z-Wc_zE',
      appointment_cancel: 'ude3bVcu-7vJmg-3R15WHQenHWmN_W1UcDLNRwL4K4s',
      doctor_close: '75hkUvplEgxpv4CWkLjcLkoocLv-1djWdDbssbJKF1M',
      doctor_open: 'ULePGhpi36TMYvEssA-Y152pi_PpKTjRCFukI5vP_rM'
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
      appointment_success: 'SMS_205580630',
      begin_to_treat: 'SMS_211499278'
    }
  }
};
