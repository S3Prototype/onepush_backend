const express = require('express')
const app = express()
const writeHandler = require('./writeHandler')
const authHandler = require('./authHandler')
const cors = require('cors')
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const User = require('./schemas/user')
const jwt = require('jsonwebtoken')

mongoose.connect(
    'mongodb+srv://RoomMaster297:21bOqE5aX7Du@cluster0.kkb5j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    },
    ()=>{
        console.log(`mongoose is connected`)
    })

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use('/api/write', writeHandler)
// app.use('/users', authHandler)

const authenticateToken = (req, res, next)=>{
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]
    if(!token) return res.sendStatus(401)

    jwt.verify(token, 'marioparty3', (err, user)=>{
        if(err) return res.sendStatus(403)

        req.user = user
        next()
    })
}
const refreshTokensContainer = []
app.post('/token', (req, res)=>{
    const refreshToken = req.body.token

    if(!refreshToken)
        return res.sendStatus(401)

    if(!refreshTokensContainer.includes(refreshToken))
        return res.sendStatus(403)

    jwt.verify(refreshToken, 'metalgearsolid3', (err, user)=>{
        if(err) return res.sendStatus(403)

        const accessToken = jwt.sign({name:req.body.username}, 'marioparty3', {expiresIn: '30s'})

        res.json({accessToken})
    })
})

app.post('/users/login', (req, res)=>{
    const username = req.body.username
    user = {name: username}
    const accessToken = jwt.sign(user, 'marioparty3', {expiresIn: '30s'})
    const refreshToken = jwt.sign(user, 'metalgearsolid3')
    console.log("Name", user.name)
    refreshTokensContainer.push(refreshToken)
    res.json({accessToken, refreshToken})
})

app.post('/users/register', async (req, res)=>{
    console.log('register user is ', req.user)
    User.findOne({username:req.body.username},
        async (err, userData)=>{
            if(err) throw err
            if(!userData){
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                try{
                    const newData = {
                        username:req.body.username,
                        password:hashedPassword,
                    }
                    const newUser = new User(newData)
                    await newUser.save()
                    res.send({info: `User created, ${newData.username} ${newData.password}`})
                } catch(err){
                    console.log("Failed to save user", err)
                }                
            } else {
                res.send({info: "User already exists"})
            }                        
        })
})

app.get('/users/', authenticateToken, (req, res)=>{
    console.log('/user/ user is', req.user)
    res.send(user)
})

app.get('/users/:username', (req, res)=>{
    console.log("User is", req.user)
    User.findOne({username: req.params.username}, (err, userData)=>{
            if(err){
                console.log('Error searching for user.', err)
                return res.send({info: 'Failed searching for user'})
            }

            if(userData) res.send({info: `Found ${userData.username}`})
            else res.send({info: `User not found.`})
    })
})

// ? Below was used for testing purposes
// app.post('/api/write', (req, res)=>{
//     console.log("Success!")
// })

app.get('/', function (req, res) {
    res.send(`Onepush backend`)
}) 
// console.log('Port is', process.env.PORT)
// var port = process.env.PORT || '0.0.0.0';
var port = process.env.PORT || '2100';
app.listen(port)