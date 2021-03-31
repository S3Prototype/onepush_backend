const express = require('express')
const app = express()
const writeHandler = require('./write')
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use('/api/write', writeHandler)

app.get('/', function (req, res) {
    res.send('Hello World')
}) 
// console.log('Port is', process.env.PORT)
// var port = process.env.PORT || '0.0.0.0';
var port = process.env.PORT || '2100';
app.listen(port)