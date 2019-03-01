/**
 * Created by elinaguo on 15/12/19.
 */
'use strict';
var agent = require('superagent').agent();

var config = require('../config/config');
exports.getWechatCode = function(callback){
  // var redirectURI = config.serverAddress + '/test/code';
  agent.get(config.wechat.getCodeUrl + '?appid=' + config.wechat.app_id + '&redirect_uri=http%3a%2f%2fdatonghao.com%2ftest%2fcode&response_type=code&scope=snsapi_userinfo&state=wechatcode&connect_redirect=1#wechat_redirect')
  .end(function (err, res) {
    if(err){
      console.error('get wechat code error:', err);
      return callback(err);
    }

    console.log('code result:', res.body);
    return callback(null, res.body);
  });
};
exports.getOpenIdByCode = function(code, callback){
  var url = config.wechat.getTokenByCodeUrl +  `?appid=${config.wechat.app_id}&secret=${config.wechat.app_secret}&code=${code}&grant_type=authorization_code`;
  agent.get(url)
      .end(function(err, res){
    if(err){
      console.error('get wechat access_token error:', err);
      return callback(err);
    }

    console.log('access_token result:', res.body);
    return callback(null, res.body);
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
