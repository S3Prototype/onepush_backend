const express = require('express')
const router = express.Router()
const blogHandler = require('./blogHandler')

// /api/write/
router.post('/', async function (req, res) {
    // console.log("Bdoy received for write blogs: ", req.body)

    const messages = blogHandler.dispatchRequests(req)

    res.send(JSON.stringify({
      messages: messages[0],
      done: "Yup, we're done."
    }))
})

module.exports = router