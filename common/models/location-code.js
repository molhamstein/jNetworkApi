'use strict';
var app = require('../../server/server');

var speakeasy = require('speakeasy');
const crypto = require("crypto");
const connector = app.dataSources.mydb.connector;


module.exports = function (Locationcode) {
  Locationcode.validatesInclusionOf('status', { in: ['pending', 'sold', 'used']
  });


  /**
   *
   * @param {number} price
   * @param {number} location_id
   * @param {number} used_count
   * @param {number} count
   * @param {Function(Error, array)} callback
   */


  var generatCode = function (price, location_id, used_count, count, is_sold, seller_id, callback) {
    var result = [];
    var insertData = "";
    var status = ""
    if (is_sold)
      status = "sold"
    else
      status = "pending"
    var codes = [];
    for (var index = 0; index < count; index++) {
      var now = new Date();
      var code = crypto.randomBytes(3).toString("hex");
      codes.push(code)
      if (index != 0)
        insertData += ","
      insertData += "('" + code + "','" + price + "','" + used_count + "'," + location_id + ",'" + status + "'," + seller_id + ")"
    }
    insertData = "INSERT INTO location_code(code, price,used_count,location_id,status,seller_id) VALUES" + insertData;
    connector.execute(insertData, null, (err, resultObjects) => {
      if (err) {
        if (err.statusCode == 422)
          generatCode(price, location_id, used_count, count, is_sold, seller_id,
            function (err, data) {
              if (err) {
                callback(err, null)
              } else
                callback(err, data)

            })
        else
          callback(err, null)
      } else
        callback(err, codes)
    })

  }

  Locationcode.generateCode = function (price, location_id, used_count, count, is_sold, seller_id, callback) {
    if (seller_id == undefined)
      seller_id = null
    if (seller_id == null && is_sold == true) {
      app.models.seller.findOne({
          "where": {
            "location_id": location_id,
            "is_primary": true
          }
        },
        function (err, primarySeller) {
          if (err)
            callback(err, null)
          generatCode(price, location_id, used_count, count, is_sold, primarySeller.id, function (err, data) {
            if (err) {
              callback(err, null)
            }
            Locationcode.find({
              where: {
                "and": [{
                    "code": {
                      inq: data
                    }
                  },
                  {
                    "location_id": location_id
                  }
                ]
              }
            }, function (err, data) {
              if (err) {
                callback(err, null)
              }
              var insertData = ""
              for (var index = 0; index < data.length; index++) {
                var element = data[index];
                if (index != 0)
                  insertData += ","
                insertData += "('" + price + "','automatic'," + location_id + "," + primarySeller.id + ")"
              }
              insertData = "INSERT INTO billing(price,type,location_id,seller_id) VALUES" + insertData;
              connector.execute(insertData, null, (err, resultObjects) => {
                if (!err)
                  callback(err, data)
              })


            })

          })

        })
    } else
      generatCode(price, location_id, used_count, count, is_sold, seller_id, function (err, data) {
        if (err) {
          callback(err, null)
        }
        Locationcode.find({
          where: {
            "and": [{
                "code": {
                  inq: data
                }
              },
              {
                "location_id": location_id
              }
            ]
          }
        }, function (err, data) {
          if (err) {
            callback(err, null)
          }
          var insertData = ""
          for (var index = 0; index < data.length; index++) {
            var element = data[index];
            if (index != 0)
              insertData += ","
            insertData += "('" + price + "','automatic'," + location_id + "," + seller_id + ")"
          }
          insertData = "INSERT INTO billing(price,type,location_id,seller_id) VALUES" + insertData;
          connector.execute(insertData, null, (err, resultObjects) => {
            if (!err)
              callback(err, data)
          })


        })

      })
  }



  /**
   *
   * @param {number} code
   * @param {number} location_id
   * @param {Function(Error)} callback
   */

  Locationcode.useCode = function (code, location_id, callback) { // TODO
    Locationcode.find({
      where: {
        "code": code,
        "location_id": location_id
      }
    }, function (err, data) {
      var element = data[0];
      if (err)
        callback(err, null);
      else if (element == null) {
        callback(ERROR(620, 'code is error'), null);
      } else if (element.status == 'pending')
        callback(ERROR(621, 'code is not soled'), null);
      else if (element.used_count == 0)
        callback(ERROR(622, 'code is expired'), null);
      else {
        if (element.update_at == null) {
          element.status = "used";
          element.update_at = new Date();
        }
        element.used_count--;
        element.save();
        callback(null, element)
      }
    })
  };


  /**
   *
   * @param {number} id
   * @param {Function(Error, object)} callback
   */

  Locationcode.soldCode = function (id, callback) {
    var result;
    Locationcode.findOne({
      "where": {
        "id": id
      }
    }, function (err, code) {
      if (err)
        callback(err, null)
      console.log(code)
      if (code == null) {
        const err2 = new Error("codeNOTfound");
        err2.statusCode = 623;
        err2.code = 'CODE_NOT_FOUND';
        process.nextTick(function () {
          callback(err2, null);
        });
      } else if (code.status == 'sold' || code.status == 'used') {

        const err2 = new Error("codeIsNotPending");
        err2.statusCode = 624;
        err2.code = 'CODE_NOT_PENDING';
        process.nextTick(function () {
          callback(err2, null);
        });
      } else
        app.models.billing.create({
          "price": code.price,
          "type": "automatic",
          "location_id": code.location_id,
          "seller_id": code.seller_id
        }, function (err, billing) {
          if (err)
            callback(err, null)
          else {
            code.status = "sold"
            code.save()
            callback(err, code);
          }

        })

    })

  };
};


// ,
//     "client": {
//       "type": "belongsTo",
//       "model": "client",
//       "foreignKey": "client_id"
//     }
