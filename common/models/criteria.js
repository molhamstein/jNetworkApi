'use strict';

module.exports = function(Criteria) {
	Criteria.afterRemote('create', function(ctx,result, next) {
		Criteria.app.models.campaign.findOne({id : result.campaign_id},function(err,campaign){
			if(err)
				return _error(err,result,next);
			if(!campaign)
				return _error(ERROR(404,'campaign not found'),result,next);
			// TODO delete Criteria

			Criteria.app.models.criteria_price.findOne({type : result.type},function(err,price){
				if(err)
					return _error(err,result,next);
				campaign.CPC = Number(campaign.CPC) + Number(price.perClick);
				campaign.CPI = Number(campaign.CPI) + Number(price.perImp);

				campaign.save((err)=>{
					if(err)
						return _error(err,result,next);
					return next();
				});
			});
		});
	});	
};

var _error = function(err,result,next){
	// TODO delete Criteria
	return next(err);
}
