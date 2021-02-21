/**
 * Created by elinaguo on 15/12/19.
 */
'use strict';
var agent = require('superagent').agent();
var wechatError = require('../errors/wechat');

var config = require('../config/config');
//微信前端通过code获取用户信息
exports.getOpenIdByCode = function (code, callback) {
  var tokenUrl = `${config.wechat.getTokenByCodeUrl}?appid=${config.wechat_ext.app_id}&secret=${config.wechat_ext.app_secret}&code=${code}&grant_type=authorization_code`;
  console.error(tokenUrl);
  agent.get(tokenUrl)
    .end(function (err, res) {
      if (err) {
        console.error('get wechat access_token error:', err);
        return callback(err);
      }

      // {
      //   "access_token":"ACCESS_TOKEN",
      //   "expires_in":7200,
      //   "refresh_token":"REFRESH_TOKEN",
      //   "openid":"OPENID",
      //   "scope":"SCOPE"
      // }
      console.error('access_token result:', res.text);
      let resultObj = JSON.parse(res.text);
      if (!resultObj.access_token) {
        return callback({err: wechatError.access_token_failed});
      }
      if (!resultObj.openid) {
        return callback({err: wechatError.openid_failed});
      }

      var wechatInfoUrl = `${config.wechat.getUserInfoByToken}?access_token=${resultObj.access_token}&openid=${resultObj.openid}&lang=zh_CN`;
      agent.get(wechatInfoUrl)
        .end(function (err, res) {
          if (err) {
            console.error('get wechat info error:', err);
            return callback(err);
          }

          // {   "openid":" OPENID",
          //     " nickname": NICKNAME,
          //     "sex":"1",
          //     "province":"PROVINCE"
          //     "city":"CITY",
          //     "country":"COUNTRY",
          //     "headimgurl":    "http://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
          //     "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
          //     "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
          // }
          console.log('wechatInfo:', res.text);
          return callback(null, JSON.parse(res.text));
        });
    });
};

//https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN

//微信后台事件获取accessToken
function getAccessTokenByServer(callback) {
  agent.get(config.wechat.getTokenUrl + '?grant_type=client_credential&appid=' + config.wechat_ext.app_id + '&secret=' + config.wechat_ext.app_secret)
    .end(function (err, res) {

      var accessToken = res.body.access_token;
      if (!accessToken) {
        console.log('getAccessTokenByServer!', res);
        return callback({err: {type: 'access_token_null'}});
      }

      return callback(null, accessToken);
    });
}

//微信后台事件获取用户信息
exports.getUserInfo = function (openId, callback) {

  getAccessTokenByServer(function (err, accessToken) {
    if (err) {
      return callback(err);
    }

    agent.get(config.wechat.getUserInfoUrl + '?access_token=' + accessToken + '&openid=' + openId)
      .end(function (err, res) {
        return callback(err, res.body);
      });
  });
};
//主动回复消息
exports.autoReplyText = function (openId, callback) {
  getAccessTokenByServer(function (err, accessToken) {
    if (err) {
      return callback(err);
    }

    var postData = {
      touser: openId,
      msgtype: 'text',
      text:
        {
          content: '终于等到您！谢谢关注瑞金医院古北分院！'
        }
    };
    console.log('auto post:', postData);
    agent.post(config.wechat.autoReplyUrl + '?access_token=' + accessToken)
      .send(postData)
      .end(function (err, res) {
        console.log('wechat auto reply:');
        console.log(res.body);
        console.log('=======auto reply end========');
        return callback(err, res.body);
      });
  });
};

//模版消息推送
function sendTemplateMessage(postData, callback) {
  getAccessTokenByServer(function (err, accessToken) {
    if (err) {
      return callback(err);
    }

    console.log('auto post:', postData);
    agent.post(config.wechat.templateSendUrl + '?access_token=' + accessToken)
      .send(postData)
      .end(function (err, res) {
        console.log(res.body);
        console.log('=======send template message========');
        return callback(err, res.body);
      });
  });
}

exports.sendAppointmentSuccess = function (wechatId, redirectUrl, appointmentInfo, callback) {
  var postData = {
    touser: wechatId,
    template_id: config.wechat_ext.notify_templates.appointment_success,
    url: redirectUrl,
    data: {
      first: {
        "value": "您已经成功预约！",
        "color": "#173177"
      },
      keyword1: {
        "value": appointmentInfo.card_number,
        "color": "#173177"
      },
      keyword2: {
        "value": appointmentInfo.start_time.Format('yyyy-MM-dd hh:mm') + '~' + appointmentInfo.end_time.Format('hh:mm'),
        "color": "#173177"
      },
      keyword3: {
        "value": appointmentInfo.doctor.nickname + '(' + appointmentInfo.department.name + ')',
        "color": "#173177"
      },
      keyword4: {
        "value": appointmentInfo.nickname,
        "color": "#173177"
      },
      remark: {
        "value": "温馨提示：" + appointmentInfo.nickname + "，您已预约民航医院" + appointmentInfo.department.name + "，请您提前30分钟前往医院，预约签到，挂号就诊，如您无法按时就诊，请至少提前一个工作日取消预约。",
        "color": "#173177"
      }
    }
  };
  sendTemplateMessage(postData, function (err, data) {
    if (err) {
      console.error(err);
      return callback({err: wechatError.send_template_message_error});
    }
    return callback(null, data);
  });
};

