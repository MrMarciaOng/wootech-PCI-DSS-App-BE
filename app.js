const express = require('express')
const app = express()
const port = 3000
const storage = require('node-persist');

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/payment', async(req, res) => {
    let authenticationKey = Math.floor(100000 + Math.random() * 900000);
    await storage.init({
        dir: './localstorage',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        //logging: false,  // can also be custom logging function
        //ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS or a valid Javascript Date object
        expiredInterval: 1 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
        forgiveParseErrors: false
    });
    await storage.setItem('authKey', authenticationKey);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))