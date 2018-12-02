'use strict';
var app = require('../../server/server');

const path = require('path');
const ejs = require('ejs');

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

  /**
   *
   * @param {Function(Error, object)} callback
   */

  Seller.getMyCash = function (req, callback) {
    Seller.findById(req.accessToken.userId, function (err, seller) {
      if (err)
        callback(err, null);

      callback(err, {"cash":seller.cash});

    })
  };

  Seller.on('resetPasswordRequest', function (info) {
    // let url = `${config.siteDomain}/login/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    // let url = "http://104.217.253.15/dlaaalAppDevelop/Dlaaal-webApp/dist/#" + `/login/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    let url = `https://techpeak-net.com/pos/#/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    ejs.renderFile(path.resolve(__dirname + "../../../server/views/reset-password-template.ejs"), {
      url: url
    }, function (err, html) {
      if (err) return console.log('> error sending password reset email', err);
      Seller.app.models.Email.send({
        to: info.email,
        from: 'techpeak.networks@gmail.com',
        subject: 'Password reset',
        html: html
      }, function (err) {
        if (err) return console.log('> error sending password reset email', err);
        console.log("SSSSSSSS");
      });
    });
  });


};
