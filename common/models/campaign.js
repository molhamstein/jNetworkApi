'use strict';
var app = require('../../server/server');
const connector = app.dataSources.mydb.connector;
module.exports = function(Campaign) {
    Campaign.states = function(partner_id,cb) {
		var CampaignM = app.models.Campaign;
        var current_progress;
        var campaign_clicks =[];
        var campaign_impressions=[];
        //CampaignM.findOne({where: { status: 1 },order: 'RAND()'}, cb);
        CampaignM.find( {where: { partner_id: partner_id} }, function(err, campaignes) {
            // check for errors first...
            if (err || campaignes==null) {
                // handle the error somehow...
                process.nextTick(function() {
                    const err2 = new Error("Partner Not found");
                    err2.statusCode = 604;
                    err2.code = 'Partner_Not_Found';
                    cb(err2, null);
                    });
            }
            
            var result = [];
            var i=1;
            campaignes.forEach(campaign => {
               
               // console.log("campaign is "+campaign.name)
                //var sql ="select count(*) as clicks_count from AD inner join click on ad.id = ad_id where campaign_id='"+campaign.id+"'";
                var sql ="select count(*) as clicks_count from  click  where campaign_id='"+campaign.id+"'";
                connector.execute(sql, null, (err, resultObjects) => {
                    if(!err){
                        campaign_clicks[campaign.id] = resultObjects[0].clicks_count;
                        console.log("campaign_clicks "+campaign_clicks[campaign.id]+" for id "+campaign.id)
                        sql ="select count(*) as impressions_count from impression where campaign_id='"+campaign.id+"'";
                        connector.execute(sql, null, (err, resultObjects) => {
                            if(!err){
                                campaign_impressions = resultObjects[0].impressions_count; 
                                //console.log("campaign_clicks2 "+campaign_clicks[campaign.id]+" for id "+campaign.id)
                                console.log("campaign_impression "+campaign_impressions) 
                                current_progress =0;
                                //console.log()
                                if(campaign.type=="clicks")
                                {
                                    current_progress = 100*campaign_clicks[campaign.id]/campaign.value;
                                }
                                else if(campaign.type=="impressions")
                                {
                                    current_progress = 100*campaign_impressions/campaign.value;
                                }
                                if(campaign.duration!=0 && campaign.duration!=null && campaign.duration!="")
                                {
                                    var dt1 = new Date(campaign.start);
                                    //console.log(dt1);
                                    var dt2 = new Date();
                                    var current_duration = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
                                    var p_duration  =current_duration*100/campaign.duration;
                                    if(p_duration > current_progress)
                                        current_progress = p_duration
                                }
                                var obj  ={};
                                obj.campaign = campaign
                                obj.current_progress = current_progress
                                obj.clicks= campaign_clicks[campaign.id];
                                obj.impressions = campaign_impressions;
                                result.push(obj);
                            }
                            else
                                    process.nextTick(function() {
                                    cb(err, null);
                                    });
                            if(i == campaignes.length)
                                process.nextTick(function() {
                                    cb(err, result);
                                });
                            else
                                i++
                            
                        });
                    }
                    else
                            process.nextTick(function() {
                            cb(err, null);
                            });
                        
                });

                //sql ="select count(*) as impressions_count from AD inner join click on ad.id = ad_id where campaign_id='"+campaign.id+"'";
              
                
            });
        } );
  }
};
