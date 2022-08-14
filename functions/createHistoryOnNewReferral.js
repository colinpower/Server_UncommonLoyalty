import { createRequire } from "module";
const require = createRequire(import.meta.url);


const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.createHistoryOnNewReferral = functions.firestore
  .document('referrals-zKL7SQ0jRP8351a0NnHM/{referralID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the referral
    const companyID = "zKL7SQ0jRP8351a0NnHM";
    const historyID = "";
    const newCustomerEmail = snap.data().newCustomerEmail;
    const orderID = snap.data().orderID;
    const referralCode = snap.data().referralCode;
    const timestamp = snap.data().timestamp;
    const totalSpent = snap.data().totalSpent;
    const userID = snap.data().userID;
    //const referralID = context.params.referralID

    const current_timestamp = new Date().getTime();
    // timestamp: Math.round(current_timestamp / 1000),

    // create history entry for this order
    const historyEntryForNewReferral = {
        companyID: companyID,
        description: "fill in later",
        discountAmount: "fill in later",
        discountCode: referralCode,
        email: "fill in later",
        orderID: "fill in later",
        pointsEarnedOrSpent: 250,
        price: totalSpent,
        reviewID: "",
        timestamp: Math.round(current_timestamp / 1000),
        type: "REFERRAL",
        userID: userID
    };

    return admin.firestore().collection("history-zKL7SQ0jRP8351a0NnHM").add(historyEntryForNewReferral)

})