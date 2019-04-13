'use strict';
/**
 * Module dependencies.
 */
var  init = require('./config/init')(),
  config = require('./config/config');

// Init the express application
var app = require('./config/express')(config);

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

console.log('========================YUYUE-SYSTEM Server=====================');
console.log('YUYUE-SYSTEM Server!');
console.log('enviroment:', process.env.NODE_ENV);

console.log('YUYUE-SYSTEM application started on address ' + config.serverAddress);
console.log('YUYUE-SYSTEM application started on port ' + config.port);

console.log('init default data');
var initData = require('./config/initData');
initData.createDefaultHospital();
console.log(config.wechat.getUserInfoUrl);
console.log('======================');
console.log(config.wechat_ext.app_id);

var sequelize = require('./libraries/sequelize');

// var Sequelize=require('sequelize');
// // var sequelize=new Sequelize('postgres://sa:1QAZ2wsx@mh-rjgb.com:6006/THIS4_TEST');
// var sequelize=new Sequelize('THIS4_TEST','sa','1QAZ2wsx',{
//   host:'mh-rjgb.com',
//   dialect: 'mssql',
//   port: '6006'
// });
// sequelize.authenticate().then(function(){
//   console.log('connect success!');
// });
// console.log('sequelize', sequelize);




