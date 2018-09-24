'use strict';
var _ = require('lodash');
module.exports = function(Campaignad) {
	Campaignad.getAdsByCriteria = function(client_id,mobile,location_id=null,limit=1,cb) {
        _getClient(client_id,mobile,(err,client)=>{
        	if(err)
        		return cb(err);
        	if(!client)
    			  return cb(ERROR(404,'client not found'));

          var clientAge = new Date().getFullYear() - new Date(client.birthdate).getFullYear();
          console.log(clientAge)
      		var sql = "SELECT campaign.id as CID, campaign.status, campaign.start, campaign.duration, criteria.* FROM campaign LEFT JOIN criteria ON campaign.id = criteria.campaign_id order by campaign_id"
      		Campaignad.app.dataSources.mydb.connector.execute(sql, [], function (err, data) {
            if(err) 
              return cb(err);
            var campaigns = {}
            // console.log(data);
            _.each(data,function(CA){
              if(!campaigns[CA.CID])
                campaigns[CA.CID] = 0;
               if(campaigns[CA.CID] == '-1')
                return;

              if(!CA.campaign_id) // not creiteria
                campaigns[CA.CID] = 0;

              if (CA.type == 'gender' || CA.type == 'profession'){
                if(client[CA.type] == CA.value)
                  campaigns[CA.CID]++;
                else
                  campaigns[CA.CID] = -1;
              }
              else if (CA.type == 'location_id'){
                if(location_id == CA.value)
                  campaigns[CA.CID]++;
                else
                  campaigns[CA.CID] = -1;
              }
              else if (CA.type == 'age'){
                if(CA.operator == '='){
                  if(clientAge == CA.value)
                    campaigns[CA.CID]++;
                  else
                    campaigns[CA.CID] = -1;
                }
                else if(CA.operator == '>' || CA.operator == '>='){
                  if(clientAge >= CA.value)
                    campaigns[CA.CID]++;
                  else
                    campaigns[CA.CID] = -1;
                }
                else if(CA.operator == '<' || CA.operator == '<='){
                  if(clientAge <= CA.value)
                    campaigns[CA.CID]++;
                  else
                    campaigns[CA.CID] = -1;
                }
                else{
                  if(clientAge >= CA.value && clientAge <= CA.value2)
                    campaigns[CA.CID]++;
                  else
                    campaigns[CA.CID] = -1;
                }
              }
            });
            console.log("result campaigns : ",campaigns)
            _.each(campaigns,(value,key)=>{
              if(value == -1)
                delete campaigns[key];
            })
            console.log("allowe campaigns : ",campaigns)
  		    });    
        });
    }
    
    var _getClient = function(client_id,mobile,cb){
    	if(!client_id && !mobile)
    		return cb(ERROR(404,'client not found'));
    	if(client_id)
    		return Campaignad.app.models.client.findById(client_id,cb);
    	if(mobile) 
    		return Campaignad.app.models.client.findOne({where : {mobile : mobile}},cb);
    }
};
