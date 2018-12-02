'use strict';
const path = require('path');
const ejs = require('ejs');

var _ = require('lodash');
module.exports = function (Partner) {


  Partner.isAdmin = function (accessToken, option, cb) {
    if (typeof cb != 'function') {
      cb = option;
      option = {};
    }
    if (!accessToken || !accessToken.userId)
      return cb(ERROR(401, 'authentication required'), false);
    Partner.findById(accessToken.userId, function (err, user) {
      if (err)
        return cb(err);
      if (!user || !user.roles.length)
        return cb(null, false);
      var isAdmin = _.some(user.roles(), ['code', 'admin']);
      if (isAdmin || (!option && !option.getCampaignIds && !option.getAdsIds))
        return cb(null, isAdmin);

      if (option.getCampaignIds) {
        Partner.getCampaignIds(accessToken.userId, (err, ids) => {
          if (err)
            return cb(err);
          return cb(null, isAdmin, ids);
        });
      } else {
        Partner.getAdsIds(accessToken.userId, (err, ids) => {
          if (err)
            return cb(err);
          return cb(null, isAdmin, ids);
        });
      }
    });
  }

  Partner.getCampaignIds = function (userId, cb) {
    Partner.app.models.campaign.find({
      where: {
        partner_id: userId
      }
    }, function (err, campaigns) {
      if (err)
        return cb(err);
      var ids = [];
      _.each(campaigns, (c) => {
        ids.push(c.id)
      });
      return cb(null, ids);
    });
  }
  Partner.getAdsIds = function (userId, cb) {
    Partner.app.models.AD.find({
      where: {
        partner_id: userId
      }
    }, function (err, ads) {
      if (err)
        return cb(err);
      var ids = [];
      _.each(ads, (c) => {
        ids.push(c.id)
      });
      return cb(null, ids);
    });
  }

  Partner.on('resetPasswordRequest', function (info) {
    // let url = `${config.siteDomain}/login/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    // let url = "http://104.217.253.15/dlaaalAppDevelop/Dlaaal-webApp/dist/#" + `/login/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    let url = `https://techpeak-net.com/panel/#/reset-password?access_token=${info.accessToken.id}&user_id=${info.user.id}`;
    ejs.renderFile(path.resolve(__dirname + "../../../server/views/reset-password-template.ejs"), {
      url: url
    }, function (err, html) {
      if (err) return console.log('> error sending password reset email', err);
      Partner.app.models.Email.send({
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
