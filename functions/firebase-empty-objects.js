
//Empty Order Object
var orderObject = {
    companyID: "",
    discountAmount: "",
    discountCode: "",
    discountCodeID: "",
    domain: "",
    email: "",
    historyID: "",
    itemIDs: [],
    item_firstItemTitle: "",
    orderID: "",
    orderStatusURL: "",
    pointsEarned: 0,
    numberOfReviews: 0,
    referralID: "",
    referralCode: "",
    shopifyOrderID: "",
    status: "",                         //PAID, REFUNDED, PARTIALLY REFUNDED
    timestamp: 0,
    totalPrice: 0,
    userID: ""
};

//Empty Item object
var itemObject = {
    companyID: "",
    domain: "",
    email: "",
    itemID: "",
    orderID: "",
    price: 0,                              //might need to account for discounts
    name: "",
    title: "",
    quantity: 0,
    reviewID: "",
    reviewRating: 0, 
    shopifyItemID: 0,
    status: "",                         //PAID, REFUNDED, PARTIALLY REFUNDED
    timestamp: 0,
    userID: ""
};



//Empty History Object
var historyObject = {
    companyID: "",
    discountAmount: "",
    discountCode: "",
    discountCodeID: "",
    domain: "",
    email: "",
    historyID: "",
    itemIDs: [],
    item_firstItemTitle: "",
    orderID: "",
    orderStatusURL: "",
    pointsEarned: 0,
    numberOfReviews: 0,
    referralID: "",
    referralCode: "",
    referredOrderID: "",
    shopifyOrderID: "",
    type: "",                         //REFERRAL, REVIEW, ORDER, DISCOUNTCODECREATED, DISCOUNTCODEUSED
    timestamp: 0,
    totalPrice: 0,
    userID: ""
};


//Empty Discount Object
var discountObject = {
    code: "",
    companyID: "",
    companyName: "",
    discountID: "",
    dollarAmount: 0,
    domain: "",
    email: "",
    firstNameID: "",
    graphqlID: "",
    historyID: "",
    minimumSpendREquired: 0,
    pointsSpent: 0,
    status: "",                     //USED, ACTIVE
    timestamp_Active: 0,
    timestamp_Created: 0,
    timestamp_Used: 0,
    usageLimit: 0,
    usedOnOrderID: "",
    userID: ""
};