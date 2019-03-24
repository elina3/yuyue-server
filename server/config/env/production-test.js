/**
 * Created by elinaguo on 16/3/18.
 */
'use strict';

module.exports = {
  appDb: 'mongodb://localhost/yueyue-system-pro-test',
  app: {
    title: 'YUYUE-SYSTEM - Production Test Environment'
  },
  serverAddress:'http://datonghao.com/',
  port: process.env.PORT || 80,
  wechat: {
    app_id: "wxa6210d998dd41246",
    app_secret: "f55b2c01ab809977f21b69e615861621",
    // getTokenUrl: "https://api.weixin.qq.com/cgi-bin/token",
    // getUserInfoUrl: "https://api.weixin.qq.com/cgi-bin/user/info",
    // autoReplyUrl: "https://api.weixin.qq.com/cgi-bin/message/custom/send",
    // //以下用于微信公众号端用户获取自己open_id和用户信息
    // getCodeUrl: "https://open.weixin.qq.com/connect/oauth2/authorize",
    // getTokenByCodeUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    // getUserInfoByToken: 'https://api.weixin.qq.com/sns/userinfo',
    // //模版消息发送
    // getTemplateSendUrl: 'https://api.weixin.qq.com/cgi-bin/message/template/send'
  },
};
