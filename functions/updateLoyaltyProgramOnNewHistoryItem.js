


import { createRequire } from "module";
const require = createRequire(import.meta.url);

const admin = require('firebase-admin');
const functions = require('firebase-functions');
//need to switch to FieldValue.increment, because this function might be called at the same time for dif things?
//const FieldValue = require('firebase-admin');

exports.updateLoyaltyProgramOnNewHistoryItem = functions.firestore
  .document('history-zKL7SQ0jRP8351a0NnHM/{historyID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the history item
    const companyID = "zKL7SQ0jRP8351a0NnHM";
    const changeInPoints = snap.data().pointsEarnedOrSpent;
    const userID = snap.data().userID;

    //create reference to loyaltyProgram
    var loyaltyProgramRef = userID + "-" + companyID

    //update lifetimePoints, currentPointsBalance

    return await admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramRef)
        .get()
        .then(result => {


            if (changeInPoints < 0) {

                //Then, don't decrement the lifetime points just bc points were spent
                const loyaltyProgramUpdateData = {
                    currentPointsBalance: result.data().currentPointsBalance + changeInPoints
                }
            } else {
                const loyaltyProgramUpdateData = {
                    lifetimePoints: result.data().lifetimePoints + changeInPoints,
                    currentPointsBalance: result.data().currentPointsBalance + changeInPoints
                }
            }

            return admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramRef)
                .update(loyaltyProgramUpdateData)
            
        })
        .catch(error => {
            console.log(error)
        })
})