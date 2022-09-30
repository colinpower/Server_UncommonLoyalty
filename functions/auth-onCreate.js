import admin from "firebase-admin";
import functions from "firebase-functions";

const authOnCreate = functions.auth
.user()
.onCreate(async (user) => {
    
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

        //create their first item purchased
        let itemRef1 = admin.firestore().collection("item").doc();

        const itemDoc1 = {

            ids: {
                companyID: "zKL7SQ0jRP8351a0NnHM",
                itemID: itemRef1.id,
                orderID: "",
                referralIDs: [""],
                reviewID: "",
                shopifyItemID: 123123,
                userID: userID
            },
            referrals: {
                count: 0,
                rewardAmount: 20000,
                rewardType: "POINTS"
            },
            review: {
                rating: 0,
                rewardAmount: 250,
                rewardType: "POINTS"
            },
            order: {
                companyName: "Athleisure LA",
                domain: "athleisure-la.myshopify.com",
                email: email,
                name: "Fake Order Name",
                orderNumber: 1234,
                orderStatusURL: "https://lmgtfy.app/?q=fake+order...",
                phone: "",
                price: "98.00",
                quantity: 1,
                returnPolicyInDays: 45,
                status: "PAID",
                timestamp: current_timestamp,
                title: "Example of Item Purchased"
            }
        };

        await itemRef1.set(itemDoc1);
        return admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramID).set(loyaltyprogramDoc);
        
    } else {
        return
    }
});

export default authOnCreate;