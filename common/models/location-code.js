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


  var generatCode = function (price, location_id, used_count, count, is_sold, callback) {
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
      insertData += "('" + code + "','" + price + "','" + used_count + "','" + location_id + "','" + status + "')"
    }
    insertData = "INSERT INTO location_code(code, price,used_count,location_id,status) VALUES" + insertData;
    connector.execute(insertData, null, (err, resultObjects) => {
      if (err) {
        if (err.statusCode == 422)
          generatCode(price, location_id, used_count, count, is_sold,
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

  Locationcode.generateCode = function (price, location_id, used_count, count, is_sold, callback) {
    generatCode(price, location_id, used_count, count, is_sold, function (err, data) {
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
        callback(err, data)

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
};
