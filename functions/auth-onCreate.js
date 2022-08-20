import admin from "firebase-admin";
import functions from "firebase-functions";

const authOnCreate = functions.auth.user().onCreate((user) => {
    
    if (user.emailVerified) {

        var email = "";
        email = user.email

        var userID = "";
        userID = user.uid;
        const current_timestamp_milliseconds = new Date().getTime();
        const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);

        const loyaltyProgramID = user.uid + "zKL7SQ0jRP8351a0NnHM";

        //create their first loyalty program
        const loyaltyprogramDoc = {
            companyID: "zKL7SQ0jRP8351a0NnHM",
            companyName: "Athleisure LA",
            currentPointsBalance: 1000,
            domain: "athleisure-la.myshopify.com",
            email: email,
            lifetimePoints: 1000,
            numberOfReferrals: 0,
            numberOfReviews: 0,
            referralCode: "UNCOMMON-1",
            status: "None",
            timestamp: current_timestamp,
            userID: userID
        };

        return admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramID).set(loyaltyprogramDoc);
        
    } else {
        return
    }
});

export default authOnCreate;