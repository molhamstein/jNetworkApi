'use strict';
var speakeasy = require('speakeasy');
var _ = require('lodash');
var http = require('http');
var app = require('../../server/server');
var g = require('strong-globalize')();
var debug = require('debug')('loopback:user');
var request = require('request');
var dateFormat = require('dateformat');
var async = require('async');


const connector = app.dataSources.mydb.connector;
const configPath = process.env.NODE_ENV === undefined ?
  '../../server/config.json' :
  `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
const mongoXlsx = require('mongo-xlsx');

module.exports = function (Client) {

  var urlFileRoot = config.domain + config.restApiRoot + "/attachments";

  var urlFileRootexcel = urlFileRoot + '/excelFiles/download/';


  //send verification email after registration
  delete Client.validations.username;
  var re = /^([0|\+[0-9]{1,13})?/;
  delete Client.validations.email;
  Client.validate('mobile', function (err) {
    if (this.mobile !== undefined && !re.test(this.mobile)) err();
  }, {
    message: 'mobile format is invalid'
  });

  // Adds email uniqueness validation
  //  Client.validatesUniquenessOf('mobile', {message: 'Mobile already exists'}); 


  Client.beforeRemote('create', (ctx, user, next) => {
    //Object.assign(ctx.args, { np: user.password });

    var body = ctx.req.body;
    var clientM = app.models.client;
    console.log(body.mobile);
    clientM.findOne({
      where: {
        mobile: body.mobile
      }
    }, function (err, userResult) {
      //console.log(userResult.mobile);
      if (userResult) {
        const err2 = new Error("Mobile already exists");
        err2.statusCode = 622;
        err2.code = 'Mobile_already_exists';
        next(err2);
      } else {

        body.np = body.password;
        //console.log("before create np = "+body.password);
        //console.log("before create np = "+"  "+body.np);
        next();
      }


    });

  });



  Client.afterRemote('create', function (context, client, next) {
    console.log('> user.afterRemote triggered');
    generateCode(function (code) {

      // var code = speakeasy.totp({
      //   key: 'APP_SECRET' + client.mobile
      // });
      console.log('Two factor code for ' + client.email + ': ' + code);
      console.log("code");
      console.log(code);

      client.updateAttributes({
        emailVerified: false
      }, function (err) {
        if (err) {

        } else {
          var nowDate = new Date(),
            expDate = new Date(nowDate);
          expDate.setMinutes(nowDate.getMinutes() + 30);
          Client.app.models.verificationTokens.create({
            "code": code,
            "client_id": client.id,
            "created_at": nowDate,
            "expiration_date": expDate
          }, function (err, data) {
            if (err)
              console.log(err);
          })
        }
      });

      request.get(
        'https://services.mtnsyr.com:7443/general/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm=' + (client.mobile).substr(2) + '&Msg=Your%20Verification%20Code ' + String(code) + '&Lang=0&Flash=0',
        function (res) {
          // res.on('data', function (data) {
          console.log(res);
          // console.log(data.toString());
          next();
          // });
        }
      ).on('error', function () {
        data = {
          name: "can't send sms",
          status: 604,
          message: "please check your sms api"
        };
        console.log(data)
        context.result = data;
        //console.log(context.result);
        next();
      });
    })

  });

  // Client.afterRemote('login', function (context, client, next) {
  function afterLogin(context, client, next) {
    // console.log(client);
    var clientM = app.models.client;
    var data = client;
    clientM.findOne({
      where: {
        id: client.id
      }
    }, function (err, user) {
      if (user.emailVerified == false) {
        console.log("unauthorized")
        data = {
          name: "unauthorized",
          status: 601,
          message: "please verify your account"
        };
        const err = new Error("unauthorized");
        err.statusCode = 601;
        err.code = 'VERIFICATION_REQUIRED';
        next(err);
      } else
        next();

    });

  };
  // Client.afterRemote('Confirmreset', function (context, data, next) {
  function afterConfirmreset(context, data, next) {
    console.log(data.mobile);
    if (data.mobile) {
      var clientM = app.models.client;
      //var data = client;
      clientM.findOne({
        where: {
          mobile: data.mobile
        }
      }, function (err, user) {
        var sql = " update radcheck set value='" + user.np + "' where username='" + user.mobile + "' and attribute='password'";
        connector.execute(sql, null, (err, resultObjects) => {
          if (!err) {

            console.log("updated successful to radius");
          } else
            console.log(err);
        })

      });
    }

    next();

  };
  // Sahel123!
  // Client.afterRemote('reset', function (context, client, next) {
  function afterReset(context, client, next) {
    console.log('> user.afterRemote reset triggered');
    generateCode(function (code) {

      // var code = speakeasy.totp({
      //   key: 'APP_SECRET' + client.mobile
      // });
      console.log('Two factor code for ' + client.email + ': ' + code);
      var nowDate = new Date(),
        expDate = new Date(nowDate);
      expDate.setMinutes(nowDate.getMinutes() + 30);
      Client.app.models.verificationTokens.create({
        "code": code,
        "client_id": client.id,
        "created_at": nowDate,
        "expiration_date": expDate
      }, function (err, data) {

      })
      request.get(
        'https://services.mtnsyr.com:7443/general/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm=' + (client.mobile).substr(2) + '&Msg=Your VerificationCode ' + String(code) + '&Lang=0&Flash=0',
        function (res) {
          // res.on('data', function (data) {
          console.log(res);
          next();
          // });
        }
      ).on('error', function () {
        var data = {
          name: "can't send sms",
          status: 604,
          message: "please check your sms api"
        };
        next();
      });
    })

  };




  Client.confirmSMS = function (mobile, code, callback) {
    console.log("TEEEEEESSSSSSSST")
    var clientM = app.models.client;
    clientM.findOne({
      where: {
        mobile: mobile
      }
    }, function (err, user) {
      if (err || user == null) {
        const err2 = new Error("userNOTfound");
        err2.statusCode = 604;
        err2.code = 'USER_NOT_FOUND';
        process.nextTick(function () {
          callback(null, err2);
        });
      } else {
        Client.app.models.verificationTokens.findOne({
          "where": {
            "code": code,
            "client_id": user.id,
            "status": "active",
            "expiration_date": {
              "gt": new Date()
            }
          }
        }, function (err, mainCode) {
          if (err || mainCode == null) {
            const err3 = new Error("AuthorizationFailed");
            err3.statusCode = 601;
            err3.code = 'AUTHORIZATION_FAILED';
            process.nextTick(function () {
              callback(null, err3);
            });
          } else if (new Date(mainCode.expiration_date) < new Date()) {
            const err2 = new Error("codeIsExpired");
            err2.statusCode = 605;
            err2.code = 'Code_IS_EXPIRED';
            process.nextTick(function () {
              callback(null, err2);
            });
          } else {
            user.updateAttributes({
              emailVerified: true
            }, function (err) {
              if (err) {
                callback(err);
              } else {
                mainCode.updateAttributes({
                  "status": "deactive"
                })
                var data = {
                  name: "success",
                  status: 402,
                  message: "confirmed success"
                }
                process.nextTick(function () {
                  callback(null, data);
                });
              }
            });
            var sql = " insert into radcheck (username,attribute,op,value) values ('" + mobile + "','password','==','" + user.np + "')"
            connector.execute(sql, null, (err, resultObjects) => {
              if (!err) {

                console.log("added successful to radius");
              } else
                console.log(err);
            })
          }
        })
      }
    });
  }


  Client.customSms = function (mobile, message, cb) {
    console.log(mobile, message);
    request.get(
      'https://services.mtnsyr.com:7443/general/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm=' + mobile + '&Msg=' + message + '&Lang=0&Flash=0',
      function (res) {
        // res.on('data', function (data) {
        console.log(res);
        return cb(null, 'Done');
        // });
      }
    ).on('error', function () {
      data = {
        name: "can't send sms",
        status: 604,
        message: "please check your sms api"
      };
      console.log(data)
      // context.result = data;
      return cb(new Error('error sms api'), null);
    });
  }
  Client.remoteMethod('customSms', {
    description: 'send message to user',
    accepts: [{
        arg: 'mobile',
        type: 'string',
        required: true,
        http: {
          source: 'form'
        }
      },
      {
        arg: 'message',
        type: 'string',
        required: true,
        http: {
          source: 'form'
        }
      },
    ],
    returns: {
      arg: 'message',
      type: 'string'
    },
    http: {
      verb: 'post',
      path: '/customSms'
    },
  });

  Client.onlineUsers = function (req, location, cb) {
    Client.app.models.partner.isAdmin(req.accessToken, function (err, isAdmin) {
      if (err)
        return cb(err);
      if (!isAdmin) {
        var names = [];
        var locationWhere = 'calledStationId = \'' + location + '\'';
        Client.app.models.locations.find({
          where: {
            partner_id: req.accessToken.userId
          }
        }, function (err, locations) {
          if (err) return cb(err);
          _.each(locations, (l) => {
            names.push('\'' + l.routerName + '\'')
          });

          if (location && !_.includes(names, location))
            return cb(ERROR(403, 'permison denied'));
          if (!location && locations.length > 0)
            locationWhere = 'calledStationId IN (' + names + ')';
          else
            return cb(null, []);

          var sql = "SELECT * FROM (SELECT * FROM radacct WHERE (" + locationWhere + " AND (acctstoptime IS NULL OR acctstoptime = ''))) AS  A JOIN client ON client.mobile = A.username";
          console.log(sql)
          connector.execute(sql, [], function (err, users) {
            if (err)
              return cb(err);
            return cb(null, users);
          });
        });
      } else {
        var sql = "SELECT * FROM (SELECT * FROM radacct WHERE (acctstoptime IS NULL OR acctstoptime = '')) AS  A JOIN client ON client.mobile = A.username";
        if (location)
          sql = "SELECT * FROM (SELECT * FROM radacct WHERE (calledStationId= '" + location + "' AND (acctstoptime IS NULL OR acctstoptime = ''))) AS  A JOIN client ON client.mobile = A.username"

        connector.execute(sql, [], function (err, users) {
          if (err)
            return cb(err);
          return cb(null, users);
        });
      }
    });
  };


  Client.onlineUsersIsp = function (req, location, mobile, from, to, skip, ip, isExport, cb) {
    console.log("req.accessToken.userId")
    console.log(req.accessToken.userId)
    if (mobile == null)
      mobile = ""
    if (ip == null)
      ip = ""
    if (isExport == null)
      isExport = 0
    if (from == null)
      from = new Date("1995-06-25")
    if (to == null)
      to = new Date("2995-06-25")
    console.log("location");
    console.log(location);
    var names = [];
    var mainLocation = [];
    var locationWhere = 'calledStationId = \'' + location + '\'';
    Client.app.models.locations.find({
      where: {
        isp_id: req.accessToken.userId
      }
    }, function (err, locations) {
      if (err) return cb(err);
      mainLocation = locations;
      console.log("locations");
      console.log(locations);
      _.each(locations, (l) => {
        names.push('\'' + l.routerName + '\'')
      });

      if (mainLocation.length == 0)
        return cb(null, []);
      if (location && !_.includes(names, '\'' + location + '\''))
        return cb(ERROR(403, 'permison denied'));
      if (!location)
        locationWhere = 'calledStationId IN (' + names + ')';
      var now = new Date();
      console.log("from")
      console.log(from)
      console.log(new Date(from))
      console.log(new Date(from).toUTCString())
      if (isExport == 1)
        var sql = "SELECT username,acctstarttime,acctstoptime,calledstationid,nasipaddress  FROM radacct WHERE (" + locationWhere + " AND   acctstarttime >= '" + dateFormat(new Date(new Date(from).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "' AND username LIKE '%" + mobile + "%'AND nasipaddress LIKE '%" + ip + "%')";
      else if (isExport == 2)
        var sql = "SELECT username as mobile,acctstarttime,acctstoptime,calledstationid,radacctid,update_at,nasipaddress FROM radacct WHERE (" + locationWhere + " AND   update_at > '" + dateFormat(new Date(new Date(from).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "'AND  acctstarttime <= '" + dateFormat(new Date(new Date(from).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "'AND username LIKE '%" + mobile + "%' AND nasipaddress LIKE '%" + ip + "%')";
      else if (isExport == 3)
        var sql = "SELECT username as mobile,acctstarttime,calledstationid,acctstoptime,radacctid,nasipaddress,callingstationid as mac  FROM radacct WHERE (" + locationWhere + " AND acctstoptime IS NOT NULL  AND  acctstarttime <= '" + dateFormat(new Date(new Date(to).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "'AND  acctstoptime >= '" + dateFormat(new Date(new Date(from).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "' AND username LIKE '%" + mobile + "%' AND nasipaddress LIKE '%" + ip + "%') ORDER BY update_at DESC LIMIT 10 OFFSET " + skip;
      else
        var sql = "SELECT username as mobile,acctstarttime,calledstationid,nasipaddress,callingstationid as mac  FROM  radacct WHERE (" + locationWhere + "  AND acctstoptime IS NULL AND  acctstarttime <= '" + dateFormat(new Date(new Date(to).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "' AND username LIKE '%" + mobile + "%' AND nasipaddress LIKE '%" + ip + "%')";
      connector.execute(sql, [], function (err, users) {
        if (err)
          return cb(err);
        if (isExport == 1) {
          console.log(users);
          var config = {
            path: 'uploads/excelFiles',
            save: true,
            fileName: 'user' + Date.now() + '.xlsx'
          };
          var data = [];

          users.forEach(function (element) {
            var object = {};
            if (element['acctstoptime'] != null) {
              object = {

                "Mobile": element['username'],
                "Start Time": element['acctstarttime'].toString(),
                "Stop Time": element['acctstoptime'].toString(),
                "Location": getLocation(mainLocation, element.calledstationid),
                "IP": element['nasipaddress']
              }
            } else {
              object = {
                "Mobile": element['username'],
                "Start Time": element['acctstarttime'].toString(),
                "Location": getLocation(mainLocation, element.calledstationid),
                "IP": element['nasipaddress']
              }
            }
            data.push(object);
          }, this);


          var model = mongoXlsx.buildDynamicModel(data);
          mongoXlsx.mongoData2Xlsx(data, model, config, function (err, data) {
            console.log('File saved at:', data.fullPath);
            return cb(null, {
              'path': urlFileRootexcel + config['fileName']
            });
          });

        } else if (isExport == 2) {
          users.forEach(function (element, index) {
            users[index]['location'] = getLocation(mainLocation, element.calledstationid)
          }, this);
          return cb(null, users);
        } else
          return cb(null, users);
      });
    });
  }


  function generateCode(callback) {

    var client_MD = Client
    async.whilst(function () {
        return true;
      },
      function (next) {
        var code = Math.floor(1000 + Math.random() * 9000);
        client_MD.app.models.verificationTokens.findOne({
          "where": {
            "code": code,
            "status": "active",
            "expiration_date": {
              "gt": new Date()
            }
          }
        }, function (err, mainCode) {
          if (mainCode) {
            console.log("Try again" + code)
            next();
          } else {
            console.log("Done")
            callback(code);
          }
        })
      },
      function (err) {
        // All things are done!
      });
  }

  Client.resendVerificationCode = function (req, mobile, cb) {

    generateCode(function (code) {
      console.log(code);

      // var code = speakeasy.totp({
      //   key: 'APP_SECRET' + mobile
      // });
      var clientM = app.models.client;
      clientM.findOne({
        where: {
          mobile: mobile
        }
      }, function (err, user) {
        if (err || user == null) {
          const err2 = new Error("userNOTfound");
          err2.statusCode = 604;
          err2.code = 'USER_NOT_FOUND';
          return cb(err2)
        }

        var nowDate = new Date(),
          expDate = new Date(nowDate);
        expDate.setMinutes(nowDate.getMinutes() + 30);
        Client.app.models.verificationTokens.create({
          "code": code,
          "client_id": user.id,
          "created_at": nowDate,
          "expiration_date": expDate
        }, function (err, data) {
          if (err)
            console.log(err);

          request.get(
            'https://services.mtnsyr.com:7443/general/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm=' + (user.mobile).substr(2) + '&Msg=Your%20Verification%20Code ' + String(code) + '&Lang=0&Flash=0',
            function (res) {
              // res.on('data', function (data) {
              console.log(res);
              // console.log(data.toString());
              return cb()
              // });
            }
          ).on('error', function () {
            data = {
              name: "can't send sms",
              status: 604,
              message: "please check your sms api"
            };
            console.log(data)
            context.result = data;
            //console.log(context.result);
            return cb()
          });

        })
      })
    })

  }

  Client.countOfflineUsersIsp = function (req, location, mobile, from, to, ip, cb) {
    if (mobile == null)
      mobile = ""
    if (from == null)
      from = new Date("1995-06-25")
    if (to == null)
      to = new Date("2995-06-25")
    if (ip == null)
      ip = ""
    var names = [];
    var mainLocation = [];
    var locationWhere = 'calledStationId = \'' + location + '\'';
    Client.app.models.locations.find({
      where: {
        isp_id: req.accessToken.userId
      }
    }, function (err, locations) {
      if (err) return cb(err);
      mainLocation = locations;
      _.each(locations, (l) => {
        names.push('\'' + l.routerName + '\'')
      });
      console.log("from");
      console.log(from);
      console.log("to");
      console.log(to);

      if (mainLocation.length == 0)
        return cb(null, []);
      if (location && !_.includes(names, '\'' + location + '\''))
        return cb(ERROR(403, 'permison denied'));
      if (!location)
        locationWhere = 'calledStationId IN (' + names + ')';

      var sql = "SELECT COUNT(radacctid) as count  FROM radacct WHERE (" + locationWhere + "  AND acctstoptime IS NOT NULL AND   acctstarttime >= '" + dateFormat(new Date(new Date(from).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "'AND   acctstarttime <= '" + dateFormat(new Date(new Date(to).toUTCString()), "yyyy-mm-dd HH:MM:ss") + "'AND username LIKE '%" + mobile + "%' AND nasipaddress LIKE '%" + ip + "%')";
      console.log("sqllllllllllll")
      console.log(sql)
      connector.execute(sql, [], function (err, users) {
        if (err)
          return cb(err);
        console.log(users);
        return cb(null, users[0]);
      });
    });
  }

  function getLocation(locations, routeName) {
    for (var index = 0; index < locations.length; index++) {
      var element = locations[index];
      if (element.routerName == routeName) {
        return element.name;
      }
    }
    return ("false");
  }

  Client.remoteMethod('resendVerificationCode', {
    description: 'Resend Verification Code',
    accepts: [{
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'mobile',
        type: 'string',
        required: true,
        http: {
          source: 'form'
        }
      },
    ],
    http: {
      verb: 'post',
      path: '/resendVerificationCode'
    },
  });



  Client.remoteMethod('onlineUsers', {
    description: 'get all online users ',
    accepts: [{
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'location',
        type: 'string',
        http: {
          source: 'query'
        }
      },
    ],
    returns: {
      arg: 'users',
      type: 'array',
      root: true
    },
    http: {
      verb: 'get',
      path: '/onlineUsers'
    },
  });

  Client.remoteMethod('onlineUsersIsp', {
    description: 'get all online users ',
    accepts: [{
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'location',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      {
        arg: 'mobile',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      {
        arg: 'from',
        type: "date",
        http: {
          source: 'query'
        }
      },
      {
        arg: 'to',
        type: "date",
        http: {
          source: 'query'
        }
      },
      {
        arg: 'skip',
        type: "integer",
        http: {
          source: 'query'
        }
      },
      {
        arg: 'ip',
        type: "string",
        http: {
          source: 'query'
        }
      },
      {
        arg: 'isExport',
        type: "int",
        http: {
          source: 'query'
        }
      },
    ],
    returns: {
      arg: 'users',
      type: 'array',
      root: true
    },
    http: {
      verb: 'get',
      path: '/onlineUsersIsp'
    },
  });

  Client.remoteMethod('countOfflineUsersIsp', {
    description: 'get all online users ',
    accepts: [{
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'location',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      {
        arg: 'mobile',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      {
        arg: 'from',
        type: "date",
        http: {
          source: 'query'
        }
      },
      {
        arg: 'to',
        type: "date",
        http: {
          source: 'query'
        }
      },
      {
        arg: 'ip',
        type: "string",
        http: {
          source: 'query'
        }
      }
    ],
    returns: {
      arg: 'users',
      type: 'object',
      root: true
    },
    http: {
      verb: 'get',
      path: '/countOfflineUsersIsp'
    },
  });

  Client.remoteMethod(
    'Confirmreset', {
      description: 'confirm reset password',
      accepts: [{
          arg: 'code',
          type: 'string',
          required: true
        },
        {
          arg: 'newPassword',
          type: 'string',
          required: true,
          description: 'new password'
        },
      ],
      returns: {
        arg: 'data',
        type: 'object',
        root: true,
        description: "confirm reset by code sent in sms",
      },
      http: {
        verb: 'post'
      },
    }
  );


  Client.Confirmreset = function (code, newPassword, callback) {
    var UserModel = this;
    Client.app.models.verificationTokens.findOne({
      where: {
        "code": code,
        "status": "active"
      }
    }, function (err, mainCode) {
      if (err || mainCode == null) {
        const err2 = new Error("codeNOTfound");
        err2.statusCode = 604;
        err2.code = 'Code_NOT_FOUND';
        process.nextTick(function () {
          callback(null, err2);
        });
      } else if (new Date(mainCode.expiration_date) < new Date()) {
        const err2 = new Error("codeIsExpired");
        err2.statusCode = 605;
        err2.code = 'Code_IS_EXPIRED';
        process.nextTick(function () {
          callback(null, err2);
        });
      } else {
        UserModel.findOne({
          "where": {
            "id": mainCode.client_id
          }
        }, function (err, user) {
          if (err)
            callback(err);
          else {
            user.updateAttributes({
              'password': UserModel.hashPassword(newPassword),
              'np': newPassword
            }, function (err) {
              if (err) {
                fn(err);
              } else {
                mainCode.updateAttributes({
                  "status": "deactive"
                })
                var data = {
                  name: "success",
                  mobile: user.mobile,
                  status: 402,
                  message: "reset password successful"
                }
                process.nextTick(function () {
                  afterConfirmreset({}, user, function (err, data) {
                    callback(null, {
                      "statusCode": 204
                    });
                  })
                });
              }
            });
          }
        })


      }
    });
  }




  Client.login = function (credentials, include, fn) {
    var self = this;
    if (typeof include === 'function') {
      fn = include;
      include = undefined;
    }

    fn = fn || utils.createPromiseCallback();

    include = (include || '');
    if (Array.isArray(include)) {
      include = include.map(function (val) {
        return val.toLowerCase();
      });
    } else {
      include = include.toLowerCase();
    }


    var query = {
      mobile: credentials.mobile
    }

    if (!query.mobile) {
      var err2 = new Error(g.f('{{mobile}} is required'));
      err2.statusCode = 400;
      err2.code = 'PHONENUMBER_REQUIRED';
      fn(err2);
      return fn.promise;
    }

    self.findOne({
      where: query
    }, function (err, user) {
      var defaultError = new Error(g.f('login failed'));
      defaultError.statusCode = 401;
      defaultError.code = 'LOGIN_FAILED';

      function tokenHandler(err, token) {
        if (err) return fn(err);
        if (Array.isArray(include) ? include.indexOf('user') !== -1 : include === 'user') {
          // NOTE(bajtos) We can't set token.user here:
          //  1. token.user already exists, it's a function injected by
          //     "AccessToken belongsTo User" relation
          //  2. ModelBaseClass.toJSON() ignores own properties, thus
          //     the value won't be included in the HTTP response
          // See also loopback#161 and loopback#162

          token.__data.user = user;
        }
        afterLogin({}, user, function (err) {
          if (err)
            fn(err, null)
          else if (credentials.location_id == null || credentials.location_id == undefined)
            fn(err, token);
          else
            Client.app.models.locations.find({
              where: {
                id: credentials.location_id
              }
            }, function (err, location) {
              token.type_location = location[0].type
              if (location[0].type != 'manual')
                fn(err, token);
              else {
                Client.app.models.pendingClient.find({
                  where: {
                    "and": [{
                        location_id: credentials.location_id
                      },
                      {
                        client_id: token.userId
                      },
                    ]
                  }
                }, function (err, clinet) {
                  if (err)
                    fn(err, null);
                  if (clinet[0] != null && clinet[0].status == "active") {
                    token['pendingClient'] = false
                    fn(err, token);
                  } else if (clinet[0] != null && clinet[0].status != "active") {
                    var defaultError = new Error(g.f('You are pending client'));
                    defaultError.statusCode = 627;
                    defaultError.code = 'YOU_ARE_PENDING_CLIENT';
                    fn(defaultError, null);
                  } else if (clinet[0] == null) {
                    Client.app.models.pendingClient.create({
                      "client_id": token.userId,
                      "location_id": credentials.location_id
                    }, function (err, data) {
                      if (err)
                        fn(err, null);
                      var defaultError = new Error(g.f('You are pending client'));
                      defaultError.statusCode = 627;
                      defaultError.code = 'YOU_ARE_PENDING_CLIENT';
                      fn(defaultError, null);
                    })
                  }
                })
              }
            })
        })


      }

      if (err) {
        debug('An error is reported from User.findOne: %j', err);
        fn(defaultError);
      } else if (user) {
        user.hasPassword(credentials.password, function (err, isMatch) {
          if (err) {
            debug('An error is reported from User.hasPassword: %j', err);
            fn(defaultError);
          } else if (isMatch) {

            if (user.createAccessToken.length === 2) {
              user.createAccessToken(credentials.ttl, tokenHandler);
            } else {
              user.createAccessToken(credentials.ttl, credentials, tokenHandler);
            }

          } else {
            debug('The password is invalid for user %s', query.email || query.username);
            fn(defaultError);
          }
        });
      } else {
        debug('No matching record is found for user %s', query.email || query.username);
        fn(defaultError);
      }
    });
    return fn.promise;
  }

  var DEFAULT_RESET_PW_TTL = 15 * 60; // 15 mins in seconds


  Client.resetPassword = function (options, cb) {
    cb = cb || utils.createPromiseCallback();
    var UserModel = this;
    var ttl = UserModel.settings.resetPasswordTokenTTL || DEFAULT_RESET_PW_TTL;
    options = options || {};
    if (typeof options.mobile !== 'string') {
      var err = new Error(g.f('mobile is required'));
      err.statusCode = 400;
      err.code = 'MOBILE_REQUIRED';
      cb(err);
      return cb.promise;
    }

    try {
      if (options.password) {
        UserModel.validatePassword(options.password);
      }
    } catch (err) {
      return cb(err);
    }
    var where = {
      mobile: options.mobile,
    };
    if (options.realm) {
      where.realm = options.realm;
    }
    UserModel.findOne({
      where: where
    }, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        err = new Error(g.f('mobile not found'));
        err.statusCode = 404;
        err.code = 'MOBILE_NOT_FOUND';
        return cb(err);
      }
      // create a short lived access token for temp login to change password
      // TODO(ritch) - eventually this should only allow password change
      if (UserModel.settings.emailVerificationRequired && !user.emailVerified) {
        err = new Error(g.f('mobile has not been verified'));
        err.statusCode = 401;
        err.code = 'RESET_FAILED_MOBILE_NOT_VERIFIED';
        return cb(err);
      }

      if (UserModel.settings.restrictResetPasswordTokenScope) {
        const tokenData = {
          ttl: ttl,
          scopes: ['reset-password'],
        };
        user.createAccessToken(tokenData, options, onTokenCreated);
      } else {
        // We need to preserve backwards-compatibility with
        // user-supplied implementations of "createAccessToken"
        // that may not support "options" argument (we have such
        // examples in our test suite).
        user.createAccessToken(ttl, onTokenCreated);
      }

      function onTokenCreated(err, accessToken) {
        if (err) {
          return cb(err);
        }
        afterReset({}, user, cb)
        // cb();
        UserModel.emit('resetPasswordRequest', {
          email: options.email,
          accessToken: accessToken,
          user: user,
          options: options,
        });
      }
    });
    return cb.promise;
  };


};
