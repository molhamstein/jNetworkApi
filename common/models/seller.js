'use strict';
var app = require('../../server/server');

const connector = app.dataSources.mydb.connector;

module.exports = function (Seller) {
  //   Seller.afterRemote('*', function (ctx, seller, next) {
  //     // Seller.include(seller, 'locations', next);
  //   });

  Seller.afterRemote('login', function (context, client, next) {
    // Seller.include(client, 'locations', next);

    // console.log(client.user);
    var locationId = client.toJSON()['user']['location_id']
    Seller.app.models.locations.findById(locationId, function (err, location) {
      client.location = location;
      next();
    })
  })

  /**
   *
   * @param {Function(Error, array)} callback
   */

  Seller.getCategories = function (req, callback) {
    var result;
    console.log("req.accessToken.userId")
    console.log(req.accessToken.userId)
    var sellerId = req.accessToken.userId;
    var sql = "SELECT price , used_count,COUNT(Id) as count  FROM location_code WHERE (status = 'pending'  AND   seller_id = '" + sellerId + "') group by used_count, price";
    connector.execute(sql, [], function (err, categories) {
      callback(null, categories);

    })
  };

};
