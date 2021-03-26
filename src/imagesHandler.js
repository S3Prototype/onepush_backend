const express = require('express')
const router = express.Router()
const fs = require('fs')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const util = require('util')
// fs.writeFile = util.promisify(fs.writeFile)

// /api/images/
router.post('/', async function (req, res) {
  console.log(req.body)
  // fs.writeFile(`./saved_images/${req.headers.name}`, req.body, (err, res)=>{
  //   err && console.log(err)
  //   res && console.log(res)
  // })
  res.send(JSON.stringify({
    result: "Yay! It worked!",
    done: "Yup, we're done."
  }))
})
// // define the about route
// router.get('/about', function (req, res) {
//   res.send('About birds')
// })

module.exports = router