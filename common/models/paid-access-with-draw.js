'use strict';

module.exports = function (Paidaccesswithdraw) {

  Paidaccesswithdraw.afterRemote('create', function (context, paid, next) {
    console.log(paid);
    Paidaccesswithdraw.app.models.seller.findById(paid.seller_id, function (err, seller) {
      seller.cash += paid.batch;
      if (seller.cash < 0) {
        const err2 = new Error("cash down of zero");
        err2.statusCode = 630;
        err2.code = 'CACH_DOWN_OF_ZERO';
        return next(err2, null);
      } else {
        seller.save()
        return next();
      }
    })

  })
};
