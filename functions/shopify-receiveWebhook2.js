//simple overview of shopify webhooks.. also use beeceptor to test
//https://gist.github.com/magician11/08a226555161d633e21fc2bcf374e708

// #region Imports
import admin from "firebase-admin";
import functions from "firebase-functions";
import express from "express";
import bodyParser from "body-parser";
import { title } from "process";
//#endregion

// #region Local testing
//used for local testing
// const host = '192.168.0.127';
// const port = 3000;
// #endregion

// #region Initialize express app
const shopifyReceiveWebhook2 = express();
shopifyReceiveWebhook2.use(bodyParser.json());
shopifyReceiveWebhook2.use(bodyParser.urlencoded({
    extended: true,
}));
// #endregion

shopifyReceiveWebhook2.post("/", async (req, res) => {


    //#region Step 1: Get the necessary variables from the webhook
    const shopDomain = req.header('x-shopify-shop-domain');     //this tells you which shop it's from
    //const webhookType = req.header('x-shopify-topic');     //this tells you which shop it's from
    //const shopifyOrderID = req.header('x-shopify-order-id');     //the order ID, if it exists... if webhookType=="refund", you need to get the orderID from the body
    const webhookData = req.body;        //this has the payload
    const email = webhookData.email;     //
    const phone = webhookData.phone;     //
    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);
    const numberOfOrderDiscountCodes = webhookData.discount_codes.length;
    
    var itemIDs = []                                                // Create the empty array of itemIDs
    var quantityPerItemID = []



    
    //#endregion

    //#region Step 2: Figure out what shop we received the webhook from
    switch(shopDomain) {
        case "athleisure-la.myshopify.com":
            var companyID = "zKL7SQ0jRP8351a0NnHM"
            var companyName = "Athleisure LA"
            var pointsPerDollar = 10
            var pointsPerReview = 250
            var pointsPerReferral = 10000
            var returnPolicyInDays = 45
            console.log("Matched to Athleisure company ID");
            break;
        case "hello-vip.myshopify.com":
            var companyID = "QVmwSAakMGqIwi8Ewg7S"
            var companyName = "Hello VIP"
            var pointsPerDollar = 10
            var pointsPerReview = 250
            var pointsPerReferral = 10000
            var returnPolicyInDays = 30
            console.log("Matched to hello-vip company ID");
            break;
        case "hello-vip-test-1.myshopify.com":
            var companyID = "HcTcyHHdGwPWNPnKoVll"
            var companyName = "Hello VIP Test 1"
            var pointsPerDollar = 10
            var pointsPerReview = 250
            var pointsPerReferral = 10000
            var returnPolicyInDays = 21
            console.log("Matched to hello-vip-test-1 company ID");
            break;
        default:
            var companyID = "No header matched! We have an issue"
            var pointsPerDollar = 10
    }

    //Step 3: Determine if you have a loyalty program
    const loyaltyprogramResult = await admin.firestore().collection("loyaltyprograms")
        .where("domain", "==", shopDomain)
        .where("email", "==", email)
        .get()
    
    // Check if UserID exists
    if (!loyaltyprogramResult.empty) {
        var userID = loyaltyprogramResult.docs[0].data().userID;
    } else {
        var userID = "";
    }

    console.log("reaching this point");




    // Create the reference to the Order and the History entries
    let newOrderRef = admin.firestore().collection("order").doc();

    
    // Iterate over each item in the order, create a new entry in Items collection for each item
    const itemsInOrder = webhookData.line_items;
    
    for (const orderItem of itemsInOrder) {

        //Grab the product ID
        const productID = orderItem.product_id;
        //console.log("the product ID is " + productID)

        //Create a new reference for a new item
        let newItemRef = admin.firestore().collection("item").doc();

        //Add to the [ItemIDs] array for when you're creating the Order object
        itemIDs.push(newItemRef.id)

        quantityPerItemID.push(orderItem.quantity)

        var itemObject = {
            
            ids: {
                companyID: companyID,
                itemID: newItemRef.id,
                orderID: newOrderRef.id,
                referralIDs: [""],
                reviewID: "",
                shopifyItemID: orderItem.id,
                shopifyProductID: productID,
                userID: userID
            },
            referrals: {
                count: 0,
                rewardType: "POINTS",
                rewardAmount: pointsPerReferral
            },
            review: {
                rating: 0,
                rewardType: "POINTS",
                rewardAmount: pointsPerReview
            },
            order: {
                companyName: companyName,
                domain: shopDomain,
                email: email,
                handle: "",
                imageURL: "",
                name: orderItem.name,
                orderNumber: webhookData.order_number,
                orderStatusURL: webhookData.order_status_url,
                phone: "",
                price: orderItem.price,
                quantity: orderItem.quantity,
                returnPolicyInDays: returnPolicyInDays,
                status: "PAID",                         //PAID, REFUNDED, PARTIALLY REFUNDED
                timestamp: current_timestamp,
                title: orderItem.title,
            }
        };

        //Post the item to firestore
        await newItemRef.set(itemObject);
    };


    // Create the unfinished Order object
    var orderObject = {

        ids: {
            companyID: companyID,
            discountCodeID: "",
            itemIDs: itemIDs,
            quantityPerItemID: quantityPerItemID,
            orderID: newOrderRef.id,
            referralID: "",
            shopifyOrderID: webhookData.id,
            userID: userID
        },
        order: {
            companyName: companyName,
            domain: shopDomain,
            email: email,
            firstItemTitle: webhookData.line_items[0].title,
            orderNumber: webhookData.order_number,
            orderStatusURL: webhookData.order_status_url,
            phone: "",              //need to check if phone is null, and what its usual default value is
            price: webhookData.total_line_items_price,
            status: "PAID",
            timestampCreated: current_timestamp,
            timestampUpdated: -1,
        },
        discountCode: {
            type: "",
            amount: "",
            code: ""
        }       
    };

    if (numberOfOrderDiscountCodes > 0) {
        orderObject.discountCode.type = webhookData.discount_codes[0].type
        orderObject.discountCode.amount = webhookData.discount_codes[0].amount
        orderObject.discountCode.code = webhookData.discount_codes[0].code
    }

    await newOrderRef.set(orderObject);  // add the order

    console.log("known user, no discount code");
    res.sendStatus(200);
    
});

