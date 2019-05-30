/**
 * Created by elinaguo on 15/10/13.
 */
'use strict';
var crypto = require('crypto'),
  httpManager = require('../libraries/wechat_http_manager'),
  utf8 = require('utf8'),
    wechatService = require('../services/wechat'),
  xmlParser = require('xml2js');

var wechatConfig = {
  appid: 'wxa6210d998dd41246',
  mch_id: '1520653681',
  payUrl: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  queryOrderUrl: 'https://api.mch.weixin.qq.com/pay/orderquery',
  notifyUrl: 'http://datonghao.com/test/notify',//支付结果通知 ：本地url
  privateKey: 'Tong88Hao88Ke12Ji061214GssTLf168',
  serverIp: '39.98.41.24'
};

exports.testPay = function(req, res, next){

  var paymentInfo = {
    open_id: 'o7-H2wTS0Zniw2W_mkkFH0scU3u4',
    amount: 100
  };
  pay(paymentInfo, function(err, result){
    if(err){
      req.err = err;
      return next();
    }

    req.data = result;
    return next();
  });
};

exports.notifyPayResult = function(req, res, next){
  console.log('pay notify: body参数',req.body, JSON.stringify(req.body));
  console.log('pay notify: query参数',req.query, JSON.stringify(req.query));
  req.data = {
    success: true
  };
  return next();

};

exports.testXML = function(req, res, next){
  var xml = `<xml><return_code><![CDATA[FAIL]]></return_code>
             <return_msg><![CDATA[签名错误]]></return_msg>
            </xml>`;
  xmlParser.parseString(xml, function(err, result){
    console.log(result.xml);
    req.data = {
      data: result
    };
    return next();
  });
};

var testLogic = require('../logics/test');
exports.addData = function(req, res, next){
  testLogic.addData({reportingTime: new Date()}, (err, result)=>{
    if(err){
      return next(err);
    }

    req.data = {
      data: result
    };
    return next();
  });
};


function generateNewPartnerTradeNo(){
  return (new Date()).valueOf().toString().substring(3,9) + (new Date()).valueOf().toString().substring(8,13) + (new Date()).valueOf().toString();
}
function generateNonceStr(){
  return Math.random().toString(30).substr(2).substr(0,32);
}


function generateSign(options, key){
  var sign = '';
  if(options.appid){
    sign += ('appid=' + options.appid);
  }
  if(options.attach){
    sign += ('&attach=' + options.attach);
  }
  if(options.body){
    sign += ('&body=' + options.body);
  }
  if(options.mch_id){
    sign += ('&mch_id=' + options.mch_id);
  }
  if(options.mchid){
    sign += ('&mchid=' + options.mchid);
  }
  if(options.nonce_str){
    sign += ('&nonce_str=' + options.nonce_str);
  }
  if(options.notify_url){
    sign += ('&notify_url=' + options.notify_url);
  }
  if(options.openid){
    sign += ('&openid=' + options.openid);
  }
  if(options.out_trade_no){
    sign += ('&out_trade_no=' + options.out_trade_no);
  }
  if(options.spbill_create_ip){
    sign += ('&spbill_create_ip=' + options.spbill_create_ip);
  }
  if(options.total_fee){
    sign += ('&total_fee=' + options.total_fee);
  }
  if(options.trade_type){
    sign += ('&trade_type=' + options.trade_type);
  }

  console.log(sign);
  sign += ('&key=' + key);
  // sign = utf8.encode(sign);

  console.log(sign);
  sign = crypto.createHash('md5').update(sign).digest('hex');

  return sign.toUpperCase();
}

function parseResult(xml, callback){
  try{
    console.log('result xml:', xml);
    xmlParser.parseString(xml, function(err, jsonResult){
      console.log('jsonResult:', jsonResult);
      return callback(null, jsonResult.xml);
    });
  }
  catch(e){
    console.log();
    console.log(e);
    return callback({err: 'payment_result_parse_error'});

  }
}

function pay(paymentInfo, callback) {
  var key = wechatConfig.privateKey;
  var payUrl = wechatConfig.payUrl;

  var nonce_str = paymentInfo.nonce_str ? paymentInfo.nonce_str: generateNonceStr();
  var out_trade_no = paymentInfo.partner_trade_no ? paymentInfo.partner_trade_no : generateNewPartnerTradeNo();
  var open_id = paymentInfo.open_id;//姗姗Elina
  var amount = paymentInfo.amount;//至少100分
  var attach = '附加信息';
  var body = '商品描述信息';//商品描述
  var trade_type = 'JSAPI';


  var sign = generateSign({
    appid: wechatConfig.appid, //公众号AppID wxa6210d998dd41246
    mch_id: wechatConfig.mch_id, //商户号
    nonce_str: nonce_str ,
    notify_url: wechatConfig.notifyUrl,
    out_trade_no: out_trade_no ,
    openid: open_id ,
    total_fee: amount,
    spbill_create_ip: wechatConfig.serverIp,
    attach: attach,
    body: body,
    trade_type: trade_type
  }, key);

  console.log('sign:', sign);

  var xml = `<xml>
    <appid>${wechatConfig.appid}</appid>
    <attach>${attach}</attach>
    <body>${body}</body>
    <mch_id>${wechatConfig.mch_id}</mch_id>
    <nonce_str>${nonce_str}</nonce_str>
    <notify_url>${wechatConfig.notifyUrl}</notify_url>
    <openid>${open_id}</openid>
    <out_trade_no>${out_trade_no}</out_trade_no>
    <spbill_create_ip>${wechatConfig.serverIp}</spbill_create_ip>
    <total_fee>${amount}</total_fee>
    <trade_type>${trade_type}</trade_type>
    <sign>${sign}</sign>
  </xml>`;

  console.log('wechat request xml:');
  console.log(xml);

  httpManager.post(payUrl, xml, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    console.log(result);
    parseResult(result, function(err, result){
      if(err){
        return callback(err);
      }
      console.log('预支付返回结果result:', JSON.stringify(result));

      result = result || {};

      console.log('result.return_code:', result.return_code);
      console.log('result.result_code:', result.result_code);
      console.log('result.trade_type:', result.trade_type);
      console.log('result.prepay_id:', result.prepay_id);
      console.log('result.code_url:', result.code_url);
      console.log('result.err_code:', result.err_code);
      console.log('result.err_code_des:', result.err_code_des);

      if(!result.return_code || !result.return_code[0]){
        return callback({err: {type:'return_code_not_exist'}});
      }

      if(result.return_code[0].toUpperCase() === 'FAIL'){
        return callback({err: {type: result.err_code, message: result.return_msg && result.return_msg[0]}});
      }

      return callback(null, result);
    });
  });
}