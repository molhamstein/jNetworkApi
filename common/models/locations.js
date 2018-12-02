'use strict';
var SSH = require('simple-ssh');

module.exports = function (Locations) {
  Locations.validatesInclusionOf('type', { in: ['free', 'automatic', 'manual']
  });


  // var ssh = new SSH({
  //   host: '185.84.236.39',
  //   user: 'jihad_lts',
  //   port: 6245,
  //   pass: 'jihad_lts'
  // });
  // console.log(ssh)
  // ssh.exec('echo "awesome!"', {
  //   out: function (stdout) {
  //     console.log("Ssssss");
  //     console.log(stdout);
  //   }
  // }).start();

  /**
   *
   * @param {string} routerName
   * @param {number} username
   * @param {Function(Error, object)} callback
   */

  Locations.disconnectClient = function (routerName, username, callback) {
    var result;
    // TODO
    Locations.findOne({
      "where": {
        "routerName": routerName
      }
    }, function (err, oneLocation) {
      if (err) {
        callback(err, null);
      } else {
        var ip = oneLocation.id;
        var user = oneLocation.user;
        var port = oneLocation.port;
        var password = oneLocation.password;

        var ip = "185.84.236.39";
        var user = "jihad_lts";
        var port = "6245";
        var password = "jihad_lts";


        var ssh = new SSH({
          host: ip,
          user: user,
          port: port,
          pass: password
        });
        console.log(ssh)
        ssh.exec('echo "' + username + '"', {
          out: function (stdout) {
            console.log(stdout);
            callback(null, {});
          }
        }).start();
      }

    })
  };

};
