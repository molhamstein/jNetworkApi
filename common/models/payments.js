'use strict';
var  _ = require('lodash');
module.exports = function(Payments) {
	Payments.afterRemote('create', function(ctx,result, next) {
		var sql = "update partner SET balance = balance + "+result.value+" WHERE id = "+result.partner_id;
		Payments.app.dataSources.mydb.connector.execute(sql,null,(err, resultObjects) => {
			if(err) // TODO delete Payments
				return next(err);
			

			return next();
		});
	});

	Payments.beforeRemote('find', function( ctx, modelInstance, next) {
        Payments.app.models.partner.isAdmin(ctx.req.accessToken,function(err,isAdmin){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx, 'args.filter.where.partner_id', ctx.req.accessToken.userId);
            return next();
        });
    });

    Payments.beforeRemote('count', function( ctx, modelInstance, next) {
        Payments.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds : true},function(err,isAdmin,ids){
            if(err)
                return next(err);
            if(!isAdmin)
                _.set(ctx, 'args.where.partner_id', ctx.req.accessToken.userId);
            return next();
        });
    });

    var beforeRemoteForPermision = function( ctx, modelInstance, next) {
      Payments.app.models.partner.isAdmin(ctx.req.accessToken,{getAdsIds :true},function(err,isAdmin,ids){
          if(err)
              return next(err);
          if(!isAdmin)
              return next(ERROR(403,'permison denied'));
          return next();
      });
    };
    Payments.beforeRemote('findById', beforeRemoteForPermision);
    Payments.beforeRemote('replaceById', beforeRemoteForPermision);
    Payments.beforeRemote('deleteById', beforeRemoteForPermision);
};
