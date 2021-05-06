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
const session = require('express-session')
const cookieParser = require('cookie-parser')
const e = require('express')
const store = new session.MemoryStore()

mongoose.connect(
    'mongodb+srv://RoomMaster297:30t^FQdBmHGn@cluster0.kkb5j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    },
    ()=>{
        console.log(`mongoose is connected`)
    })

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
// app.use(session({
//     secret: 'megamanx',
//     saveUninitialized: true,
//     resave: true,
//     cookie: {
//         originalMaxAge: 10000000,
//         secure: false,
//         httpOnly: false,
//     },
//     credentials: true,
//     store,
// }))
app.use(cors({
    // origin: 'http://localhost:3000',
    // credentials: true
}))

app.use((req, res, next)=>{
    // console.log("first sessionid", req.sessionID)
    next()
})

app.use('/api/write', writeHandler)
// app.use('/users', authHandler)

const authenticateToken = (req, res, next)=>{
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]
    if(!token) return res.status(401).send({info: "Log in to load up your API tokens."})

    jwt.verify(token, 'marioparty3', (err, user)=>{
        if(err) return res.status(403).send({info: "Error loading your API tokens. Please log in."})

        const foundToken = tokenContainer.find(item=>item.accessToken === token)

        if(foundToken){
            req.user = foundToken.user
            next()
        } else {
            res.status(403).send({info: "User not authenticated. Please log in."})
        }
    })
}

let tokenContainer = []
app.post('/token', (req, res)=>{
    const refreshToken = req.body.token

    if(!refreshToken)
        return res.sendStatus(401)

    if(!tokenContainer.includes(accessToken))
        return res.sendStatus(403)

    jwt.verify(refreshToken, 'metalgearsolid3', (err, user)=>{
        if(err) return res.sendStatus(403)

        const accessToken = jwt.sign({name:req.body.username}, 'marioparty3', {expiresIn: '30s'})

        res.json({accessToken})
    })
})

app.post('/users/login', (req, res)=>{

    if(!req.body.username)
        return res.send({info: 'Failed to log in. Please provide a username.'})

    User.findOne({username:req.body.username},
        async (err, userData)=>{
            if(err){
                console.log(err)
                return res.status(500).send({info: `Failed to login ${req.body.username}. Possible server error.`})
            }

            if(userData){     
                const {username, pfp, apiKeys, password} = userData
                console.log("Found user", userData)
                
                if(!await bcrypt.compare(req.body.password, password))
                    return res.send({info: "Incorrect username or password."})

                const accessToken = jwt.sign({username}, 'marioparty3', {expiresIn: '12h'})
                const refreshToken = jwt.sign(username, 'metalgearsolid3')
                console.log("JWT name:", username)
                tokenContainer.push({
                    accessToken, 
                    user:{username, pfp, apiKeys}
                })
                
                return res.status(200).send({
                    username,
                    apiKeys, //An object containing objects
                    pfp,
                    accessToken,
                    refreshToken,
                    loggedIn: true,
                    info: `Successfully logged in ${username}`,
                    success: true,
                })
            }
            return res.status(400).send({info: `Failed to login. User ${req.body.username} not found.`})
        }
    )
})

app.post('/users/register', async (req, res)=>{
    
    if(!req.body.username || !req.body.password)
        return res.send({info: 'Failed to log in. Please provide a username and password.'})

    User.findOne({username:req.body.username},
        async (err, userData)=>{
            if(err) throw err
            if(!userData){
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                try{
                    const newData = {
                        username: req.body.username,
                        password: hashedPassword,
                        apiKeys: req.body.apiKeys,
                        pfp: req.body.pfp || 'https://www.selfstir.com/wp-content/uploads/2015/11/default-user.png',                        
                    }

                    const newUser = new User(newData)
                    newUser.isNew = true
                    await newUser.save()
                    res.send({
                        info: `User ${newData.username} created`,
                        pfp: newData.pfp,
                        apiKeys: newData.apiKeys
                    })
                } catch(err){
                    console.log("Failed to save user", err)
                    res.send({info: `Failed to create ${newData.username}.`})
                }                
            } else {
                res.send({info: `User ${req.body.username} already exists`})
            }                        
        }
    )
})

app.post('/users/logout', async (req, res)=>{
    try{
        tokenContainer = tokenContainer.filter(token=>token.accessToken !== req.body.accessToken && token.username !== req.body.username)
    } catch(err){
        return res.send({info: `Failed to logout user ${req.body.username}, ${err}`})
    }

    return res.send({info: `Successfully logged out ${req.body.username}`})
})

app.get('/users/:username/', authenticateToken, (req, res)=>{
    User.findOne({username:req.user.username}, (err, data)=>{
        if(err){
            console.log("Couldn't get api keys for", req.user)
            return res.status(500).send({info:"Error searching for API Keys in database."})            
        }

        if(data){
            console.log("Found API keys for user:", req.user)
            const {apiKeys} = data
            return res.status(200).send({found:true, apiKeys})
        }
        return res.send({info: "Account not found. Please log in."})
    })
})

app.get('/', function (req, res) {
    res.send(`Onepush backend`)
}) 

var port = process.env.PORT || '2100';
app.listen(port)