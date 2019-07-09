
var config = require('../config/config');
var Sequelize=require('sequelize');
config.sql = config.sql || {};
const sequelize=new Sequelize('THIS4_TEST','sa','1QAZ2wsx',{
  host: config.sql.host,
  // host:'mh-rjgb.com',
  dialect: 'mssql',
  port: '6006'
});
sequelize.authenticate().then(function(){
  console.log('sql connect success!!' + 'host:' + config.sql.host);
});
module.exports = sequelize;