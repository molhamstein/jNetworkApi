'use strict';

module.exports = function(Payments) {
	Payments.afterRemote('create', function(ctx,result, next) {
		var sql = "update partner SET balance = balance + "+result.value+" WHERE id = "+result.partner_id;
		console.log(sql);
		Payments.app.dataSources.mydb.connector.execute(sql,null,(err, resultObjects) => {
			if(err) // TODO delete Payments
				return next(err);
			

			return next();
		});
	});
};
