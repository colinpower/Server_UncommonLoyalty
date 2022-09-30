// const productPath = "companies/" + companyID + "/products"

//         console.log("the product ID is " + productID)
//         console.log("the product path is " + productPath)
        
//         //Given the productID, what's the handle and image URL?

//         const productIDInfo = await admin.firestore().collection("companies/" + companyID + "/products").doc(productID).get();

//         // Iterate through the documents fetched
//         querySnapshot.forEach((productIDInfo) => {
//             console.log(
//                 productIDInfo.id,
//                 productIDInfo.data(),
//                 "reached this point and the forEach is working?"
//             )
//         })


import admin from "firebase-admin";
import functions from "firebase-functions";


const itemOnCreate = functions.firestore
  .document('item/{itemID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the item
    const itemID = context.params.itemID
    const companyID = snap.data().ids.companyID;
    const shopify_productID = snap.data().ids.shopify_productID;


    return;
    //create reference to product info
    //var productIDRef = 'companies/' + companyID + '/products/'

    //const productRef = admin.firestore().collection('companies').doc(companyID).collection('products').doc(shopify_productID);

    //get the product info, write it back to the item

    // const doc = await productRef.get();

    // if (!doc.exists) {

    //     console.log("no document for the item-onCreate function");

    //     return;

    // } else {

    //     console.log('the handle in item-onCreate is ' + doc.data().handle);

    //     var currentItem = snap.data();

    //     currentItem.order.handle = doc.data().handle;

    //     currentItem.order.imageURL = doc.data().imageURL;

    //     return admin.firestore().collection("item").doc(itemID).update(currentItem)

    // }

})

export default itemOnCreate;