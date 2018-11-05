'use strict';

module.exports = function(Criteria) {
	Criteria.afterRemote('create', function(ctx,result, next) {
		Criteria.app.models.campaign.findOne({where : {id : result.campaign_id}},function(err,campaign){
			if(err)
				return _error(err,result,next);
			if(!campaign)
				return _error(ERROR(404,'campaign not found'),result,next);
			// TODO delete Criteria

			Criteria.count({campaign_id : result.campaign_id, type : result.type},function(err,countType){
				if(err)
					return _error(errr,result,next);
				if(countType > 0)
					return next();


				Criteria.app.models.criteria_price.findOne({where : {type : result.type}},function(err,price){
					if(err)
						return _error(err,result,next);

					campaign.updateAttributes({CPC : Number(campaign.CPC) + Number(price.perClick),CPI : Number(campaign.CPI) + Number(price.perImp)},(err)=>{
						if(err)
							return _error(err,result,next);
						return next();
					});
				});
			});
		});
	});	
};

var _error = function(err,result,next){
	// TODO delete Criteria
	return next(err);
}
