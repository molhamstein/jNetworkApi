'use strict';
var speakeasy = require('speakeasy');
var https = require('https');
var app = require('../../server/server');

module.exports = function(Client) {
  //send verification email after registration
  Client.afterRemote('create', function(context, client, next) {
    console.log('> user.afterRemote triggered');
	 var code = speakeasy.totp({key: 'APP_SECRET' + client.email});
          console.log('Two factor code for ' + client.email + ': ' + code);
			client.updateAttributes({ verificationToken: code, emailVerified: false }, function(err) {
				  if (err) {
					
				  } else {
					
				  } 
				});
		  https.get(
					  'http://services.mtn.com.sy/General/ConcatenatedSender.asp?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm='+client.mobile+'&' +
						  '&Msg=Your+verification+code+is+' + code+'&Lang=0&Flash=0',
					  function() {
						res.on('data', function(data) {
						  next();
						});
					  }
					).on('error', function() {
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
			
  });
  Client.afterRemote('login', function(context, client, next) {
    //console.log(client.userId);
	var clientM = app.models.client;
	var data = client;
	clientM.findOne({where: { id: client.userId }}, function(err, user) {
      if(user.emailVerified==false)
	  {
		  data = {
						  name: "unauthorized",
						  status: 601,
						  message: "please verify your account"
						};
						console.log(data)
			context.result = data;
			//console.log(context.result);
			next();	
			//return data;
	  }
	  else
		  next();
		    
    });
	
  });
  
  Client.confirmSMS = function(email, token, callback) {
		var clientM = app.models.client;
		clientM.findOne({where: { email: email }}, function(err, user) {
			
			 if(user.verificationToken == token)
			 {
				user.updateAttributes({ verificationToken: null, emailVerified: true }, function(err) {
				  if (err) {
					fn(err);
				  } else {
					var data = {
							 name: "success",
							status: 402,
							message:"confirmed success"
						}
						process.nextTick(function() {
						  callback(null, data);
						});
				  } 
				});
				
			 }
			 else{
				 var data = {
							 name: "Failed",
							status: 503,
							message:"authorization Faild"
						}
						process.nextTick(function() {
						  callback(null, data);
						});
			 }
		    
    });
  }
};