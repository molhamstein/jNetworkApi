'use strict';
var _ = require('lodash');
module.exports = function(Click) {
	Click.beforeRemote('create', function( ctx, modelInstance, next) {
		if(!ctx.req.body.mobile)
			return next();
		Click.app.models.client.findOne({where : {mobile : ctx.req.body.mobile}},function(err,client){
			if(err)
				return next(err);
			if(!client)
				return next(ERROR(404,'client not found'))
			ctx.req.body.client_id = client.id;
			delete ctx.req.body.mobile;
			return next();
		});
	});

	Click.beforeRemote('find', function( ctx, modelInstance, next) {
        Click.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds : true},function(err,isAdmin,ids){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx, 'args.filter.where.ad_id', {inq : ids});
            return next();
        });
    });

    Click.beforeRemote('count', function( ctx, modelInstance, next) {
        Click.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds : true},function(err,isAdmin,ids){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx.args, 'where.ad_id', {inq : ids});
            return next();
        });
    });

    var beforeRemoteForPermision = function( ctx, modelInstance, next) {
      Click.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds :true},function(err,isAdmin,ids){
          if(err)
              return next(err);
          if(!isAdmin)
              return next(ERROR(403,'permison denied'));
          return next();
      });
    };
    Click.beforeRemote('findById', beforeRemoteForPermision);
    Click.beforeRemote('replaceById', beforeRemoteForPermision);
    Click.beforeRemote('deleteById', beforeRemoteForPermision);
};
