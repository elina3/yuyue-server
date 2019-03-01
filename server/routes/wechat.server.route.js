'use strict';
var wechatController = require('../controllers/wechat');

module.exports = function(app) {
  //微信开放平台用于验证开发者的服务端url
  app.route('/wechat/vertificate').get(wechatController.vertificate);
  //微信订阅用户行为的消息接口
  app.route('/wechat/vertificate').post(wechatController.onWechatUserAction);
  app.route('/wechat/test').get(wechatController.getWechatUserBaseInfoBy);
};
