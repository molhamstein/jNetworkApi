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
        // console.log("dataaaaaaa");
        // console.log(data);
        var campaigns = {}
        // console.log(data);
        _.each(data, function (CA) {
          if (!campaigns[CA.CID])
            campaigns[CA.CID] = 0;
          if (campaigns[CA.CID] == '-1')
            return;


          if (!CA.campaign_id) // not creiteria
            campaigns[CA.CID] = 0;

          if (CA.type == 'gender' || CA.type == 'profession') {
            console.log("In gender Or profession");
            if (client[CA.type] == CA.value) {
              campaigns[CA.CID]++;
            } else
              campaigns[CA.CID] = -1;
          } else if (CA.type == 'location') {
            console.log("In Location");
            console.log(CA.CID);
            console.log("location_id");
            console.log(location_id);
            console.log("CA.value");
            console.log(CA.value);
            if (location_id == CA.value) {
              console.log("equal location");
              campaigns[CA.CID]++;
            } else {
              console.log(" not equal location");
              campaigns[CA.CID] = -1;
            }
          } else if (CA.type == 'age') {
            console.log("In Age");

            if (CA.operator == '=') {
              if (clientAge == CA.value)
                campaigns[CA.CID]++;
              else
                campaigns[CA.CID] = -1;
            } else if (CA.operator == '>' || CA.operator == '>=') {
              if (clientAge >= CA.value)
                campaigns[CA.CID]++;
              else
                campaigns[CA.CID] = -1;
            } else if (CA.operator == '<' || CA.operator == '<=') {
              if (clientAge <= CA.value)
                campaigns[CA.CID]++;
              else
                campaigns[CA.CID] = -1;
            } else {
              if (clientAge >= CA.value && clientAge <= CA.value2)
                campaigns[CA.CID]++;
              else
                campaigns[CA.CID] = -1;
            }
          }
        });

        console.log("result campaigns : ", campaigns)
        var allowCampign = [];
        _.each(campaigns, (value, key) => {
          if (value != -1)
            allowCampign.push({
              id: key,
              value: value + 1
            });
        });
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
            return cb(null, data);
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
