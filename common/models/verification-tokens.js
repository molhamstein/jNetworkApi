'use strict';
var speakeasy = require('speakeasy');
var request = require('request');
module.exports = function (Verificationtokens) {
  Verificationtokens.beforeRemote('create', function (ctx, modelInstance, next) {
    var code = speakeasy.totp({
      key: 'APP_SECRET' + ctx.req.body.mobile
    });
    var nowDate = new Date(),
    expDate = new Date(nowDate);
    expDate.setMinutes(nowDate.getMinutes() + 30);

    ctx.req.body.code = code;
    ctx.req.body.created_at = nowDate;
    ctx.req.body.expiration_date = expDate;
    return next();
  });

  Verificationtokens.afterRemote('create', function (ctx, modelInstance, next) {
    request.get(
      'https://services.mtnsyr.com:7443/general/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm=' + (modelInstance.mobile).substr(2) + '&Msg=Your VerificationCode ' + String(modelInstance.code) + '&Lang=0&Flash=0',
      function (res) {
        // res.on('data', function (data) {
        console.log(res);
        return next();
        // });
      }
    ).on('error', function () {
      var data = {
        name: "can't send sms",
        status: 604,
        message: "please check your sms api"
      };
      return next();
    });
  });


};
