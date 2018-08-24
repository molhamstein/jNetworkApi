app.seeder.migrate('partner', 2)
    .then((users) => app.seeder.migrate('AD', 2, {
        name :'توراندو',
        link: 'https://www.facebook.com/tornado2026',
        media_link :'tt.png',
        thumb_link :'tt.png',
        partner_id : users.partner_id
    }));
app.seeder.migrate('partner', 2)
    .then((users) => app.seeder.migrate('AD', 1, {
        name :'صالون ايلي سعادة',
        link: 'https://www.facebook.com/EliasSaadeSalon/',
        media_link :'ee.png',
        thumb_link :'ee.png',
        partner_id : users.partner_id
    }));
app.seeder.migrate('partner', 2)
    .then((users) =>app.seeder.migrate('AD', 1, {
        name :'يو كوزماتيك ',
        link: 'https://www.facebook.com/YoPersonalCare/',
        media_link :'yy.png',
        thumb_link :'yy.png',
        partner_id : users.partner_id
    }));
app.seeder.migrate('partner', 2)
    .then((users) => app.seeder.migrate('AD', 1, {
        name :'فيرست بايونيرز',
        link: 'https://www.facebook.com/firstpioneersllc',
        media_link :'ff.png',
        thumb_link :'ff.png',
        partner_id : users.partner_id
    }));


;

;