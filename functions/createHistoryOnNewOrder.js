//notes on how to use promises here
//https://www.youtube.com/watch?v=d9GrysWH1Lc

//how to handle multiple async requests to firebase
//https://stackoverflow.com/questions/62637424/how-to-handle-multiple-dependent-asynchronous-queries-in-firestore

//this may be helpful in returning only 1 doc and grabbing it correctly
//https://stackoverflow.com/questions/54666556/get-first-element-from-collection-and-delete-it

//example of getting id and doing a .then() statement
//https://stackoverflow.com/questions/53106097/firebase-functions-not-logging-console-log-statements

//may need composite index
//const { userID } = await admin.firestore().collection('loyaltyprograms').where('companyID', '==', 'zKL7SQ0jRP8351a0NnHM').where('email', '==', email).get();
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.createHistoryOnNewOrder = functions.firestore
  .document('orders-zKL7SQ0jRP8351a0NnHM/{orderID}')
  .onCreate(async (snap, context) => {


    //grab necessary variables from the order
    const discountAmount = snap.data().discountAmount;
    const discountCode = snap.data().discountCode;
    const email = snap.data().email;
    const item = snap.data().item;
    const orderIdPath = context.params.orderID;
    const pointsEarned = snap.data().pointsEarned;
    const totalPrice = snap.data().totalPrice;
    const userID = snap.data().userID;

    var loyaltyUserID = "";
    const current_timestamp = new Date().getTime();
    // timestamp: Math.round(current_timestamp / 1000),

    // create history entry for this order
    const historyEntryForNewOrder = {
        companyID: "zKL7SQ0jRP8351a0NnHM",
        description: item,
        discountAmount: discountAmount,
        discountCode: discountCode,
        email: email,
        orderID: orderIdPath,
        pointsEarnedOrSpent: pointsEarned,
        price: totalPrice,
        reviewID: "",
        timestamp: Math.round(current_timestamp / 1000),
        type: "ORDER",
        userID: userID
    };

    //three paths we can go down: 1) no discount code, 2) has referral code, 3) has discount code
    //Path 1: No Code
    if (discountCode == "") {
        return admin.firestore().collection("history-zKL7SQ0jRP8351a0NnHM").add(historyEntryForNewOrder)
    } 
    //Path 2: Referral
    else if (discountCode.includes("COMMON")) {
        return admin.firestore().collection("history-zKL7SQ0jRP8351a0NnHM").add(historyEntryForNewOrder)
            .then(() => {
                return admin.firestore().collection('loyaltyprograms').where('referralCode', '==', discountCode)
                    .limit(1)
                    .get()
            })
            .then(result => {

                if (result.empty) {
                    return null
                } else {
                    
                    loyaltyUserID = result.docs[0].data().userID
                    
                    //need to actually post to the referrals collection, not users... referrals will handle posting to history
                    const referralData = {
                        companyID: "zKL7SQ0jRP8351a0NnHM",
                        historyID: "fill in later",
                        newCustomerEmail: email,
                        orderID: orderIdPath,
                        referralCode: discountCode,
                        timestamp: "fill in later",
                        totalSpent: totalPrice,
                        userID: loyaltyUserID
                    };

                    return admin.firestore().collection('referrals-zKL7SQ0jRP8351a0NnHM').add(referralData)
                }
            })
            .catch(error => {
                console.log(error)
            })
    } 
    //Path 3: other discount code 
    else {
        return admin.firestore().collection("history-zKL7SQ0jRP8351a0NnHM").add(historyEntryForNewOrder)
            .then(() => {
                return admin.firestore().collection('discountcodes-zKL7SQ0jRP8351a0NnHM').where('code', '==', discountCode)
                    .limit(1)
                    .get()
            })
            .then(result => {

                if (result.empty) {
                    return null
                } else {
                    
                    var discountCodeRef = result.docs[0].id
                    
                    //update to the discountcodes collection, marking it as used
                    const discountUpdateData = {
                        status: "USED",
                        timestampUsed: "used at this time",
                    };

                    return admin.firestore().collection('discountcodes-zKL7SQ0jRP8351a0NnHM').doc(discountCodeRef).update(discountUpdateData)
                }
            })
            .catch(error => {
                console.log(error)
            })
    }
});  

