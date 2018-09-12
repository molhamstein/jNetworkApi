'use strict';

module.exports = function(Impression) {
	Impression.beforeRemote('create', function( ctx, modelInstance, next) {
		if(!ctx.req.body.mobile)
			return next();
		
		Impression.app.models.client.findOne({where : {mobile : ctx.req.body.mobile}},function(err,client){
			if(err)
				return next(err);
			if(client)
				ctx.req.body.client_id = client.id;
			delete ctx.req.body.mobile;
			return next();
		});
	});

};
