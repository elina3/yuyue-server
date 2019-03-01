/**
 * Created by elinaguo on 15/11/13.
 */
'use strict';

var _ = require('lodash'),
  Config = require('../config/config'),
  httpManager = require('../../../libraries/http_manager'),
  systemError = require('../errors/system'),
  wechatError = require('../errors/wechat');

var wechatApi = {
  token: Config.wechat_server.address + 'sns/oauth2/access_token',          //'https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code'
  refresh_token: Config.wechat_server.address + 'sns/oauth2/refresh_token', //'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=APPID&grant_type=refresh_token&refresh_token=REFRESH_TOKEN'
  token_auth: Config.wechat_server.address + 'sns/auth',                   //'https://api.weixin.qq.com/sns/auth
  user_info: Config.wechat_server.address + 'sns/userinfo'                  //'https://api.weixin.qq.com/sns/userinfo
};
function getAccessToken(url, callback) {
  httpManager.get(url, {}, null, function (err, result) {
    if (err) {
      return callback({err: systemError.network_error});
    }
    return callback(null, result);
  });
}

//<editor-fold desc="app端 微信用户登录相关 信息验证">
//access_token目前时间较短（2h）
exports.getAccessToken = function (code, openWechatConfig, callback) {
  var tokenUrl = wechatApi.token + '?appid=' + openWechatConfig.app_id + '&secret=' + openWechatConfig.app_secret + '&code=' + code + '&grant_type=authorization_code';
  getAccessToken(tokenUrl, function (err, result) {
    if (result.errcode === '40029' || result.errcode === 40029) {
      //result = {"errcode":40029,"errmsg":"invalid code"}
      console.error('result login wechat access token failed!');
      console.error(result.errcode);
      return callback({err: wechatError.invalid_wechat_code});
    }

    return callback(err, result);
    //result example
    //{
    //  "access_token":"ACCESS_TOKEN",
    //  "expires_in":7200,
    //  "refresh_token":"REFRESH_TOKEN",
    //  "openid":"OPENID",
    //  "scope":"snsapi_userinfo",
    //  "unionid":"ofMFjwxVqSgiQ33vs8cBb"
    //  "errcode": '-1'       //无错
    //}
  });
};


//****************************暂时没有用到****************************
//refresh_token失效期（30d）
//若access_token未超时，那么进行refresh_token不会改变access_token，但超时时间会刷新，相当于续期access_token;若已超时，则会获取一个新的access_token
exports.refreshToken = function (refreshToken, callback) {
  var refreshTokenUrl = wechatApi.refresh_token + '?appid=' + Config.wechat_server.app_id + '&grant_type=refresh_token' + '&refresh_token=' + refreshToken;
  httpManager.get(refreshTokenUrl, {}, null, function (err, result) {
    if (err) {
      return callback({err: systemError.network_error});
    }

    if (result.errcode === '40030') {
      //result = {"errcode":40030,"errmsg":"invalid refresh_token"}
      return callback({err: wechatError.invalid_wechat_refresh_token});
    }

    return callback(null, result);
    //result example
    //{
    //  "access_token":"ACCESS_TOKEN",
    //  "expires_in":7200,
    //  "refresh_token":"REFRESH_TOKEN",
    //  "openid":"OPENID",
    //  "scope":"SCOPE"
    //}
  });
};

exports.accessTokenAuth = function (accessToken, openId, callback) {
  var accessTokenAuthUrl = wechatApi.token_auth + '?access_token=' + accessToken + '&openid=' + openId;
  httpManager.get(accessTokenAuthUrl, {}, null, function (err, result) {
    if (err) {
      return callback({err: systemError.network_error});
    }

    if (result.errcode === '40003') {
      //result = {"errcode":40003,"errmsg":"invalid openid"}
      return callback(null, false);
    }

    if (result.errcode === '0') {
      //result = {"errcode":0,"errmsg":"ok"}
      return callback(null, true);
    }

    return callback({type: 'undefined_error', message: 'Undefined error! Result is ' + result});
  });
};

exports.getUserInfo = function (accessToken, openId, callback) {
  var userInfoUrl = wechatApi.user_info + '?access_token=' + accessToken + '&openid=' + openId;
  httpManager.get(userInfoUrl, {}, null, function (err, result) {
    if (err) {
      return callback({err: systemError.network_error});
    }

    if (result.errcode) {

      console.log(result.errcode);
      if (result.errcode === '40003' || result.errcode === 40003) {
        //result = {"errcode":40003,"errmsg":"invalid openid"}
        return callback({err: wechatError.invalid_wechat_open_id});
      } else {
        return callback({err: wechatError.wechat_error});
      }
    }

    console.log('wechat user_info:');
    console.log(JSON.stringify(result));

    return callback(null, result);
    //example:
    //{
    //  "openid":"OPENID",          //用户唯一标识
    //  "nickname":"NICKNAME",      //显示名
    //  "sex":1,                    //1为男性，2为女性
    //  "province":"PROVINCE",      //省
    //  "city":"CITY",              //城市
    //  "country":"COUNTRY",        //国家：CN
    //  "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",  //用户头像
    //  "privilege":[//用户特权信息
    //  "PRIVILEGE1",
    //  "PRIVILEGE2"
    //],
    //  "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"     //用户统一标识（同一用户的unionid是唯一的）
    //
    //}
  });
};
//</editor-fold>

exports.getWechatUserInfo = function (code, callback) {
  var tokenUrl = wechatApi.token + '?appid=' + Config.wechat.app_id + '&secret=' + Config.wechat.app_secret + '&code=' + code + '&grant_type=authorization_code';
  console.log('get wechat user info:==================');
  console.log(tokenUrl);
  getAccessToken(tokenUrl, function (err, result) {
    if (!result.access_token) {
      console.error('no access_token');
      return callback({err: wechatError.no_access_token});
    }

    return callback(err, result);
    //result example
    //{
    //  "access_token":"ACCESS_TOKEN",
    //  "expires_in":7200,
    //  "refresh_token":"REFRESH_TOKEN",
    //  "openid":"OPENID",
    //  "scope":"snsapi_userinfo",
    //  "unionid":"ofMFjwxVqSgiQ33vs8cBb"
    //  "errcode": '-1'       //无错
    //}
  });
};

