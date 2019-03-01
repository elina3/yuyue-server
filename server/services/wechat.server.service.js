/**
 * Created by elinaguo on 15/12/19.
 */
'use strict';
var agent = require('superagent').agent();
var config = require('../config/config');
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
