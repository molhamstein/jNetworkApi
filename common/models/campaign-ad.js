'use strict';
var _ = require('lodash');
module.exports = function (Campaignad) {
  Campaignad.getAdsByCriteria = function (client_id, mobile, location_id = null, limit = 1, cb) {
    _getClient(client_id, mobile, (err, client) => {
      if (err)
        return cb(err);
      if (!client)
        return cb(ERROR(404, 'client not found'));
      var curdate = new Date()
      var clientAge = new Date().getFullYear() - new Date(client.birthdate).getFullYear();
      var sql = "SELECT campaign.id as CID, campaign.status, campaign.expiration_date, campaign.duration, criteria.* FROM campaign LEFT JOIN criteria ON campaign.id = criteria.campaign_id  WHERE (status = 'active' AND start <= NOW() AND expiration_date >= NOW() AND completed < target ) order by campaign_id "
      Campaignad.app.dataSources.mydb.connector.execute(sql, [], function (err, data) {
        if (err)
          return cb(err);
        console.log("dataaaaaaa");
        console.log(data);
        var campaigns = {}

        _.each(data, function (CA) {
          if (!campaigns[CA.CID])
            campaigns[CA.CID] = {
              "gender": 0,
              "profession": 0,
              "location": 0,
              "age": 0
            };
          // if (campaigns[CA.CID] == '-1')
          //   return;


          if (!CA.campaign_id) // not creiteria
            campaigns[CA.CID] = {
              "gender": 0,
              "profession": 0,
              "location": 0,
              "age": 0
            };




          if (CA.type == 'profession') {
            console.log("In  profession");
            if (client[CA.type] == CA.value) {
              if (campaigns[CA.CID]['profession'] < 0)
                campaigns[CA.CID]['profession'] = 1;
              else
                campaigns[CA.CID]['profession']++;

            } else if (campaigns[CA.CID]['profession'] <= 0)
              campaigns[CA.CID]['profession'] = -1;
          }
          if (CA.type == 'gender') {
            console.log("In gender");
            if (client[CA.type] == CA.value) {
              if (campaigns[CA.CID]['gender'] < 0)
                campaigns[CA.CID]['gender'] = 1;
              else
                campaigns[CA.CID]['gender']++;
            } else if (campaigns[CA.CID]['gender'] <= 0)
              campaigns[CA.CID]['gender'] = -1;
          } else if (CA.type == 'location') {
            console.log("In Location");
            console.log(CA.CID);
            console.log("location_id");
            console.log(location_id);
            console.log("CA.value");
            console.log(CA.value);
            if (location_id == CA.value) {
              console.log("equal location");
              if (campaigns[CA.CID]['location'] < 0)
                campaigns[CA.CID]['location'] = 1;
              else
                campaigns[CA.CID]['location']++;
            } else if (campaigns[CA.CID]['location'] <= 0) {
              console.log(" not equal location");
              campaigns[CA.CID]['location'] = -1;
            }
          } else if (CA.type == 'age') {
            console.log("In Age");
            if (CA.operator == '=') {
              if (clientAge == CA.value)
                if (campaigns[CA.CID]['age'] < 0)
                  campaigns[CA.CID]['age'] = 1;
                else
                  campaigns[CA.CID]['age']++;
              else if (campaigns[CA.CID]['age'] <= 0)
                campaigns[CA.CID]['age'] = -1;
            } else if (CA.operator == '>' || CA.operator == '>=') {
              if (clientAge >= CA.value)
                if (campaigns[CA.CID]['age'] < 0)
                  campaigns[CA.CID]['age'] = 1;
                else
                  campaigns[CA.CID]['age']++;
              else if (campaigns[CA.CID]['age'] <= 0)
                campaigns[CA.CID]['age'] = -1;
            } else if (CA.operator == '<' || CA.operator == '<=') {
              if (clientAge <= CA.value)
                if (campaigns[CA.CID]['age'] < 0)
                  campaigns[CA.CID]['age'] = 1;
                else
                  campaigns[CA.CID]['age']++;
              else if (campaigns[CA.CID]['age'] <= 0)
                campaigns[CA.CID]['age'] = -1;
            } else {
              if (clientAge >= CA.value && clientAge <= CA.value2)
                campaigns[CA.CID]++;
              else if (campaigns[CA.CID]['age'] <= 0)
                campaigns[CA.CID]['age'] = -1;
            }
          }
        });

        var allowCampign = [];

        _.each(campaigns, (element, index) => {
          if (element["gender"] < 0 || element["profession"] < 0 || element["location"] < 0 || element["age"] < 0)
            console.log("notUsed" + index)
          else {
            allowCampign.push({
              id: index,
              value: element["gender"] + element["profession"] + element["location"] + element["age"] + 1
            });
          }
        });
        console.log("campaigns : ", campaigns)
        console.log("result campaigns : ", allowCampign)
        // _.each(campaigns, (value, key) => {
        //   if (value != -1)
        //     allowCampign.push({
        //       id: key,
        //       value: value + 1
        //     });
        // });
        console.log("allowCampign")
        console.log(allowCampign)
        var cam = _rouletteWheelSelection(allowCampign);
        if (allowCampign.length == 0)
          return cb(null, [])
        cam = cam || allowCampign[0];
        var campignId = cam.id;
        console.log("campignId")
        console.log(campignId)
        var sql = 'SELECT * FROM (SELECT * FROM  campaign_ad WHERE campaign_id = ' + campignId + ' ORDER BY RAND() LIMIT ' + limit + ' ) AS campignAD JOIN AD ON AD.id = campignAD.ad_id';
        Campaignad.app.dataSources.mydb.connector.execute(sql, [], function (err, data) {
          if (err)
            return cb(err);
          console.log("data")
          console.log(data)
          _addImpression(campignId, data, client.id, location_id, (err) => {
            if (err) {
              console.log(err);
              return cb(err);
            }
            if (data.length != 0) {

              Campaignad.app.models.partner.findById(data[0]['partner_id'], function (err, part) {
                if (err) {
                  return cb(err);
                }

                Campaignad.app.models.campaign.findById(data[0]['campaign_id'], function (err, camp) {
                  if (err) {
                    return cb(err);
                  }
                  var tempBalance = part['balance'] - camp['CPI']
                  if (camp['type'] == "impressions")
                    var tempCompleted = camp['completed'] + 1;
                  part.updateAttributes({
                    'balance': tempBalance
                  }, function () {
                    camp.updateAttributes({
                      'completed': tempCompleted
                    }, function () {
                      if (tempBalance < part['min_balance']) {
                        console.log("deactive all cam")
                        Campaignad.app.models.campaign.updateAll({
                          "partner_id": data[0]['partner_id']
                        }, {
                          "status": "deactivated"
                        }, function (err, newData) {
                          return cb(null, data);

                        })
                      } else {
                        console.log("not  deactive all cam")
                        return cb(null, data);
                      }
                    })
                  })
                })
              })
            }
          })
        });
      });
    });
  }

  var _getClient = function (client_id, mobile, cb) {
    if (!client_id && !mobile)
      return cb(ERROR(404, 'client not found'));
    if (client_id)
      return Campaignad.app.models.client.findById(client_id, cb);
    if (mobile)
      return Campaignad.app.models.client.findOne({
        where: {
          mobile: mobile
        }
      }, cb);
  }

  function _rouletteWheelSelection(objects, fAttr = 'value') { // object = { attr1: xx1, attr2, xx2 }
    var totalFitness = 0;
    objects.forEach(function (object) {
      totalFitness += object[fAttr];
    });
    var seed = Math.floor(Math.random() * totalFitness);
    for (var i = 0; i < objects.length; ++i) {
      var object = objects[i];
      var rate = object[fAttr];
      if (seed < rate) return object;
      seed -= rate;
    }
  }

  function _addImpression(campaign_id, ads, client_id, location_id, cb) {
    var data = [];
    _.each(ads, (ad) => {
      data.push({
        client_id: client_id,
        ad_id: ad.id,
        campaign_id: campaign_id,
        location_id: location_id || 0
      });
    });
    Campaignad.app.models.impression.create(data, function (err, result) {
      if (err)
        return cb(err);
      return cb(null);
    })
  }
};
