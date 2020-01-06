const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/payment', (req, res) => {
    let authenticationNumber = Math.floor(100000 + Math.random() * 900000);
    
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))