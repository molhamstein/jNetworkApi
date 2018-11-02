'use strict';
var _ = require('lodash');
module.exports = function(Impression) {
	Impression.beforeRemote('create', function( ctx, modelInstance, next) {
		if(!ctx.req.body.mobile)
			return next();
		
		Impression.app.models.client.findOne({where : {mobile : ctx.req.body.mobile}},function(err,client){
			if(err)
				return next(err);
			if(!client)
				return next(ERROR(404,'client not found'))
			ctx.req.body.client_id = client.id;
			delete ctx.req.body.mobile;
			return next();
		});
	});

	Impression.beforeRemote('find', function( ctx, modelInstance, next) {
        Impression.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds : true},function(err,isAdmin,ids){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx, 'args.filter.where.ad_id', {inq : ids});
            return next();
        });
    });

    Impression.beforeRemote('count', function( ctx, modelInstance, next) {
        Impression.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds : true},function(err,isAdmin,ids){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx.args, 'where.ad_id', {inq : ids});
            return next();
        });
    });

    var beforeRemoteForPermision = function( ctx, modelInstance, next) {
      Impression.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds :true},function(err,isAdmin,ids){
          if(err)
              return next(err);
          if(!isAdmin)
              return next(ERROR(403,'permison denied'));
          return next();
      });
    };
    Impression.beforeRemote('findById', beforeRemoteForPermision);
    Impression.beforeRemote('replaceById', beforeRemoteForPermision);
    Impression.beforeRemote('deleteById', beforeRemoteForPermision);
};
