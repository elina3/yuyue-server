/**
 * Created by elinaguo on 15/12/19.
 */
'use strict';
var aliSMSConfig = require('../config/config').ali_sms;

const Core = require('@alicloud/pop-core');
var client = new Core(aliSMSConfig.configuration);

// ,
// ali_sms: {
//   accessKeyId: '<accessKeyId>',
//       accessKeySecret: '<accessSecret>',
//       endpoint: 'https://dysmsapi.aliyuncs.com',
//       apiVersion: '2017-05-25'
// }

function sendSMS(phone, templateCode, templateParamObj, callback) {
  var templateParamString = JSON.stringify(templateParamObj);
  client.request('SendSms', {
    RegionId: aliSMSConfig.regionId,
    PhoneNumbers: phone,
    SignName: aliSMSConfig.sign,
    TemplateCode: templateCode,
    TemplateParam: templateParamString,
  }, {
    method: 'POST',
  }).then((result) => {
    console.log(JSON.stringify(result));

    if (result.Code === 'OK') {
      console.log('发送成功！');
      return callback();
    }

    return callback({
      err: {
        type: result.Code,
        message: result.Code || 'send failed',
        zh_message: result.Message || '发送失败',
      },
    });
  }, (ex) => {
    console.error(ex);
    var errObj = {};
    if (ex && ex.data) {
      errObj.type = ex.data.Code || 'system_error';
      errObj.message = ex.data.Code || 'system_error';
      errObj.zh_message = ex.data.Message || '';
    }
    return callback({
      err: errObj,
    });
  });
}

function sendBatchSms(phones, templateCode, templateParamObjs, callback) {
  let params = {
    'RegionId': aliSMSConfig.regionId,
    'PhoneNumberJson': JSON.stringify(phones),
    'SignNameJson': JSON.stringify(
      phones.map(function () {
        return aliSMSConfig.sign;
      })),
    'TemplateCode': templateCode,
    'TemplateParamJson': JSON.stringify(templateParamObjs)
  };

  console.log(params);

  client.request('SendBatchSms', params, {method: 'POST'}).then((result) => {
    if (result.Code === 'OK') {
      return callback();
    }
    return callback({
      err: {
        type: result.Code,
        message: result.Code || 'send failed',
        zh_message: result.Message || '发送失败',
      },
    });
  }, (ex) => {
    console.error(ex);
    var errObj = {};
    if (ex && ex.data) {
      errObj.type = ex.data.Code || 'system_error';
      errObj.message = ex.data.Code || 'system_error';
      errObj.zh_message = ex.data.Message || '';
    }
    return callback({
      err: errObj,
    });
  });
}

exports.sendSMS = sendSMS;
exports.sendBatchSms = sendBatchSms;

exports.sendAppointmentSuccessBySMS = function (appointmentInfo, callback) {
  appointmentInfo = appointmentInfo || {
    name: '郭姗姗',
    mobilePhone: '18321740710',
  };
  console.log(appointmentInfo);
  var templateParam = {
    name: appointmentInfo.name,
    hospitalName: aliSMSConfig.hospitalName,
    department: appointmentInfo.department.name + '-' + appointmentInfo.doctorName + '医生',
    time: appointmentInfo.time.Format('yyyy-MM-dd hh:mm'),
  };

  sendSMS(appointmentInfo.mobilePhone,
    aliSMSConfig.templates.appointment_success, templateParam, callback);
};

exports.sendAppointmentCanceledBySMS = function (appointmentInfo, callback) {
  appointmentInfo = appointmentInfo || {
    name: '郭姗姗',
    mobilePhone: '18321740710',
  };
  var templateParam = {
    name: appointmentInfo.name,
    hospital: aliSMSConfig.hospitalName,
    department: appointmentInfo.department.name + '-' + appointmentInfo.doctorName + '医生',
    time: appointmentInfo.time.Format('yyyy-MM-dd hh:mm'),
  };

  sendSMS(appointmentInfo.mobilePhone,
    aliSMSConfig.templates.cancel_appointment, templateParam, callback);
};

exports.sendAppointmentStoppedBySMS = function (phones, appointmentInfos, callback) {
  phones = phones || ['18321740710', '18321740710'];
  sendBatchSms(phones, aliSMSConfig.templates.stop_appointment,
    appointmentInfos.map(function (item) {
      return {
        name: item.name,
        hospital: aliSMSConfig.hospitalName,
        department: item.department + '-' + item.doctorName + '医生',
        time: item.time
      };
    }), callback);
};
exports.sendAppointmentRepeatStartBySMS = function (phones, appointmentInfos, callback) {
  phones = phones || ['18321740710', '18321740710'];
  sendBatchSms(phones, aliSMSConfig.templates.begin_to_treat,
    appointmentInfos.map(function (item) {
      return {
        name: item.name,
        doctor: item.department + '-' + item.doctorName + '医生',
        date: item.time
      };
    }), callback);
};
exports.sendAppointmentChangedBySMS = function (phones, appointmentInfos, callback) {
  phones = phones || ['18321740710', '18321740710'];
  sendBatchSms(phones, aliSMSConfig.templates.appointment_time_changed,
    appointmentInfos.map(function (item) {
      return {
        name: item.name,
        doctor: item.department + '-' + item.doctorName + '医生',
        date: item.time
      };
    }), callback);
};