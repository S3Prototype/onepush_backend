const express = require('express')
const router = express.Router()

// define the home page route
router.get('/', function (req, res) {
  fs.writeFile(filename, data, [encoding], [callback])
  res.send('Birds home page')
})
// // define the about route
// router.get('/about', function (req, res) {
//   res.send('About birds')
// })

module.exports = router