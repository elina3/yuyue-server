/**
 * Created by elinaguo on 15/12/19.
 */
'use strict';
var agent = require('superagent').agent();
var wechatError = require('../errors/wechat');

var config = require('../config/config');
//微信前端通过code获取用户信息
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
    let resultObj = JSON.parse(res.text);
    if(!resultObj.access_token){
      return callback({err: wechatError.access_token_failed});
    }
    if(!resultObj.openid){
      return callback({err: wechatError.openid_failed});
    }

    var wechatInfoUrl = `${config.wechat.getUserInfoByToken}?access_token=${resultObj.access_token}&openid=${resultObj.openid}&lang=zh_CN`;
    agent.get(wechatInfoUrl)
        .end(function(err, res){
          if(err){
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
function getAccessTokenByServer(callback){
  agent.get(config.wechat.getTokenUrl + '?grant_type=client_credential&appid=' + config.wechat.app_id + '&secret=' + config.wechat.app_secret)
  .end(function (err, res) {

    var accessToken = res.body.access_token;
    if(!accessToken){
      return callback({err: {type: 'access_token_null'}});
    }

    return callback(null, accessToken);
  });
}

//微信后台事件获取用户信息
exports.getUserInfo = function(openId, callback){

  getAccessTokenByServer(function(err, accessToken){
    if(err){
      return callback(err);
    }

    agent.get(config.wechat.getUserInfoUrl + '?access_token=' + accessToken + '&openid=' + openId)
    .end(function (err, res) {
      return callback(err, res.body);
    });
  });
};
//主动回复消息
exports.autoReplyText = function(openId, callback){
  getAccessTokenByServer(function(err, accessToken){
    if(err){
      return callback(err);
    }

    var postData = {
      touser: openId,
      msgtype: 'text',
      text:
          {
            content: '终于等到您！谢谢关注民航医院瑞金古北分院！'
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
exports.sendTemplateMessage = function(){

};
