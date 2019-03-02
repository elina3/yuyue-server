/**
 * Created by elinaguo on 15/12/19.
 */
'use strict';
var agent = require('superagent').agent();

var config = require('../config/config');

exports.getOpenIdByCode = function(code, callback){
  var tokenUrl = `${config.wechat.getTokenByCodeUrl}?appid=${config.wechat.app_id}&secret=${config.wechat.app_secret}&code=${code}&grant_type=authorization_code`;
  console.error(tokenUrl);
  agent.get(tokenUrl)
      .end(function(err, res){
    if(err){
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
    if(!res.access_token){
      return callback({err: {zh_message: 'error', obj: res.body}});
    }

    var wechatInfoUrl = `${config.wechat.getUserInfoByToken}?access_token=${res.access_token}&open_id=${res.openid}&lang=zh_CN`;
    agent.get(wechatInfoUrl)
        .end(function(err, res){
          if(err){
            console.error('get wechat info error:', err);
            return callback(err);
          }

      // {    "openid":" OPENID",
      //     " nickname": NICKNAME,
      //     "sex":"1",
      //     "province":"PROVINCE"
      //   "city":"CITY",
      //     "country":"COUNTRY",
      //     "headimgurl":    "http://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
      //     "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
      //     "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
      // }
      console.log(res.body);

      return callback(null, res.body);
    });
  });
};

//https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN


//微信后台事件获取用户信息
exports.getUserInfo = function(openId, callback){
  agent.get(config.wechat.getTokenUrl + '?grant_type=client_credential&appid=' + config.wechat.app_id + '&secret=' + config.wechat.app_secret)
    .end(function (err, res) {

      var accessToken = res.body.access_token;
      if(!accessToken){
        return callback({err: {type: 'access_token_null'}});
      }

      agent.get(config.wechat.getUserInfoUrl + '?access_token=' + accessToken + '&openid=' + openId)
        .end(function (err, res) {
          return callback(err, res.body);
        });
    });
};
exports.autoReplyText = function(openId, callback){
  var postData = {
    touser: openId,
    msgtype: 'text',
    text:
    {
      content: '终于等到您！谢谢关注民航医院瑞金古北分院！'
    }
  };

  console.log('auto post:', postData);
  var api = config.wechat.getTokenUrl + '?grant_type=client_credential&appid=' + config.wechat.app_id + '&secret=' + config.wechat.app_secret;
  console.log(api);
  agent.get(api)
    .end(function (err, res) {

      var accessToken = res.body.access_token;
      if(!accessToken){
        return callback({err: {type: 'access_token_null'}});
      }

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
