'use strict';
var SSH = require('simple-ssh');
var _ = require('lodash');
var app = require('../../server/server');
var schedule = require('node-schedule');

const connector = app.dataSources.mydb.connector;

module.exports = function (Locations) {
  Locations.validatesInclusionOf('type', {
    in: ['free', 'automatic', 'manual']
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
        var routerName = oneLocation.routerName;
        // var ip = "185.84.236.39";
        // var user = "jihad_lts";
        // var port = "6245";
        // var password = "jihad_lts";

        // var ip = "185.84.236.155";
        // var user = "guest";
        // var port = "22";
        // var password = "guest";


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


  schedule.scheduleJob('0 * * * * *', () => {
    Locations.find({}, function (err, data) {
      data.forEach(element => {
        if (element.ip != "" && element.ip != undefined)
          cleanLocation(element.routerName, element.ip, element.user, element.password, element.port)
      });
    })
  }) // run everyday at midnight

  function cleanLocation(routerName, ip, user, password, port) {
    var sql = "SELECT radacctid,username FROM `radacct` WHERE `acctstoptime` IS NULL AND `calledstationid` ='" + routerName + "'"
    console.log("sql")
    console.log(sql)
    connector.execute(sql, [], function (err, res) {
      if (err)
        return callback(err, null)
      if (res.length == 0)
        return
      var string = "";
      res.forEach(element => {
        string += element.radacctid + "," + element.username + ","
      });
      if (string != "") {
        string = string.substr(0, string.length - 1)
        string = "\"" + string + "\""
      }


      var ssh = new SSH({
        host: ip,
        user: user,
        port: port,
        pass: password
      });
      console.log(":global userput " + string + "; system script run checkuser")
      ssh.exec(":global userput " + string + "; system script run checkuser", {
          out: function (stdout) {
            console.log("stdout");
            console.log(stdout);
            var response = stdout;

            var stringIDS = "(";
            if (response['value'] == undefined)
              return
            response['value'].forEach(element => {
              stringIDS += "\'" + element.seeesionId + "\',"
            });
            if (stringIDS != "(")
              stringIDS = stringIDS.substr(0, stringIDS.length - 1)

            stringIDS += ")"
            if (stringIDS != "()") {
              var sql = "UPDATE `radacct` SET `acctstoptime` = Now() WHERE  radacctid IN " + stringIDS
              connector.execute(sql, [], function (err, res) {
                if (err)
                  return callback(err, null)
                console.log("seconde time");
                console.log(res);
                return callback(null, res)
              })
            } else {
              return callback(null, {})
            }
          }
        })
        .start();
    })
  }

  Locations.testSSH = function (routerName, callback) {
    var result;
    var sql = "SELECT radacctid,username FROM `radacct` WHERE `acctstoptime` IS NULL AND `calledstationid` ='" + routerName + "'"
    connector.execute(sql, [], function (err, res) {
      if (err)
        return callback(err, null)
      var string = "";
      console.log("firset time");
      console.log(res.length);

      res.forEach(element => {
        string += "\"seeesionId\":\"" + element.radacctid + "\",\"username\":\"" + element.username + "\","
      });
      if (string != "")
        string = string.substr(0, string.length - 1)

      console.log(string);

      // send to ssh

      Locations.findOne({
        "where": {
          "routerName": routerName
        }
      }, function (err, oneLocation) {
        if (err) {
          callback(err, null);
        } else {
          var response = {
            "Values": [{
              "SessionID": "66620",
              "Username": "00963993196452",
            }, {
              "SessionID": "154017",
              "Username": "00963991301707",
            }, {
              "SessionID": "154019",
              "Username": "00963949229785",
            }, {
              "SessionID": "154020",
              "Username": "00963930019783",
            }]
          }

          var stringIDS = "(";

          res.forEach(element => {
            stringIDS += "\'" + element.radacctid + "\',"
          });
          if (stringIDS != "(")
            stringIDS = stringIDS.substr(0, stringIDS.length - 1)

          stringIDS += ")"
          if (stringIDS != "()") {
            var sql = "UPDATE `radacct` SET `acctstoptime` = Now() WHERE  radacctid IN " + stringIDS
            // var sql = "SELECT * FROM `radacct` WHERE radacctid IN " + stringIDS
            connector.execute(sql, [], function (err, res) {
              if (err)
                return callback(err, null)
              console.log("seconde time");
              console.log(res);
              return callback(null, res)
            })
          } else {
            return callback(null, {})
          }
          // console.log(oneLocation)
          // // var ip = oneLocation.ip;
          // // var user = oneLocation.user;
          // // var port = oneLocation.port;
          // // var password = oneLocation.password;
          // // var routerName = oneLocation.routerName;

          // var ip = "185.84.236.155";
          // var user = "user_adm";
          // var port = "22";
          // var password = "tcpk@PIO";


          // var ssh = new SSH({
          //   host: ip,
          //   user: user,
          //   port: port,
          //   pass: password
          // });
          // ssh.exec('system script run checkuser ', {
          //     out: function (stdout) {
          //       console.log("stdout");
          //       console.log(stdout);
          //     }
          //   })
          //   .start();
        }

      })

      // response from ssh
    })

  };

};
