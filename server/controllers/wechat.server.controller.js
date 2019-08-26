/**
 * Created by elinaguo on 15/12/18.
 */
'use strict';
var JSSHA = require('jssha');
var wechatError = require('../errors/wechat');
var wechatService = require('../services/wechat');

//用户平台验证微信接口
exports.vertificate = function (req, res, next) {
  req.query = req.query || {};
  if (!req.query || req.query === {}) {
    req.err = {err: '参数为空！'};
    return next();
  }

  console.log('来自微信的get请求：' + JSON.stringify(req.query));
  console.log('body:', JSON.stringify(req.body));
  try {
    console.log('begin');
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echoStr = req.query.echostr;
    var token = 'Elvis521Elinadatonghao';
    var tmp = [token, timestamp, nonce];
    tmp = tmp.sort();
    var _str = '';
    for (var i = 0; i < tmp.length; i++) {
      _str += tmp[i];
    }
    var shaObj = new JSSHA(_str, 'TEXT');
    var my_signature = shaObj.getHash('SHA-1', 'HEX');
    console.log('sign:' + my_signature + ' wx:' + signature);
    if (my_signature === signature) {
      req.data = echoStr;
      return next();
    }
    else {
      req.err = {err: '验证失败，非法请求'};
      return next();
    }
  }
  catch (e) {
    console.log(e);
    req.err = {err: '解析出错！'};
    return next();
  }
};

function getWechatUserInfo(openId, callback) {
  wechatService.getUserInfo(openId, function (err, wechatInfo) {
    if (err) {
      return callback(err);
    }

    console.log('获取用户详细信息：');
    console.log(wechatInfo);
    return callback(wechatInfo);
  });
}

const autoReplyText = '终于等到您！谢谢关注瑞金医院古北分院！';
//接受微信用户行为的推送接口
exports.onWechatUserAction = function (req, res, next) {
  console.log(req.query);
  if (!req.query || req.query === {}) {
    req.err = {err: '参数为空！'};
    return next();
  }

  console.log('来自微信的post请求：' + JSON.stringify(req.rawBody));

  var wechatPostParam = req.rawBody.xml;
  if (!wechatPostParam.FromUserName) {
    console.log('openid获取为null');
    req.err = {err: 'openid获取为null'};
    return next();
  }

  if (wechatPostParam.FromUserName && Array.isArray(wechatPostParam.FromUserName) && wechatPostParam.FromUserName.length > 0) {
    wechatPostParam.FromUserName = wechatPostParam.FromUserName[0];
  }
  if (wechatPostParam.Event && Array.isArray(wechatPostParam.Event) && wechatPostParam.Event.length > 0) {
    wechatPostParam.Event = wechatPostParam.Event[0];
  }
  if (wechatPostParam.MsgType && Array.isArray(wechatPostParam.MsgType) && wechatPostParam.MsgType.length > 0) {
    wechatPostParam.MsgType = wechatPostParam.MsgType[0];
  }
  console.log('重新赋值后的事件信息:');
  console.log('FromUserName:', wechatPostParam.FromUserName, ',Event: ', wechatPostParam.Event, ',', 'MsgType:', wechatPostParam.MsgType);

  if (wechatPostParam.Event === 'subscribe') {  //订阅
    console.log('用户' + wechatPostParam.FromUserName + '已关注！');

    res.send(autoReplyText);
    // wechatService.autoReplyText(wechatPostParam.FromUserName, function (err, result) {
    //   if (err) {
    //     console.error('自动回复失败');
    //   } else {
    //     console.error('自动回复成功');
    //   }
    // });
    //
    // getWechatUserInfo(wechatPostParam.FromUserName, function (err) {
    //   if (err) {
    //     console.error('update user base info failed', err);
    //   }
    //   res.send('');
    // });
  }
  else if (wechatPostParam.Event === 'unsubscribe') {
    console.log('用户' + wechatPostParam.FromUserName + '已取消关注！');
    res.send('');
  }
  else {
    res.send('');
  }
};

exports.getWechatInfo = function(req, res, next){
  var code = req.body.code || req.query.code || '';
  if(!code){
    return next({err: wechatError.invalid_wechat_code});
  }
  console.log('code', code);
  wechatService.getOpenIdByCode(code, function(err, result){
    if(err){
      return next(err);
    }
    req.data = {
      wechat_info: result
    };
    return next();
  });
};


