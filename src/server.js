const express = require('express')
const app = express()
const imagesHandler = require('./imagesHandler')
const bodyParser = require('body-parser')
const fs = require('fs');


app.use(bodyParser.urlencoded({extended:true}))
app.use('/api/images', imagesHandler);

app.get('/', function (req, res) {
    res.send('Hello World')
}) 
app.listen(2100)

// const http = require('http');

// // const hostname = 'localhost';
// const port = 2100;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });