/**
 * Created by elinaguo on 15/12/18.
 */
'use strict';
var JSSHA = require('jssha');
var wechatService = require('../services/wechat');

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

//todo 不应该引用controller 临时做法，将来直接调用用户缓存服务去更新token缓存
// var userController = require('../controllers/user');
function updateUserBaseInfo(openId, callback) {
  wechatService.getUserInfo(openId, function (err, wechatInfo) {
    if (err) {
      return callback(err);
    }

    console.error('get wechat info by wechat service:');
    console.log(wechatInfo);

    // userLogic.upsertUserByUnionId(wechatInfo.unionid, wechatInfo, function (err, userList) {
    //   if (err) {
    //     return callback(err);
    //   }
    //   if (userList && userList.length > 0) {
    //     async.each(userList, function (userItem, eachCallback) {
    //       if (!userItem.latest_access_token) {
    //         return eachCallback();
    //       }
    //       userController.updateUserCache(userItem.latest_access_token, userItem, function (err) {
    //       });
    //       return eachCallback();
    //     }, function (err) {
    //       return callback(err);
    //     });
    //   }
    //   else {
    //     return callback();
    //   }
    // });
  });
}

exports.UpsertUserPaymentId = function (req, res, next) {
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

  console.log('FromUserName:', wechatPostParam.FromUserName, ' ', wechatPostParam.Event, '!');


  if (wechatPostParam.Event === 'subscribe') {  //订阅

    wechatService.autoReplyText(wechatPostParam.FromUserName, function (err, result) {
      if (err) {
        console.error('自动回复失败');
      } else {
        console.error('自动回复成功');
      }
    });

    console.error('begin to update user base info:');
    updateUserBaseInfo(wechatPostParam.FromUserName, function (err) {
      if (err) {
        console.error('update user base info failed', err);
      }
      req.data = {
        success: true
      };
      return next();
    });
  } else if (wechatPostParam.Event === 'unsubscribe') {
    req.data = {
      success: true
    };
    return next();
    // updateUserBaseInfo(wechatPostParam.FromUserName, function (err) {
    //   if (err) {
    //     console.error('update user base info failed', err);
    //   }
    //   req.data = {
    //     success: true
    //   };
    //   return next();
    // });
  } else {
    wechatService.autoReplyText(wechatPostParam.FromUserName, function (err, result) {
      if (err) {
        console.error('自动回复失败');
      } else {
        console.error('自动回复成功');
      }
    });

    req.data = {
      success: true
    };
    return next();
  }
};


exports.getWechatUserBaseInfoBy = function (req, res, next) {
  req.data = {
    message: 'It is a test data'
  };
  return next();
  // var openId = 'oaXTWwe2SgE7pWGRCnhMuOA7s1RA';
  // updateUserBaseInfo(openId, function (err, newUser) {
  //   if (err) {
  //     req.err = err;
  //     return next();
  //   }
  //
  //   req.data = {
  //     success: true,
  //     user: newUser
  //   };
  //   return next();
  // });
};


exports.testWechatPay = function (req, res, next) {
  //测试支付
  // var openId = 'okiSOwq7cRwOEKlUcxj_D-2qUgsY';
  // updateUserBaseInfo(openId, function (err, newUser) {
  //   if (err) {
  //     req.err = err;
  //     return next();
  //   }
  //
  //   req.data = {
  //     success: true,
  //     user: newUser
  //   };
  //   return next();
  // });
};