//exports.shopifyReceiveWebhook = functions.https.onRequest(shopifyReceiveWebhook);
export default shopifyReceiveWebhook2;

//used for testing
// shopifyReceiveWebhook.listen(port, () => {
//     console.log(`Server running at ${port}`);
// });




// //Step 5: determine the scenario
    
// if (numberOfOrderDiscountCodes > 0) {           //it's a KNOWN USER + KNOWN DISCOUNT, KNOWN USER + UNKNOWN DISCOUNT, UNKNOWN USER + KNOWN REFERRAL, UNKNOWN USER + UNKNOWN DISCOUNT
//     //HAS DISCOUNT CODE

//     const orderDiscountCode = webhookData.discount_codes[0].code;
//     const orderDiscountAmount = webhookData.total_discounts;        

//     //Does the user have a loyalty account?
//     if (!loyaltyprogramResult.empty) {          //it's a KNOWN USER + KNOWN DISCOUNT, KNOWN USER + UNKNOWN DISCOUNT

//         //Is the discount one of the ones created in the app?
//         const discountResult = await admin.firestore().collection("discount")
//             .where("domain", "==", shopDomain)
//             .where("code", "==", orderDiscountCode)
//             .get()

//         if (!discountResult.empty) {            //it's a KNOWN USER + KNOWN DISCOUNT
            
//             var additionalPoints = Number(webhookData.total_line_items_price) * pointsPerDollar;
//             var currentPoints = loyaltyprogramResult.docs[0].data().currentPointsBalance;
//             var lifetimePoints = loyaltyprogramResult.docs[0].data().lifetimePoints;

