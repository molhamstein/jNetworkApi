'use strict';
var app = require('../../server/server');

const connector = app.dataSources.mydb.connector;

module.exports = function (paidAccess) {
  paidAccess.validatesInclusionOf('type', { in: ['automatic', 'manual']
  });
  /**
   *
   * @param {null} req
   * @param {Function(Error, object)} callback
   */

  paidAccess.getSellerCash = function (type, req, callback) {
    var result;
    // TODO
    var result;
    console.log("req.accessToken.userId")
    console.log(req.accessToken.userId)
    var sellerId = req.accessToken.userId;
    var sql = "SELECT  sum(price) as SUM FROM paid_access WHERE (type = '" + type + "'  AND   seller_id = '" + sellerId + "')";
    connector.execute(sql, [], function (err, cash) {
      callback(null, cash[0]);

    })
  };
};
