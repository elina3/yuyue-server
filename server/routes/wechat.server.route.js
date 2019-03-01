'use strict';
var wechatController = require('../controllers/wechat');

module.exports = function(app) {
  app.route('/wechat/vertificate').get(wechatController.vertificate);
  app.route('/wechat/vertificate').post(wechatController.UpsertUserPaymentId);
  app.route('/wechat/test').get(wechatController.getWechatUserBaseInfoBy);
};
