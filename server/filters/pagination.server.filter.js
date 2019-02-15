/**
 * Created by elinaguo on 16/5/12.
 */
'use strict';
var config = require('../config/config');
var mongoLib = require('../libraries/mongoose'),
 publicLib = require('../libraries/public');

exports.requirePagination = function (req, res, next) {
  var currentPage = publicLib.formatPaginationNumber(req.query.current_page || req.body.current_page); //解析正整数
  var limit = publicLib.formatPaginationNumber(req.query.limit || req.body.limit);             //解析正整数
  var skipCount = publicLib.formatPaginationNumber(req.query.skip_count || req.body.skip_count); //解析正整数和0
  req.pagination = {
    current_page: currentPage < 0 ? 1 : currentPage,//解析错误时给默认值：1
    limit: limit < 0 ? -1 : limit,//解析错误时给默认值：-1,表示没有设置块大小
    skip_count: skipCount < 0 ? -1 : limit//解析错误时给默认值：-1,表示没有设置偏移多少
  };
  next();
};