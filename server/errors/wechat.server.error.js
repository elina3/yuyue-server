/**
 * Created by elinaguo on 15/11/13.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  invalid_wechat_code: {type: 'invalid_wechat_code', message: 'The code is invalid!', zh_message: '无效的微信code'},
  invalid_wechat_refresh_token: {type: 'invalid_wechat_refresh_token', message: 'The refresh token is invalid!', zh_message: '无效的微信refresh_token'},
  invalid_wechat_open_id: {type: 'invalid_wechat_open_id', message: 'The open id is invalid!', zh_message: '无效的微信open_id'},
  wechat_error: {type: 'wechat_error', message: 'The wechat return error', zh_message: '微信返回的用户信息出错'},
  account_existed: {type: 'account_existed', message: 'this account existed', zh_message: '账户已存在'},
  account_deleted: {type: 'account_deleted', message: 'this account has been deleted', zh_message: '账户已删除'},
  invalid_access_token: {type: 'invalid_access_token', message: 'the access token invalid', zh_message: '无效的访问凭据access_token'},
  invalid_password: {type: 'invalid_password', message: 'invalid password', zh_message: '无效密码'},
  invalid_account: {type: 'invalid_account', message: 'invalid account', zh_message: '无效账户'},
  param_null_error: {type: 'param_null_error', message: 'the param is null', zh_message: '参数为空'},
  database_save_error: {type: 'database_save_error', message: 'database save error', zh_message: '数据库保存出错'},
  network_busy: {type: 'network_busy', message: 'the network is busy', zh_message: '网络忙'},
  no_open_id: {type: 'no_open_id', message: 'the open id is null', zh_message: '无open_id'}
});