exports.sendCancelAppointmentMessage = function (wechatId, redirectUrl, appointmentInfo, callback) {
  var postData = {
    touser: wechatId,
    template_id: config.wechat_ext.notify_templates.appointment_cancel,
    url: redirectUrl,
    data: {
      first: {
        "value": "您好，您的预约已经成功取消！",
        "color": "#173177"
      },
      keyword1: {
        "value": appointmentInfo.nickname + '（' + appointmentInfo.card_number + '）',
        "color": "#173177"
      },
      keyword2: {
        "value": '民航医院',
        "color": "#173177"
      },
      keyword3: {
        "value": appointmentInfo.department.name,
        "color": "#173177"
      },
      keyword4: {
        "value": appointmentInfo.doctor.nickname,
        "color": "#173177"
      },
      keyword5: {
        "value": appointmentInfo.start_time.Format('yyyy-MM-dd hh:mm') + '~' + appointmentInfo.end_time.Format('hh:mm'),
        "color": "#173177"
      },
      remark: {
        "value": "温馨提示：" + appointmentInfo.nickname + "，您已成功取消民航医院" + appointmentInfo.department.name + "的预约。祝您早日康复！",
        "color": "#173177"
      }
    }
  };
  sendTemplateMessage(postData, function (err, data) {
    if (err) {
      console.error(err);
      return callback({err: wechatError.send_template_message_error});
    }
    return callback(null, data);
  });
};

exports.sendStoppedAppointmentMessage = function (wechatId, redirectUrl, appointmentInfo, callback) {
  var postData = {
    touser: wechatId,
    template_id: config.wechat_ext.notify_templates.doctor_close,
    url: redirectUrl,
    data: {
      first: {
        "value": "您好，很抱歉，您预约的门诊已经停诊！",
        "color": "#173177"
      },
      keyword1: {
        "value": appointmentInfo.nickname,
        "color": "#173177"
      },
      keyword2: {
        "value": appointmentInfo.department.name,
        "color": "#173177"
      },
      keyword3: {
        "value": appointmentInfo.doctor.nickname,
        "color": "#173177"
      },
      keyword4: {
        "value": appointmentInfo.start_time.Format('yyyy-MM-dd hh:mm') + '~' + appointmentInfo.end_time.Format('hh:mm'),
        "color": "#173177"
      },
      keyword5: {
        "value": '医生停诊',
        "color": "#173177"
      },
      remark: {
        "value": "温馨提示：" + appointmentInfo.nickname + "，很抱歉您预约的民航医院" + appointmentInfo.department.name + "门诊已经停诊，请关注其他时间段进行预约，祝您早日康复！",
        "color": "#173177"
      }
    }
  };
  sendTemplateMessage(postData, function (err, data) {
    if (err) {
      console.error(err);
      return callback({err: wechatError.send_template_message_error});
    }
    return callback(null, data);
  });
};
exports.sendRepeatStartedAppointmentMessage = function (wechatId, redirectUrl, appointmentInfo, callback) {
  var postData = {
    touser: wechatId,
    template_id: config.wechat_ext.notify_templates.doctor_open,
    url: redirectUrl,
    data: {
      first: {
        "value": "您预约的" + appointmentInfo.timeRangeString + "医生重新开诊" + (appointmentInfo.timeChanged ? "，就诊时间已变为" + appointmentInfo.newTimeRangeString + "，请您取消并重新预约。" : "。"),
        "color": "#173177"
      },
      keyword1: {
        "value": appointmentInfo.nickname,
        "color": "#173177"
      },
      keyword2: {
        "value": config.hospitalName,
        "color": "#173177"
      },
      keyword3: {
        "value": appointmentInfo.department.name,
        "color": "#173177"
      },
      keyword4: {
        "value": appointmentInfo.doctor.nickname,
        "color": "#173177"
      },
      remark: {
        "value":  "您预约的" + appointmentInfo.timeRangeString + "医生重新开诊" + (appointmentInfo.timeChanged ? "，就诊时间已变为" + appointmentInfo.newTimeRangeString + "，请您取消并重新预约。给您带来的不变敬请谅解，祝您早日康复！如若毋需看诊，请取消预约！" : "，请关注您的预约时间，以免错过看诊，毋需看诊，请取消预约。"),
        "color": "#173177"
      }
    }
  };
  sendTemplateMessage(postData, function (err, data) {
    if (err) {
      console.error(err);
      return callback({err: wechatError.send_template_message_error});
    }
    return callback(null, data);
  });
};
exports.sendAppointmentChangedMessage = function (wechatId, redirectUrl, appointmentInfo, callback) {
  var postData = {
    touser: wechatId,
    template_id: config.wechat_ext.notify_templates.doctor_open,
    url: redirectUrl,
    data: {
      first: {
        "value": "您预约的" + appointmentInfo.timeRangeString + "的医生就诊时间已变为" + appointmentInfo.newTimeRangeString + "，请您取消并重新预约。",
        "color": "#173177"
      },
      keyword1: {
        "value": appointmentInfo.nickname,
        "color": "#173177"
      },
      keyword2: {
        "value": config.hospitalName,
        "color": "#173177"
      },
      keyword3: {
        "value": appointmentInfo.department.name,
        "color": "#173177"
      },
      keyword4: {
        "value": appointmentInfo.doctor.nickname,
        "color": "#173177"
      },
      remark: {
        "value":  "您预约的" + appointmentInfo.timeRangeString + "的医生就诊时间已变为" + appointmentInfo.newTimeRangeString + "，请您取消并重新预约。给您带来的不变敬请谅解，祝您早日康复！如若毋需看诊，请取消预约！",
        "color": "#173177"
      }
    }
  };
  sendTemplateMessage(postData, function (err, data) {
    if (err) {
      console.error(err);
      return callback({err: wechatError.send_template_message_error});
    }
    return callback(null, data);
  });
};