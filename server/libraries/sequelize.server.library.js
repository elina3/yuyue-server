
var Sequelize=require('sequelize');
const sequelize=new Sequelize('THIS4_TEST','sa','1QAZ2wsx',{
  host:'mh-rjgb.com',
  dialect: 'mssql',
  port: '6006'
});
sequelize.authenticate().then(function(){
  console.log('connect success!!');
});
module.exports = sequelize;