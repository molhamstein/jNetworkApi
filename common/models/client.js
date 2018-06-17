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
					  'https://rest.nexmo.com' +
						  '/sms/json?api_key=[YOUR_KEY]&api_secret=[YOUR_SECRET]' +
						  '&from=[YOUR_NUMBER]&to=[USER_MOBILE_#]' +
						  '&text=Your+verification+code+is+' + code,
					  function() {
						res.on('data', function(data) {
						  // all done! handle the data as you need to
						});
					  }
					).on('error', function() {
						// handle errors somewhow
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