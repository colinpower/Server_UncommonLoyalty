import admin from "firebase-admin";
import functions from "firebase-functions";


const itemOnCreate = functions.firestore
  .document('item/{itemID}')
  .onCreate(async (snap, context) => {

    //get the item object
    var itemObject = snap.data();

    //grab necessary variables from the item
    const itemID = context.params.itemID
    const companyID = snap.data().ids.companyID;
    const productID = snap.data().ids.shopifyProductID.toString();

    //Find the relevant handle for this productID
    console.log(productID)


    const productData = await admin.firestore().collection("companies").doc(companyID).collection("products")
    .where("productID", "==", productID)
    .get()

    //If you found a discount code, mark it as used and add OrderID
    if (!productData.empty) {

      console.log(productData.docs[0].data())
      console.log(productData.docs[0].data().handle)


      itemObject.order.handle = productData.docs[0].data().handle;
      itemObject.order.imageURL = productData.docs[0].data().imageURL;

      return admin.firestore().collection("item").doc(itemID).update(itemObject);
        
    } else {
      
      //we have an error... do something here?
      console.log("didn't find any productID for this company")

      return;

    }
})

export default itemOnCreate;