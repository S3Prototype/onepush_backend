const express = require('express')
const app = express()
const imagesHandler = require('./imagesHandler')
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer')
const upload = multer({dest: '/saved_images'})
const writeHandler = require('./write')
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/api/images', imagesHandler)

app.use('/api/write', writeHandler)

app.get('/', function (req, res) {
    res.send('Hello World')
}) 
var port = process.env.PORT || '0.0.0.0';
app.listen(port)

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