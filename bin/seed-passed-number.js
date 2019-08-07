
let app = require("../server/server");

let main = async () => {
    const Client = app.models.client;
    const password = "123456";
    const connector = app.dataSources.mydb.connector;

    const passed = {
        realm: '',
        username: '_passed_',
        np: password,
        password: Client.hashPassword(password),
        mobile: '00963999999999',
        gender: 'female',
        profession : "I am princess I don't work" , 
        birthdate : '1/1/1990' , 
        isByPass: true,
        email : '', 

    };

    let client = await Client.findOne({ where: { mobile: passed.mobile } });
    if (client) {
        console.log("Passed user already exists");
        return;
    }
    client = await Client.create(passed); 
    let sql = " insert into radcheck (username,attribute,op,value) values ('" + passed.mobile + "','password','==','" + passed.np + "')"

    let result = await new Promise((res, rej) => {
        connector.execute(sql, null, (err, result) => {
            if (err) return rej(err);
            return res(result);
        });
    });
    console.log("Done seeding passed number");

};

main();