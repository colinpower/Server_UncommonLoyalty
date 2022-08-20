import admin from "firebase-admin";
import functions from "firebase-functions";

const reviewOnCreate = functions.firestore
  .document('reviews/{reviewID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the review
    const companyID = "zKL7SQ0jRP8351a0NnHM";
    const email = snap.data().email;
    // const historyID = snap.data().historyID;
    const orderID = snap.data().orderID;
    // const photoID = snap.data().photoID;
    // const timestamp = snap.data().timestamp;
    const userID = snap.data().userID;
    //const reviewID = context.params.reviewID

    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);

    const historyRef = admin.firestore().collection("history").doc();

    //create history entry for this review
    const historyDoc = {
      companyID: companyID,
      discountAmount: "",
      discountCode: "",
      discountCodeID: "",
      domain: "",                 //need to get the correct domains
      email: email,
      historyID: historyRef.id,
      itemIDs: [],
      item_firstItemTitle: "",
      orderID: orderID,
      orderStatusURL: "",
      pointsEarned: 100,
      numberOfReviews: 0,
      referralID: "",
      referralCode: "",
      referredOrderID: "",
      shopifyOrderID: "",
      timestamp: current_timestamp,
      type: "REVIEW",               //REFERRAL, REVIEW, ORDER, DISCOUNTCODECREATED, DISCOUNTCODEUSED
      totalPrice: 0,
      userID: userID
    };

    return historyRef.set(historyEntryForNewReview);

})

export default reviewOnCreate;