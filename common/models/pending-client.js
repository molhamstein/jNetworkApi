'use strict';
var app = require('../../server/server');

module.exports = function (pendingClient) {
  /**
   *
   * @param {number} id
   * @param {Function(Error, object)} callback
   */

  pendingClient.activePendingClient = function (id, req, callback) {
    pendingClient.findOne({
      "where": {
        "id": id
      }
    }, function (err, clientPend) {
      if (err)
        callback(err, null)
      if (clientPend == null) {
        const err2 = new Error("clientNOTfound");
        err2.statusCode = 625;
        err2.code = 'CLIENT_NOT_FOUND';
        process.nextTick(function () {
          callback(err2, null);
        });
      } else if (clientPend.status != 'pending') {

        const err2 = new Error("clientIsNotPending");
        err2.statusCode = 626;
        err2.code = 'CLIENT_NOT_PENDING';
        process.nextTick(function () {
          callback(err2, null);
        });
      } else {
        pendingClient.app.models.locations.findOne({
          where: {
            id: clientPend.location_id
          }
        }, function (err, location) {
          if (err)
            callback(err, null)
          console.log(location);
          app.models.paid_access.create({
            "price": location.manualActivationPrice,
            "type": "manual",
            "location_id": location.id,
            "seller_id": req.accessToken.userId
          }, function (err, paid_access) {
            if (err)
              callback(err, null)
            else {
              clientPend.status = "active"
              clientPend.update_at = new Date();
              clientPend.save()

              pendingClient.app.models.seller.findById(req.accessToken.userId, function (err, seller) {
                seller.cash += code.price;
                seller.save()
                callback(err, clientPend);

              })
            }

          })

        })
      }
    })
  };
};
