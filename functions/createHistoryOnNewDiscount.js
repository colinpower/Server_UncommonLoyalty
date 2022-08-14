

import admin from "firebase-admin";
import functions from "firebase-functions";




const createHistoryOnNewDiscountFunction = functions.firestore
  .document('discountcodes-zKL7SQ0jRP8351a0NnHM/{discountID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the discount
    const companyID = "zKL7SQ0jRP8351a0NnHM";
    const discountAmount = snap.data().dollarAmount;
    const discountCode = snap.data().code;
    const pointsSpent = snap.data().pointsSpent;
    const email = snap.data().email;
    // const historyID = snap.data().historyID;
    // const orderID = snap.data().orderID;
    // const photoID = snap.data().photoID;
    // const timestamp = snap.data().timestamp;
    const userID = snap.data().userID;
    //const reviewID = context.params.reviewID

    const current_timestamp = new Date().getTime();
    // timestamp: Math.round(current_timestamp / 1000),


    // create history entry for this order
    const historyEntryForNewDiscount = {
        companyID: companyID,
        description: "fill in later",
        discountAmount: discountAmount,
        discountCode: discountCode,
        email: email,
        orderID: "fill in later",
        pointsEarnedOrSpent: pointsSpent * -1,
        price: 0,
        reviewID: "",
        timestamp: Math.round(current_timestamp / 1000),
        type: "DISCOUNTCODE",
        userID: userID
    };

    return admin.firestore().collection("history-zKL7SQ0jRP8351a0NnHM").add(historyEntryForNewDiscount)

})

export default createHistoryOnNewDiscountFunction;