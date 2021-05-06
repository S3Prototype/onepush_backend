const express = require('express')
const router = express.Router() 
const blogHandler = require('./blogHandler')

// /api/write/
router.post('/', async function (req, res) {
    // console.log("Bdoy received for write blogs: ", req.body)

    let writeResult
    try{
      writeResult = await blogHandler.dispatchRequests(req)
    } catch(err){
      writeResult = {message: 'Error', data: err}
    }

    console.log(writeResult)
    res.set({
      'Content-Type': 'application/json',
    }).json(writeResult)
})

module.exports = router