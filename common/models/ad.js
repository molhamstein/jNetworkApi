'use strict';
var app = require('../../server/server');
const connector = app.dataSources.mydb.connector;
module.exports = function(Ad) {
    Ad.randomAD = function(limit,client_id,mobile,cb) {
		var adM = app.models.AD;
			 
        //adM.findOne({where: { status: 1 },order: 'RAND()'}, cb);
        if(limit == "")
            limit =1
        var sql ="select * from AD where status=1 order by RAND() limit "+limit;
        connector.execute(sql, null, (err, resultObjects) => {
            if(!err){
                    process.nextTick(function() {
                        if(client_id!=null && client_id!="")
                        {
                            for (var i = 0; i < resultObjects.length; i++) {
                                sql = " insert into impression (client_id,ad_id) values ('"+client_id+"','"+resultObjects[i].id+"')"
                               connector.execute(sql, null, (err, resultObjects) => {
                                      if(!err){
                                        console.log("added successful to radius");
                                      }
                                      else
                                           console.log(err);
                                   });
                           }
                        }
                        if(mobile!=null && mobile!="")
                        {
                          Ad.app.models.client.findOne({where : {mobile : mobile}},function(err,client){
                            if(err)
                              return console.log(err);
                            if(!client)
                              return console.log("client not found");
                            client_id = client.id; 
                            for (var i = 0; i < resultObjects.length; i++) {
                                sql = " insert into impression (client_id,ad_id) values ('"+client_id+"','"+resultObjects[i].id+"')"
                               connector.execute(sql, null, (err, resultObjects) => {
                                      if(!err){
               
                                           console.log("added successful to radius");
                                      }
                                      else
                                           console.log(err);
                                   });
                           }
                          });
                        }
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
