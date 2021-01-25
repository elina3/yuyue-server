/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/yuyue-system-pro',
  app: {
    title: 'YUYUE-SYSTEM - Production Environment'
  },
  serverAddress:'http://localhost/',
  port: process.env.PORT || 80,
  wechat_ext: {//医院公众号信息
    app_id: 'wx84f82babe25f6b05',
    app_secret: 'df2d1036887d6a2ecfc28d20eca0fe64'
  },
  sql: {
    host: '172.28.30.246'//医院内部门诊报告数据库host
  },
  ali_sms: {
    sign: '瑞金医院',
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
