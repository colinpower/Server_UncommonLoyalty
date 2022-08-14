//Tutorial on Shopify Auth!
//https://www.youtube.com/watch?v=oKGR9RVCUDs

import express from 'express';
import dotenv from 'dotenv';

import { Shopify } from '@shopify/shopify-api';
import { onRequest } from 'firebase-functions/v1/https';

//also trying to explicitly set the .env file as per this post
//https://community.shopify.com/c/shopify-apis-and-sdks/newbie-question-with-quot-build-a-shopify-app-with-node-js-and/td-p/535920
dotenv.config('./.env');

const host = '127.0.0.1';
const port = 5000;

//Key, Secret, Host are for Uncommon. Scopes are requests for the Shop
const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, HOST} = process.env;

//generally you want to store whether a shop has installed the app in persistent storage, but leaving in memory for now
const shops = {};


Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SHOPIFY_API_SCOPES,
    HOST_NAME: HOST,
    IS_EMBEDDED_APP: true,
});

const app = express();

//need to clear browser cache
// need to explicitly set the IP address
// seen here: https://stackoverflow.com/questions/40598428/ngrok-errors-502-bad-gateway


// app.get("/", async (req,res) => {
//     res.send("Hello world");
// });

app.get('/', async (req, res) => {
    if (typeof shops[req.query.shop] !== 'undefined') {
        res.send('Hey there! You are already authenticated with Uncommon Loyalty :)');
    } else {
        //send the shop to the auth flow, including the shop name
        res.redirect(`/auth?shop=${req.query.shop}`);
    }
})

app.get('/auth', async (req, res) => {
    //once you redirect them to the /auth route, attempt to authenticate. Then redirect to /auth/callback    
    const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        '/auth/callback',
        false,
    )
    res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
    console.log("got here!");
    //take the request to /auth/callback from the shop and Shopify. Then exchange short term token for long term one.
    const shopSession = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
    );

    //store the long-term auth token for future use
    console.log(shopSession);

    //store the store for future use
    shops[shopSession.shop] = shopSession;

    //once you get the long term auth token and shop, redirect the user back to the location of the shop
    res.redirect(`https://${shopSession.shop}/admin/apps/uncommon-loyalty`);

});

app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`)
})

//uncomment this if you want to use a prod resource for allowing 
//export default app;

//#region actual long term access token for Athleisure
// Session {
//     id: 'offline_athleisure-la.myshopify.com',
//     shop: 'athleisure-la.myshopify.com',
//     state: '535663884818981',
//     isOnline: false,
//     accessToken: 'shpua_118573cea75a2dfd000e64d984b69f64',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region long term access token for Hello VIP
// Session {
//     id: 'offline_hello-vip.myshopify.com',
//     shop: 'hello-vip.myshopify.com',
//     state: '494792040377418',
//     isOnline: false,
//     accessToken: 'shpua_8543a80d13af785857fd1d217aa59c79',
//     scope: 'read_products,read_orders,write_discounts,write_price_rules'
//   }
//#endregion

//#region Example of long-term access token
// Session {
//     id: 'offline_hello-vip.myshopify.com',
//     shop: 'hello-vip.myshopify.com',
//     state: '043922437945507',
//     isOnline: false,
//     accessToken: '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',
//     scope: 'read_products,read_orders'
//   }
//#endregion

//#region Attempting to set the access token in firebase
// const accessTokenInfo = {
//     id: shopSession.id,
//     shop: shopSession.shop,
//     state: shopSession.state,
//     isOnline: shopSession.isOnline,
//     accessToken: shopSession.accessToken || "token not found",
//     scope: shopSession.scope
// };

// const resultOfFirebaseSet = admin.firestore().collection("onboarding").doc(shopSession.shop).set(accessTokenInfo);

//log the response from firebase
//console.log("Set: ", resultOfFirebaseSet);
//#endregion