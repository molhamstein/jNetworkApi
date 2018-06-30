'use strict';
var speakeasy = require('speakeasy');
var http = require('http');
var app = require('../../server/server');
const connector = app.dataSources.mydb.connector
module.exports = function(Client) {
  //send verification email after registration
  delete Client.validations.username;
  var re = /^([0|\+[0-9]{1,13})?/;

    Client.validate('mobile', function (err) { if ( this.mobile !== undefined && !re.test(this.mobile)) err(); }, {message: 'mobile format is invalid'});

    // Adds email uniqueness validation
    Client.validatesUniquenessOf('mobile', {message: 'Mobile already exists'});  
  Client.afterRemote('create', function(context, client, next) {
    console.log('> user.afterRemote triggered');
	 var code = speakeasy.totp({key: 'APP_SECRET' + client.email});
          console.log('Two factor code for ' + client.email + ': ' + code);
			client.updateAttributes({ verificationToken: code, emailVerified: false }, function(err) {
				  if (err) {
					
				  } else {
					
				  } 
				});
		  http.get(
					'http://services.mtn.com.sy/General/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm='+(client.mobile).substr(2)+'&Msg=YourVerificationCode'+code+'=&Lang=0&Flash=0',
					  function(res) {
						res.on('data', function(data) {
							console.log(data);
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
				var sql = " select * from cars inner join cars_meta on cars_meta.id_cars_m = cars.id_c inner join option_car on code_o = code_m inner join users on users.id_u = cars.id_user where id_cars_m = "
				
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