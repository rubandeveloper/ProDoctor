
require('dotenv').config()

const express = require("express");
const app = express();
const path = require('path')
const http = require('http')
const server = http.createServer(app)
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const morgan = require('morgan')
const bodyParser = require('body-parser');

const Mongo = require('./utils/MongoConnector')
const Mongo_Config = require('./Config/MongoDB')
const Server_Config = require('./Config/server')
const RouteManager = require("./Models/index");
const requestIp = require('request-ip');
const fetch = require('node-fetch')

app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP if not needed
    crossOriginOpenerPolicy: 'same-origin', // Set COOP policy
}));
app.use(morgan('combined'))


const MongoClient = new Mongo(Mongo_Config.URI, Mongo_Config.DATABASE);
app.locals.mongoClient = MongoClient


app.use(express.static('../frontend/build'))

app.get("*", async (req, res) => {
    res.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
})


// fetch('https://na-1-dev.api.opentext.com/tenants/15e487da-86bb-44f8-a7a2-751a9f8c8824/oauth2/token', {
//     method: 'POST',
//     header: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
//     body: JSON.stringify({
//         "client_id": "G7C7yka5HlVz7pY6wyHNitp8f3XgJB41",
//         "client_secret": "w60O7WzNMLlt19Jo",
//         "grant_type": "password",
//         "username": "rajajayarubant@gmail.com",
//         "password": "Leorajjokesha@237110"
//     })
// }).then(res => res.json()).then(res => {
//     console.log(res, 'res');
// })

/* Start Server */
function startServer(server, port) {


    MongoClient.init((err, client) => {

        if (err) {
            console.log(err);
            throw new Error("Mongo connection failed")
        } else {

            server.listen(port, () => {
                console.log('Server started on port ' + port)
                RouteManager(app);

            })

        }

    });
}


const Twillio = () => {

    const accountSid = "AC4f36d5a602abc462a4034533b37a849c";
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = "VAdf1a61926250613c0d90bb12d7c2cc4a";
    const client = require("twilio")(accountSid, authToken);

    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: "+917904491410", channel: "sms" })
        .then((verification) => console.log(verification.status))
        .then(() => {

            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: "+917904491410", code: "953284" })
                .then((verification_check) => console.log(verification_check))

        });

}

// Twillio() 

startServer(server, Server_Config.PORT)