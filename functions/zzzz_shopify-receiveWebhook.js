// import admin from "firebase-admin";
// import functions from "firebase-functions";

// import express from "express";
// import bodyParser from "body-parser";

// import { title } from "process";
// //const { title } = require("process");



// //create app
// const shopifyReceiveWebhook = express();
// receiveOrder.use(bodyParser.json());
// receiveOrder.use(bodyParser.urlencoded({
//     extended: true,
// }));

// //route for a POST message
// receiveOrder.post("/", async (req, res) => {
    
//     // get the info from the new order
//     console.log(`Incoming message from ${req.body.item}: ${req.body.totalPrice}`);

//     const current_timestamp = new Date().getTime();
//     // timestamp: Math.round(current_timestamp / 1000),

//     //get items from the post body
//     companyID = req.body.companyID;
//     discountAmount = req.body.discountAmount;
//     discountCode = req.body.discountCode;
//     discountCodeID = req.body.discountCodeID;
//     email = req.body.email;
//     historyID = req.body.historyID;
//     item = req.body.item;
//     numberOfItemsInOrder = req.body.numberOfItemsInOrder;
//     orderID = req.body.orderID;
//     pointsEarned = req.body.pointsEarned;
//     reviewID = req.body.reviewID;
//     status1 = req.body.status;
//     title1 = req.body.title;
//     totalPrice = req.body.totalPrice;
//     userID = req.body.userID;

//     // create an object to post in Firestore
//     const orderData = {
//         companyID: companyID,
//         discountAmount: discountAmount,
//         discountCode: discountCode,
//         discountCodeID: discountCodeID,
//         email: email,
//         historyID: historyID,
//         item: item,
//         numberOfItemsInOrder: numberOfItemsInOrder,
//         orderID: orderID,
//         pointsEarned: pointsEarned,
//         reviewID: reviewID,
//         status: status1,
//         timestamp: Math.round(current_timestamp / 1000),
//         title: title1,
//         totalPrice: totalPrice,
//         userID: userID
//     };

//     // write the info to a new order
//     await admin.firestore().collection("orders").add(orderData)
    
//     // once it"s complete, send status saying it"s done
//     res.status(201).send();
// });

// export default shopifyReceiveWebhook;