//             // Step 1: modify the order object as needed, then add it
//             orderObject.pointsEarned = additionalPoints;  // set the amount of points earned
//             orderObject.discountAmount = orderDiscountAmount;  // set the amount of the discount
//             orderObject.discountCode = orderDiscountCode;  // set the amount of the discount
//             orderObject.discountCodeID = discountResult.docs[0].id;  // set the ID of the associated discount
//             await newOrderRef.set(orderObject);  // add the order

//             // Step 2: modify the history object as needed, then add it
//             historyObject.pointsEarned = additionalPoints;  // set the amount of points earned
//             await newHistoryRef.set(historyObject);  // add history (order)

//             // Step 3: update loyaltyprogram
//             var loyaltyprogramUpdate = {
//                 currentPointsBalance: currentPoints + additionalPoints,
//                 lifetimePoints: lifetimePoints + additionalPoints
//             };
//             await admin.firestore().collection("loyaltyprograms").doc(loyaltyprogramResult.docs[0].id).update(loyaltyprogramUpdate);

//             // Step 4: update discount (used)
//             var discountUpdate = {
//                 status: "USED",
//                 timestamp_Used: current_timestamp,
//                 usedOnOrderID: newOrderRef.id
//             };
//             console.log("the discount ID is...")
//             console.log(discountResult.docs[0].id)
//             await admin.firestore().collection("discount").doc(discountResult.docs[0].id).update(discountUpdate);

//             // Step 5: End and send 200 status
//             console.log("known user, known discount code");
//             res.sendStatus(200);
        
//         } else {                                //it's a KNOWN USER + UNKNOWN DISCOUNT

//             console.log("known user, unknown discount code");
//             res.sendStatus(200);

//             // add order
//             // add history (order)
//             // add history (discount)
//             // update loyaltyprogram (points)
//         }

//     } else {                                    //it's an UNKNOWN USER + KNOWN REFERRAL, UNKNOWN USER + UNKNOWN DISCOUNT

//         //Is the discount a referral code?
//         const referralResult = await admin.firestore().collection("referral")
//             .where("domain", "==", shopDomain)
//             .where("referralCode", "==", orderDiscountCode)
//             .get()

//         if (!referralResult.empty) {            //it's an UNKNOWN USER + KNOWN REFERRAL

//             console.log("unknown user, known referral code");
//             res.sendStatus(200);

//         } else {                                //it's an UNKNOWN USER + UNKNOWN DISCOUNT

//             console.log("unknown user, unknown discount code");
//             res.sendStatus(200);

//         }
//     }

// } else {                                        //it's a KNOWN USER or an UNKNOWN USER
//     //DOES NOT HAVE DISCOUNT CODE
    
//     //Does the user have a loyalty account?
//     if (!loyaltyprogramResult.empty) {          //it's a KNOWN USER

//         var additionalPoints = Number(webhookData.total_line_items_price) * pointsPerDollar;
//         var currentPoints = loyaltyprogramResult.docs[0].data().currentPointsBalance;
//         var lifetimePoints = loyaltyprogramResult.docs[0].data().lifetimePoints;

//         // Step 1: modify the order object as needed, then add it
//         orderObject.pointsEarned = additionalPoints;  // set the amount of points earned
//         await newOrderRef.set(orderObject);  // add the order

//         // Step 2: modify the history object as needed, then add it
//         historyObject.pointsEarned = additionalPoints;  // set the amount of points earned
//         await newHistoryRef.set(historyObject);  // add history (order)

//         // Step 3: update loyaltyprogram
//         var loyaltyprogramUpdate = {
//             currentPointsBalance: currentPoints + additionalPoints,
//             lifetimePoints: lifetimePoints + additionalPoints
//         };
//         await admin.firestore().collection("loyaltyprograms").doc(loyaltyprogramResult.docs[0].id).update(loyaltyprogramUpdate);

//         // Step 4: End and send 200 status
//         console.log("known user, no discount code");
//         res.sendStatus(200);

//     } else {                                    //it's a UNKNOWN USER
//         console.log("it's an unknown user");
//         res.sendStatus(200);
//     }
// }