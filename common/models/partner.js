'use strict';

var _ = require('lodash');
module.exports = function(Partner) {
	Partner.isAdmin = function(accessToken,option,cb){
		if(typeof cb != 'function'){
			cb = option;
			option = {};
		}
		if(!accessToken || !accessToken.userId)
			return cb(null,false);
		Partner.findById(accessToken.userId, function(err, user) {
			if(err)
				return cb(err);
			if(!user || !user.roles.length)
				return cb(null,false);
			var isAdmin = _.some(user.roles(),['code','admin']);
			if(isAdmin || (!option && !option.getCampaignIds))
				return cb(null,isAdmin);

			Partner.getCampaignIds(accessToken.userId,(err,ids)=>{
				if(err)
					return cb(err);
				return cb(null,isAdmin,ids);
			});
		});
	}

	Partner.getCampaignIds = function(userId,cb){
		Partner.app.models.campaign.find({where : {partner_id : userId}}, function(err, campaigns) {
			if(err)
				return cb(err);
			var ids = [];
			_.each(campaigns,(c)=>{ids.push(c.id)});
			return cb(null,ids);
		});
	}
};