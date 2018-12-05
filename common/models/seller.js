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


  Seller.beforeRemote('create', function (ctx, seller, next) {
    var data = ctx.req.body;
    Seller.findOne({
      "where": {
        "location_id": data.location_id,
        "is_primary": true
      }
    }, function (err, seller) {
      if (err)
        return next(err)
      console.log(seller);
      if (seller == null && !data.is_primary)
        return next(ERROR(631, 'first POS sould be primary'))
      if (seller != null && data.is_primary)
        return next(ERROR(632, 'just one primary POS'))
      next()
    })

  })

  /**
   *
   * @param {Function(Error, array)} callback
   */

  Seller.getCategories = function (seller_id, req, callback) {
    var result;
    if (seller_id == undefined)
      var sellerId = req.accessToken.userId;
    else
      var sellerId = seller_id;

    var sql = "SELECT price , used_count,COUNT(Id) as count  FROM location_code WHERE (status = 'pending'  AND   seller_id = '" + sellerId + "') group by used_count, price";
    console.log(sql)
    connector.execute(sql, [], function (err, categories) {
      callback(null, categories);

    })
  };


  /**
   *
   * @param {number} seller_id
   * @param {Function(Error, object)} callback
   */

  Seller.getState = function (seller_id, callback) {

    var response = {}
    var sql = "SELECT  sum(price) as total,count(id) as countSold FROM paid_access WHERE (seller_id = '" + seller_id + "')";
    connector.execute(sql, [], function (err, total) {

      if (err)
        return callback(err, null)
      response['total'] = total[0]['total'];
      response['countSold'] = total[0]['countSold'];

      var sql = "SELECT  cash as incash FROM seller WHERE (id = '" + seller_id + "')";
      connector.execute(sql, [], function (err, total) {
        if (err)
          return callback(err, null)
        response['incash'] = total[0]['incash'];
        var sql = "SELECT  sum(price) as totalToday,count(id) as countSoldToday FROM paid_access WHERE (seller_id = '" + seller_id + "' AND cast(created_at as Date) = cast(CURRENT_TIMESTAMP() as Date) )";
        connector.execute(sql, [], function (err, total) {
          response['totalToday'] = total[0]['totalToday'];
          response['countSoldToday'] = total[0]['countSoldToday'];
          if (err)
            return callback(err, null)

          callback(null, response)
        })
      })
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

      callback(err, {
        "cash": seller.cash
      });

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
