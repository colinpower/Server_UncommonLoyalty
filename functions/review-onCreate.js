import admin from "firebase-admin";
import functions from "firebase-functions";

const reviewOnCreate = functions.firestore
  .document('reviews/{reviewID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the review
    const companyID = snap.data().ids.companyID;
    const userID = snap.data().ids.userID;
    const timestamp = snap.data().card.timestamp;
    const pointsEarned = snap.data().reward.rewardEarned;
    
    //Step 1: Check to see that you have found the right loyalty program
    const loyaltyResult = await admin.firestore().collection("loyaltyprograms")
    .where("userID", "==", userID)
    .where("companyID", "==", companyID)
    .get()

    //If you didn't find a loyalty program, ERROR! This is really bad
    if (loyaltyResult.empty) {
      
      //ERROR!!!! NEED TO LOG THIS AND WATCH OUT
    
    } else {
      
      var updatedLoyaltyObject = loyaltyResult.docs[0].data();

      updatedLoyaltyObject.currentPointsBalance = updatedLoyaltyObject.currentPointsBalance + pointsEarned
      updatedLoyaltyObject.numberOfReviews = updatedLoyaltyObject.numberOfReviews + 1

      var loyaltyProgramID = userID + "-" + companyID

      return admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramID).update(updatedLoyaltyObject);

    }
});

export default reviewOnCreate;