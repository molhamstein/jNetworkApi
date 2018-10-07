'use strict';
var speakeasy = require('speakeasy');
var http = require('http');
var app = require('../../server/server');
const connector = app.dataSources.mydb.connector;
module.exports = function(Client) {
  //send verification email after registration
  delete Client.validations.username;
  var re = /^([0|\+[0-9]{1,13})?/;
	delete Client.validations.email;
    Client.validate('mobile', function (err) { if ( this.mobile !== undefined && !re.test(this.mobile)) err(); }, {message: 'mobile format is invalid'});

    // Adds email uniqueness validation
  //  Client.validatesUniquenessOf('mobile', {message: 'Mobile already exists'}); 


	Client.beforeRemote('create', (ctx, user, next) => {
				//Object.assign(ctx.args, { np: user.password });
			
				var body = ctx.req.body;
				var clientM = app.models.client;
				console.log(body.mobile);
				clientM.findOne({where: { mobile: body.mobile }}, function(err, userResult) {
					//console.log(userResult.mobile);
					if(userResult)
					{
							const err2 = new Error("Mobile already exists");
								err2.statusCode = 622;
								err2.code = 'Mobile_already_exists';
								next(err2);
					}
					else{
						
						body.np = body.password;
					 //console.log("before create np = "+body.password);
					 //console.log("before create np = "+"  "+body.np);
							 next();
					}
				
							
				});
	
    });
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
					'http://services.mtn.com.sy/General/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm='+(client.mobile).substr(2)+'&Msg=Your%20Verification%20Code '+String(code)+'&Lang=0&Flash=0',
					  function(res) {
						res.on('data', function(data) {
							console.log(data.toString());
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
			const err = new Error("unauthorized");
				err.statusCode = 601;
				err.code = 'VERIFICATION_REQUIRED';
				next(err);
			//console.log(context.result);
			//next();	
			//return data;
	  }
	  else
		  next();
		    
    });
	
  });
  Client.afterRemote('Confirmreset', function(context, data, next) {
    console.log(data.mobile);
	if(data.mobile)
	{
		var clientM = app.models.client;
	//var data = client;
		clientM.findOne({where: { mobile: data.mobile }}, function(err, user) {
		  var sql = " update radcheck set value='"+user.np+"' where username='"+user.mobile+"' and attribute='password'";
			connector.execute(sql, null, (err, resultObjects) => {
				   if(!err){

						console.log("updated successful to radius");
				   }
				   else
						console.log(err);
				})
				
		});
	}
	
	next();
	
  });
  
   Client.afterRemote('reset', function(context, client, next) {
    console.log('> user.afterRemote reset triggered');
	 var code = speakeasy.totp({key: 'APP_SECRET' + client.mobile});
          console.log('Two factor code for ' + client.email + ': ' + code);
			client.updateAttributes({ verificationToken: code, emailVerified: false }, function(err) {
				  if (err) {
					
				  } else {
					
				  } 
				});
		  http.get(
					'http://services.mtn.com.sy/General/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm='+(client.mobile).substr(2)+'&Msg=YourVerificationCode '+String(code)+'=&Lang=0&Flash=0',
					  function(res) {
						res.on('data', function(data) {
							console.log(data.toString());
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
  
  
  Client.confirmSMS = function(mobile, code, callback) {
		var clientM = app.models.client;
		clientM.findOne({where: { mobile: mobile }}, function(err, user) {
			  if(err || user==null)
			  {
				    const err2 = new Error("userNOTfound");
						err2.statusCode = 604;
						err2.code = 'USER_NOT_FOUND';
					process.nextTick(function() {
						  callback(null, err2);
						});
			  }
			 else if(user.verificationToken == code)
			 {
				user.updateAttributes({ emailVerified: true }, function(err) {
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
				var sql = " insert into radcheck (username,attribute,op,value) values ('"+mobile+"','password','==','"+user.np+"')"
				connector.execute(sql, null, (err, resultObjects) => {
					   if(!err){

							console.log("added successful to radius");
					   }
					   else
							console.log(err);
					})
			 }
			 else{
				  const err3 = new Error("AuthorizationFailed");
						err3.statusCode = 601;
						err3.code = 'AUTHORIZATION_FAILED';
					process.nextTick(function() {
						  callback(null, err3);
						});
			 }
		    
    });
  }


    Client.customSms = function(mobile,message,cb){
    	console.log(mobile,message);
		http.get(
			'http://services.mtn.com.sy/General/MTNSERVICES/ConcatenatedSender.aspx?User=LEMA%20ISP%202013&Pass=L1E2M3A4&From=LEMA-ISP&Gsm='+mobile+'&Msg='+message+'&Lang=0&Flash=0',
		function(res) {
			res.on('data', function(data) {
				console.log(data.toString());
			  return cb(null,'Done');
			});
		  }
		).on('error', function() {
			data = {
			  name: "can't send sms",
			  status: 604,
			  message: "please check your sms api"
			};
			console.log(data)
			// context.result = data;
			  return cb(new Error('error sms api'),null);
		});
	}
	Client.remoteMethod('customSms', {
    	description: 'send message to user',
		accepts: [
			{arg: 'mobile', type: 'string', required: true, http: {source: 'form'}},
			{arg: 'message', type: 'string', required: true, http: {source: 'form'}},
		],
		returns: {arg: 'message', type: 'string'},
		http: {verb: 'post',path: '/customSms'},
    });

    Client.onlineUsers = function(location,cb){
    	
    };

    Client.remoteMethod('onlineUsers', {
    	description: 'get all online users ',
		accepts: [
			{arg: 'location', type: 'string', http: {source: 'query'}},
		],
		returns:{arg: 'users', type: 'array', root : true},
		http: {verb: 'get',path: '/onlineUsers'},
    });
};