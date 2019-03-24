'use strict';
module.exports = {
    app: {
        title: 'YUYUE-SYSTEM',
        description: '预约系统服务',
        keywords: 'YUYUE-SYSTEM'
    },
    port: process.env.PORT || 2003,
    //qiniu_a_key:'l4QmpjDXDiUySvlORpaxcU8MjJz1X3qRx1I_sTRu',
    //qiniu_s_key:'wPfmnZ9usqp0D3rxBF0MNKlj3NBd0iLH7Hxk8kkS',
    qiniu_a_key: 'Cl6lOoIMwux5wdigvdJ2nUsVOsgK_ti5miklg1dh',
    qiniu_s_key: '8D2F29Cq0Q3-OMc2zA-PyYYdTyhmjM9FXYDYGZNQ',
    qiniu_server_address: 'http://7xs3gd.com1.z0.glb.clouddn.com/@',
    wechat: {
      getTokenUrl: "https://api.weixin.qq.com/cgi-bin/token",
      getUserInfoUrl: "https://api.weixin.qq.com/cgi-bin/user/info",
      autoReplyUrl: "https://api.weixin.qq.com/cgi-bin/message/custom/send",
      //以下用于微信公众号端用户获取自己open_id和用户信息
      getCodeUrl: "https://open.weixin.qq.com/connect/oauth2/authorize",
      getTokenByCodeUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      getUserInfoByToken: 'https://api.weixin.qq.com/sns/userinfo',
      //模版消息发送
      templateSendUrl: 'https://api.weixin.qq.com/cgi-bin/message/template/send'
    }
};
