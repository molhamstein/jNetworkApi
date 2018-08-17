'use strict';
var app = require('../../server/server');
const connector = app.dataSources.mydb.connector;
module.exports = function(Ad) {
    Ad.randomAD = function(cb) {
		var adM = app.models.AD;
			 
        //adM.findOne({where: { status: 1 },order: 'RAND()'}, cb);
        var sql ="select * from AD where status=1 order by RAND() limit 1";
        connector.execute(sql, null, (err, resultObjects) => {
            if(!err){
                    process.nextTick(function() {
                       cb(null, resultObjects);
                 });
            }
            else
                 process.nextTick(function() {
                   cb(err, null);
                 });
                //next();
         });
  }
};
