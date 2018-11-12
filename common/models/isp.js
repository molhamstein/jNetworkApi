'use strict';
var pubsub = require('../../server/pubsub.js');
const MyEmitter = require('mysql-event-emitter');

module.exports = function (isp) {



  isp.observe('after save', function (ctx, next) {
    var socket = isp.app.io;
    // if (ctx.isNewInstance) {
    //   //Now publishing the data..
    //   pubsub.publish(socket, {
    //     collectionName: 'Isp',
    //     data: ctx.instance,
    //     method: 'POST'
    //   });
    // } else {
    //   //Now publishing the data..
    //   console.log("PUUUUUUUUUUUUUt");
    //   pubsub.publish(socket, {
    //     collectionName: 'Isp',
    //     data: ctx.instance,
    //     modelId: ctx.instance.id,
    //     method: 'PUT'
    //   });
    // }
    //Calling the next middleware..
    next();
  }); //after save..
};


// const MySQLEvents = require('@rodrigogs/mysql-events');

// const program = async () => {

//   const instance = new MySQLEvents({
//     host: 'localhost',
//     user: 'root2',
//     password: '',
//   }, {
//     serverId: 3,
//     startAtEnd: true,
//   });
//   await instance.start();
//   instance.addTrigger({
//     name: 'All events from radius',
//     expression: "*",
//     statement: MySQLEvents.STATEMENTS.ALL,
//     onEvent: async (event) => {
//       // Here you will get the events for the given expression/statement.
//       // This could be an async function.
//       await doSomething(event);
//     },
//   });

//   instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
//   instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
// };


// function doSomething(event) {
//   console.log(event)
// }

// program()
//   .then(() => console.log('Waiting for database events...'))
//   .catch(console.error);
