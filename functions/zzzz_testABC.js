
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);


const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const admin = require('firebase-admin');


const functions = require('firebase-functions');

//admin.initializeApp(functions.config().firebase);

//used for local testing
// const host = '192.168.0.127';
// const port = 3000;


const testapp = express();
testapp.use(bodyParser.json());
testapp.use(bodyParser.urlencoded({
    extended: true,
}));


testapp.get('/', (req, res) => {
    //res.send(req.headers)

    res.send("hello world");
})

testapp.post('/', async (req, res) => {

    const webhookData = req.body;
    const domain = req.header('x-shopify-shop-domain')
    console.log(`domain is ${domain}`)

    var companyID = ""

    switch(domain) {
        case "athleisure-la.myshopify.com":
            companyID = "zKL7SQ0jRP8351a0NnHM"
            console.log("Matched the webhook header");
            break;
        case "ABC123":
            companyID = "ABC123-noHeaderMatched"
            break;
        default:
            companyID = "No header matched! We have an issue"
    }


    console.log("email is " + webhookData.email);

    let newOrderRef = admin.firestore().collection("orders-zKL7SQ0jRP8351a0NnHM").doc();

    let discountCodeName = "";
    let discountCodeValue = "";

    //get discount code if not null

    // if(webhookData.discount_codes.length !== 0) {
    //     discountCodeName = webhookData.discount_codes[0].code;
    //     discountCodeValue = webhookData.discount_codes[0].amount;
    // }


    
    //meed to update to email variable, webhookData.email

    return await admin.firestore().collection('users').where('email', '==', "colinjpower1@gmail.com")
        .get()
        .then(result => {

            if (result.empty) {
                console.log("12345")
            }
            else {
                const orderData = {
                    email: "colinjpower1@gmail.com", //webhookData.email,
                }

                newOrderRef.set(orderData);
                res.status(201).send();
            }

        }).catch(error => {
            console.log(error);
            res.status(500).send();
        })
    //res.send(req.header('Content-Type'))

    //res.send("hello world");
})


exports.testapp = functions.https.onRequest(testapp);

// const port = 80
// testapp.listen(port, () => console.log(`listening on port ${port}`))



// const http = require('http');
// const port = 80;

// const server = http.createServer(function(req, res) {

//     var contentType = req.header('Content-Type');
//     var orderID = req.body.orderID;

//     res.write(contentType)
//     res.end()
// })

// server.listen(port, function(error) {
//     if (error) {
//         console.log('Something went wrong', error)
//     } else {
//         console.log('listening on port ' + port)
//     }

// })



// x-shopify-topic: orders/cancelled
// x-shopify-shop-domain: 	athleisure-la.myshopify.com
// x-shopify-order-id: 820982911946154508