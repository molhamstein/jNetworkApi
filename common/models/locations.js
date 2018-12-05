'use strict';
var SSH = require('simple-ssh');
var _ = require('lodash');
var app = require('../../server/server');

const connector = app.dataSources.mydb.connector;

module.exports = function (Locations) {
  Locations.validatesInclusionOf('type', { in: ['free', 'automatic', 'manual']
  });


  // var ssh = new SSH({
  //   host: '185.84.236.39',
  //   user: 'jihad_lts',
  //   port: 6245,
  //   pass: 'jihad_lts'
  // });
  // console.log(ssh)
  // ssh.exec('echo "awesome!"', {
  //   out: function (stdout) {
  //     console.log("Ssssss");
  //     console.log(stdout);
  //   }
  // }).start();

  /**
   *
   * @param {string} routerName
   * @param {number} username
   * @param {Function(Error, object)} callback
   */



  Locations.isMyLocation = function (accessToken, location_id, type, cb) {
    if (type == 'partner')
      Locations.app.models.Partner.findById(accessToken.userId, function (err, user) {
        if (err)
          return cb(err);
        if (!user || !user.roles.length)
          return cb(null, false);
        var isAdmin = _.some(user.roles(), ['code', 'admin']);
        if (isAdmin)
          return cb(null, true)
        Locations.findOne({
          "where": {
            id: location_id,
            partner_id: accessToken.userId
          }
        }, function (err, onlocation) {
          if (err)
            return cb(err, null)
          else if (onlocation == null)
            return cb(null, false)
          else
            return cb(null, true)

        })
      })
    else if (type == 'seller')
      Locations.app.models.seller.findOne({
        "where": {
          "id": accessToken.userId,
          "location_id": location_id
        }
      }, function (err, seller) {
        if (err)
          return cb(err, null)
        else if (seller == null)
          return cb(null, false)
        else
          return cb(null, true)

      })
  }



  Locations.getMyLocation = function (accessToken, justIDS, cb) {
    Locations.app.models.Partner.findById(accessToken.userId, function (err, user) {
      if (err)
        return cb(err);
      if (!user || !user.roles.length)
        return cb(null, false);
      var isAdmin = _.some(user.roles(), ['code', 'admin']);
      var where = {}
      if (!isAdmin)
        where = {
          "where": {
            partner_id: accessToken.userId
          }
        };
      Locations.find(where, function (err, locations) {
        if (err)
          return cb(err, null)
        if (justIDS) {
          var ids = _.pluck(locations, 'id'); // [12, 14, 16, 18]
          return cb(null, ids)
        }
        return cb(null, locations)

      })
    })
  }


  /**
   *
   * @param {Function(Error, array)} callback
   */

  Locations.getMyLocations = function (req, callback) {
    var result;
    Locations.getMyLocation(req.accessToken, false, function (err, locations) {
      if (err)
        return callback(err, null);
      return callback(err, locations);


    })
  };

  Locations.paidLocationsState = function (location_id, req, callback) {
    Locations.isMyLocation(req.accessToken, location_id, 'partner', function (err, myLocation) {
      if (err)
        return callback(err, null)
      if (myLocation == false) {
        return callback(ERROR(403, 'permison denied'), null);
      } else {
        var response = {}
        var sql = "SELECT  sum(price) as total,count(id) as countSold FROM paid_access WHERE (location_id = '" + location_id + "')";
        connector.execute(sql, [], function (err, total) {

          if (err)
            return callback(err, null)
          response['total'] = total[0]['total'];
          response['countSold'] = total[0]['countSold'];

          var sql = "SELECT  sum(cash) as incash, count(id) as pos FROM seller WHERE (location_id = '" + location_id + "')";
          connector.execute(sql, [], function (err, total) {
            if (err)
              return callback(err, null)
            response['incash'] = total[0]['incash'];
            response['pos'] = total[0]['pos'];
            var sql = "SELECT  sum(price) as totalToday,count(id) as countSoldToday FROM paid_access WHERE (location_id = '" + location_id + "' AND cast(created_at as Date) = cast(CURRENT_TIMESTAMP() as Date) )";
            connector.execute(sql, [], function (err, total) {
              response['totalToday'] = total[0]['totalToday'];
              response['countSoldToday'] = total[0]['countSoldToday'];
              if (err)
                return callback(err, null)

              callback(null, response)
            })
          })
        })

      }
    })
  }

  Locations.disconnectClient = function (routerName, username, callback) {
    var result;
    // TODO
    Locations.findOne({
      "where": {
        "routerName": routerName
      }
    }, function (err, oneLocation) {
      if (err) {
        callback(err, null);
      } else {
        var ip = oneLocation.id;
        var user = oneLocation.user;
        var port = oneLocation.port;
        var password = oneLocation.password;

        var ip = "185.84.236.39";
        var user = "jihad_lts";
        var port = "6245";
        var password = "jihad_lts";

        var ip = "185.84.236.155";
        var user = "guest";
        var port = "22";
        var password = "guest";


        var ssh = new SSH({
          host: ip,
          user: user,
          port: port,
          pass: password
        });
        console.log(ssh)
        ssh.exec('ip hotspot active remove [find user =0957465876 ]', {
          out: function (stdout) {
            console.log(stdout);
            callback(null, {});
          }
        }).start();
      }

    })
  };

};
