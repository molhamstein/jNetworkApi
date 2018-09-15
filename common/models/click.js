'use strict';

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
};
