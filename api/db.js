// import mariadb
var mariadb = require('mariadb');

// create a new connection pool
const pool = mariadb.createPool({
  host: "localhost", 
  port: 3306,
  user: "root", 
  password: "zxcvbnm",
  database: "homegraph",
  timezone: "Z"
});

// expose the ability to create new connections
module.exports={
  getConnection: function(){
    return new Promise(function(resolve,reject){
      pool.getConnection().then(function(connection){
        resolve(connection);
      }).catch(function(error){
        reject(error);
      });
    });
  }
} 