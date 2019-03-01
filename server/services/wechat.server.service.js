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
          console.log('wechat user info:');
          console.log(res.body);
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
      content: '您好！请任选一名微客服搜索并添加好友以获取帮助：“小顺子（微信号sszq007）”，“小小赚（微信号agilepops008）”，“钱多多（微信号sszq007）”。（非工作时间请耐心等待）'
    }

  };
  console.log('auto reply post data======');
  console.log(postData);
  console.log('====================end===');
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

          return callback(err, res.body);
        });
    });
};
