 var app = require('../server/server');

app.seeder.createFactory('Ad', {

  name :'{{name}}',
  link: '{{link}}',
  media_link :'{{link}}',
  thumb_link :'{{link}}',
  partner_id : '{{Number}}'
});

app.seeder.createFactory('partner', {
    'username': '{{name.firstName}}',
    'fullname': '{{name.fullname}}',
    'email': '{{internet.email}}',
    'password': '{{internet.password}}',
    'birthdate': '{{date.past(50)}}',
  });
