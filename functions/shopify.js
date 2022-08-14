//Tutorial on Shopify Auth!
//https://www.youtube.com/watch?v=oKGR9RVCUDs


// const express = require('express');
// const dotenv = require('dotenv').config();

// const { Shopify } = require('@shopify/shopify-api').default;

import express from 'express';
import dotenv from 'dotenv';

import { Shopify } from '@shopify/shopify-api';
import { onRequest } from 'firebase-functions/v1/https';
dotenv.config();

// const host = '192.168.0.127';
// const port = 3000;

const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, HOST} = process.env;

const shops = {};
//generally you want to store whether a shop has installed the app in persistent storage, but leaving in memory for now

Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SHOPIFY_API_SCOPES,
    HOST_NAME: HOST,
    IS_EMBEDDED_APP: true,
});

const app = express();

app.get('/', async (req, res) => {
    if (typeof shops[req.query.shop] !== 'undefined') {
        res.send('hello world! we have seen this shop before');
    } else {
        //send the shop to the auth flow, including the shop name
        res.redirect(`/auth?shop=${req.query.shop}`);
    }
})

app.get('/auth', async (req, res) => {
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
    const shopSession = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
    );

    //store the auth token for future use
    console.log(shopSession);

    //store the store for future use
    shops[shopSession.shop] = shopSession;

    res.redirect(`https://${shopSession.shop}/admin/apps/hello-vip`);

});

// app.listen(port, () => {
//     console.log(`Server running at http://${host}:${port}/`);
// });

//exports.widget = functions.https.onRequest(app);

export default app;

// Session {
//     id: 'offline_hello-vip.myshopify.com',
//     shop: 'hello-vip.myshopify.com',
//     state: '043922437945507',
//     isOnline: false,
//     accessToken: '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',
//     scope: 'read_products,read_orders'
//   }
  