'use strict';
var app = require('../../server/server');
var _ = require('lodash');
const connector = app.dataSources.mydb.connector;
module.exports = function(Campaign) {
    Campaign.validatesInclusionOf('status', {in: ['pending', 'active','paused','deactivated']});


    Campaign.beforeRemote('find', function( ctx, modelInstance, next) {
        Campaign.app.models.partner.isAdmin(ctx.req.accessToken,function(err,isAdmin){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx, 'args.filter.where.partner_id', ctx.req.accessToken.userId);
            return next();
        });
    });

    Campaign.beforeRemote('count', function( ctx, modelInstance, next) {
        Campaign.app.models.partner.isAdmin(ctx.req.accessToken,function(err,isAdmin){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx, 'args.where.partner_id', ctx.req.accessToken.userId);
            return next();
        });
    });

    var beforeRemoteForPermision = function( ctx, modelInstance, next) {
        Campaign.app.models.partner.isAdmin(ctx.req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return next(err);
            console.log(ids,ctx.req.params.id)
            if(!isAdmin && !_.includes(ids,Number(ctx.req.params.id)))
                return next(ERROR(403,'permison denied'));
            return next();
        });
    };

    Campaign.beforeRemote('findById', beforeRemoteForPermision);
    Campaign.beforeRemote('replaceById', beforeRemoteForPermision);
    Campaign.beforeRemote('deleteById', beforeRemoteForPermision);
    Campaign.beforeRemote('costCampaign', beforeRemoteForPermision);

    Campaign.beforeRemote('create', function( ctx, modelInstance, next) {
        ctx.req.criteria = ctx.req.body.criteria;
        ctx.req.adsIds = ctx.req.body.adsIds;
        delete ctx.req.body.criteria;
        delete ctx.req.body.adsIds;
        return next();
    });

    Campaign.afterRemote('create', function(context, campaign, next) {
        var criteria = [];
        var criteriaPrice = {};
        var totalPricePerImp = 0;
        var totalPricePerClick = 0;

        var adsIds = [];
        _.each(context.req.adsIds,function(adId){
            adsIds.push({
                campaign_id : campaign.id,
                ad_id : adId
            });
        });
        Campaign.app.models.campaign_ad.create(adsIds,function(err,ADS){
            if(err)
                return next(err);
            campaign.ads = adsIds;

            Campaign.app.models.criteria_price.find({},function(err,prices){
                if(err)
                    return next(err);
                _.each(prices,(p)=>{
                    criteriaPrice[p.type] = {
                        perImp : p.perImp,
                        perClick : p.perClick
                    }
                });
                totalPricePerClick += Number(criteriaPrice.default.perClick);
                totalPricePerImp += Number(criteriaPrice.default.perImp);
                _.each(context.req.criteria,function(c){
                    if(criteriaPrice[c.type]){
                        totalPricePerImp += Number(criteriaPrice[c.type].perImp);
                        totalPricePerClick += Number(criteriaPrice[c.type].perClick);
                        c.campaign_id = campaign.id;
                        criteria.push(c);
                    }
                });
                campaign.CPC = totalPricePerClick;
                campaign.CPI = totalPricePerImp;
                campaign.save(function(err){
                    if(err)
                        return next(err);
                    Campaign.app.models.criteria.create(criteria,(err,data)=>{
                        if(err)
                            return next(err);
                        campaign.criteria = data;
                        return next();
                    });
                });
            });
        });
    });

    Campaign.costCampaign = function(id,req,res,cb){
        Campaign.app.models.partner.isAdmin(req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return cb(err);
            if(!isAdmin && _.indexOf(ids, id) == -1)
                return cb(ERROR(403,'permison denied'));

            Campaign.findById(id,function(err,campaign){
                if(err) 
                    return cb(err);
                if(!campaign)
                    return cb(ERROR(404,'campaign not found'));
                Campaign.app.models.click.count({campaign_id : id}, function(err, countClick) {
                    if(err) 
                        return cb(err);
                    Campaign.app.models.impression.count({campaign_id : id}, function(err, countImp) {
                        if(err) 
                            return cb(err);
                        return res.json({
                            countClick : countClick,
                            countImp : countImp,
                            CPC : campaign.CPC,
                            CPI : campaign.CPI,
                            cost : campaign.CPC*countClick + campaign.CPI* countImp
                        });
                    });
                });
            });
        });
    }
    Campaign.remoteMethod('costCampaign', {
        description: '',
        accepts: [
            {arg: 'id', type: 'number',  required:true},
            {arg: 'req', type: 'object', http:{source:'req'}},
            {arg: 'res', type: 'object', http:{source:'res'}},
        ],
        http: {verb: 'get',path: '/:id/cost'},
    });


    Campaign.graphStates = function(req,campaignId,locationId,startDate,endDate,res,cb){
        Campaign.app.models.partner.isAdmin(req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return cb(err);

            if(campaignId && !isAdmin && _.indexOf(ids, campaignId) == -1)
                return cb(ERROR(403,'permison denied'));

        
            var where = [];
            if(campaignId) where.push(' campaign_id = '+campaignId);
            else if(!isAdmin){
                where.push(' campaign_id IN ('+ids+')');
            }
            if(locationId) where.push(' location_id = '+locationId);
            if(startDate) where.push(' creation_date >= \''+startDate+'\'');
            if(endDate) where.push(' creation_date <= \''+endDate+'\'');

            if(where.length > 0)
                where = where.join(' AND ');
            if(where != "")
                where = " WHERE " + where; 
            var sql  = "SELECT DATE_FORMAT(creation_date,'%Y-%m-%d') as 'key' ,COUNT(*) AS value FROM impression "+where+" GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d' )";
            connector.execute(sql,null,(err,impressions)=>{
                if(err)
                    return cb(err);
            var sql  = "SELECT DATE_FORMAT(creation_date,'%Y-%m-%d') as 'key' ,COUNT(*) AS value FROM click "+where+" GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d' )";
                connector.execute(sql,null,(err,clicks)=>{
                    if(err)
                        return cb(err);
                    return res.json([{
                       name : 'clicks',
                       series : clicks 
                    },{
                        name : 'impressions',
                        series : impressions,
                    }]);
                });

            });
        });
    }
    Campaign.remoteMethod('graphStates', {
        description: '',
        accepts: [
            {arg: 'req', type: 'object', http:{source:'req'}},
            {arg: 'campaignId', type: 'number',  "http": {"source": "query"}},
            {arg: 'locationId', type: 'number',  "http": {"source": "query"}},
            {arg: 'startDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'endDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'res', type: 'object', http:{source:'res'}},
        ],
        http: {verb: 'get',path: '/graphStates'},
    });

    Campaign.overAllStates = function(req,campaignId,locationId,startDate,endDate,res,cb){
        Campaign.app.models.partner.isAdmin(req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return cb(err);

            if(campaignId && !isAdmin && _.indexOf(ids, campaignId) == -1)
                return cb(ERROR(403,'permison denied'));

            var where = {};
            if(campaignId) where.campaign_id =campaignId;
            if(locationId) where.location_id = locationId;
            if(startDate) where.creation_date = {gte : startDate};
            if(endDate) where.creation_date = {lte : endDate};

            Campaign.findById(campaignId,function(err,campaign){
                if(err) 
                    return cb(err);
                if(!campaign)
                    return cb(ERROR(404,'campaign not found'));
                Campaign.app.models.click.find({where : where,fields : {client_id : true}}, function(err, allClicks) {
                    if(err) 
                        return cb(err);
                    Campaign.app.models.impression.find({where : where,fields : {client_id : true}}, function(err, allImpressions) {
                        if(err) 
                            return cb(err);
                        var uniqeUsers = {};
                        _.each(allClicks,(c)=>{uniqeUsers[c.client_id] = true;});
                        _.each(allImpressions,(c)=>{uniqeUsers[c.client_id] = true;});

                        return res.json({
                            clicks : allClicks.length,
                            impressions : allImpressions.length,
                            usersReached : Object.keys(uniqeUsers).length,
                            cost : campaign.CPC*allClicks.length + campaign.CPI* allImpressions.length
                        });
                    });
                });
            });
        });
    }
    Campaign.remoteMethod('overAllStates', {
        description: '',
        accepts: [
            {arg: 'req', type: 'object', http:{source:'req'}},
            {arg: 'campaignId', type: 'number',required : true, "http": {"source": "query"}},
            {arg: 'locationId', type: 'number',  "http": {"source": "query"}},
            {arg: 'startDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'endDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'res', type: 'object', http:{source:'res'}},
        ],
        http: {verb: 'get',path: '/overAllStates'},
    });

    Campaign.actionStates = function(req,res,cb){
        Campaign.app.models.partner.isAdmin(req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return cb(err);
            var where = {}
            if(!isAdmin){
                where = {campaign_id : {inq : ids}}
            }
            Campaign.app.models.click.count(where, function(err, countAllClicks) {
                if(err) 
                    return cb(err);
                Campaign.app.models.impression.count(where, function(err, countAllImpressions) {
                    if(err) 
                        return cb(err);

                    var sql = "SELECT count(*) AS value FROM impression WHERE YEAR(creation_date) = YEAR(CURRENT_DATE) AND MONTH(creation_date) = MONTH(CURRENT_DATE) AND DAY(creation_date) = DAY(CURRENT_DATE)"              
                    connector.execute(sql,null,function(err,countImpressionInDay){
                        if(err) 
                            return cb(err);
                    var sql = "SELECT count(*) AS value FROM click WHERE YEAR(creation_date) = YEAR(CURRENT_DATE) AND MONTH(creation_date) = MONTH(CURRENT_DATE) AND DAY(creation_date) = DAY(CURRENT_DATE)"              
                        connector.execute(sql,null,function(err,countClickInDay){
                            if(err) 
                                return cb(err);
                            
                            return res.json({
                                clicks : {
                                    all : countAllClicks,
                                    day : countClickInDay[0].value
                                },
                                impressions : {
                                    all : countAllImpressions,
                                    day : countImpressionInDay[0].value
                                }
                            });
                        });
                    });
                });
            });
        });
    }
    Campaign.remoteMethod('actionStates', {
        description: '',
        accepts: [
            {arg: 'req', type: 'object', http:{source:'req'}},
            {arg: 'res', type: 'object', http:{source:'res'}},
        ],
        http: {verb: 'get',path: '/actionStates'},
    });

    Campaign.locationStates = function(req,campaignId,locationId,startDate,endDate,res,cb){
        Campaign.app.models.partner.isAdmin(req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return cb(err);

            if(campaignId && !isAdmin && _.indexOf(ids, campaignId) == -1)
                return cb(ERROR(403,'permison denied'));

            var where = [];

            if(!campaignId && !isAdmin) where.push(' campaign_id IN ('+ids+')');
            if(campaignId) where.push(' campaign_id = '+campaignId);
            if(locationId) where.push(' location_id = '+locationId);
            if(startDate) where.push(' creation_date >= \''+startDate+'\'');
            if(endDate) where.push(' creation_date <= \''+endDate+'\'');

            if(where.length > 0)
                where = where.join(' AND ');
            if(where != "")
                where = " WHERE " + where; 
            var sql = "SELECT location_id AS 'key',name,lat, lng,routerName,count(*) AS value FROM impression  INNER JOIN locations ON impression.location_id = locations.id "+ where +" GROUP BY location_id"
            connector.execute(sql,null,(err,impressions)=>{
                if(err)
                    return cb(err);
            var sql = "SELECT location_id AS 'key',name,lat,lng,routerName,count(*) AS value FROM click  INNER JOIN locations ON click.location_id = locations.id "+ where +" GROUP BY location_id"
                connector.execute(sql,null,(err,clicks)=>{
                    if(err)
                        return cb(err);
                    return res.json([{
                       name : 'clicks',
                       series : clicks 
                    },{
                        name : 'impressions',
                        series : impressions,
                    }]);
                });

            });
        });
    }
    Campaign.remoteMethod('locationStates', {
        description: '',
        accepts: [
            {arg: 'req', type: 'object', http:{source:'req'}},
            {arg: 'campaignId', type: 'number',  "http": {"source": "query"}},
            {arg: 'locationId', type: 'number',  "http": {"source": "query"}},
            {arg: 'startDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'endDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'res', type: 'object', http:{source:'res'}},
        ],
        http: {verb: 'get',path: '/locationStates'},
    });

    Campaign.genderStates = function(req,campaignId,locationId,startDate,endDate,res,cb){
         Campaign.app.models.partner.isAdmin(req.accessToken,{getCampaignIds :true},function(err,isAdmin,ids){
            if(err)
                return cb(err);

            var where = [];
                
            if(campaignId && !isAdmin && _.indexOf(ids, campaignId) == -1)
                return cb(ERROR(403,'permison denied'));
            if(!campaignId && !isAdmin)
                where.push(' campaign_id IN ('+ids+')');
            if(campaignId) where.push(' campaign_id = '+campaignId);
            if(locationId) where.push(' location_id = '+locationId);
            if(startDate) where.push(' creation_date >= \''+startDate+'\'');
            if(endDate) where.push(' creation_date <= \''+endDate+'\'');

            if(where.length > 0)
                where = where.join(' AND ');
            if(where != "")
                where = " WHERE " + where; 
            var sql = "SELECT gender AS 'key',count(*) AS value FROM impression  INNER JOIN client ON impression.client_id = client.id "+ where +" GROUP BY gender"
            connector.execute(sql,null,(err,impressions)=>{
                if(err)
                    return cb(err);
                var sql = "SELECT gender AS 'key',count(*) AS value FROM click  INNER JOIN client ON click.client_id = client.id "+ where +" GROUP BY gender"
                connector.execute(sql,null,(err,clicks)=>{
                    if(err)
                        return cb(err);
                    return res.json([{
                       name : 'clicks',
                       series : clicks 
                    },{
                        name : 'impressions',
                        series : impressions,
                    }]);
                });
            });
        });
    }
    Campaign.remoteMethod('genderStates', {
        description: '',
        accepts: [
            {arg: 'req', type: 'object', http:{source:'req'}},
            {arg: 'campaignId', type: 'number',  "http": {"source": "query"}},
            {arg: 'locationId', type: 'number',  "http": {"source": "query"}},
            {arg: 'startDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'endDate', type: 'string',  "http": {"source": "query"}},
            {arg: 'res', type: 'object', http:{source:'res'}},
        ],
        http: {verb: 'get',path: '/genderStates'},
    });


    Campaign.states = function(req,partner_id,cb) {
        var CampaignM = app.models.Campaign;
        var current_progress=[];
        var campaign_clicks =[];
        var campaign_impressions=[];
        //CampaignM.findOne({where: { status: 1 },order: 'RAND()'}, cb);
        var where = { partner_id: partner_id};
        Campaign.app.models.partner.isAdmin(req.accessToken,function(err,isAdmin){
            if(err)
                return cb(err);
            if(!isAdmin){
                where = {partner_id : req.accessToken.userId }
            }
            CampaignM.find({where:where}, function(err, campaignes) {
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

                if(!campaignes.length)
                    return cb(null,result)
                campaignes.forEach(campaign => {
                   
                   // console.log("campaign is "+campaign.name)
                    //var sql ="select count(*) as clicks_count from AD inner join click on ad.id = ad_id where campaign_id='"+campaign.id+"'";
                    var sql ="select count(*) as clicks_count from  click  where campaign_id='"+campaign.id+"'";
                    connector.execute(sql, null, (err, resultObjects) => {
                        if(!err){
                            campaign_clicks[campaign.id] = resultObjects[0].clicks_count;
                            console.log("campaign_clicks "+campaign_clicks[campaign.id]+" for id "+campaign.id)
                            sql = "SELECT count(*) AS value FROM (SELECT count(*) AS value FROM impression where campaign_id = "+campaign.id+" GROUP BY location_id) AS a"
                            connector.execute(sql, null, (err, countLocations) => {
                                if(err)
                                    return cb(err);
                                sql = "SELECT count(*) AS value FROM (SELECT count(*) AS value FROM impression where campaign_id = "+campaign.id+" GROUP BY client_id) AS a"
                                connector.execute(sql, null, (err, countUsers) => {
                                    if(err)
                                        return cb(err);

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
                                            obj.countLocations = countLocations[0].value;
                                            obj.countUsers = countUsers[0].value;
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
                                });


                            });
                        }
                        else
                                process.nextTick(function() {
                                cb(err, null);
                                });
                            
                    });

                    //sql ="select count(*) as impressions_count from AD inner join click on ad.id = ad_id where campaign_id='"+campaign.id+"'";
                  
                    
                });
            });
        });
  }
};
