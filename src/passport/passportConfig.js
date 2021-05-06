const User = require('../schemas/user')
const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy


module.exports = function(passport){

    const authenticate = (username, password, done)=>{
        User.findOne({username}, (err, user)=>{            
            if(!user) return done(null, false, {message: "No user with that username"})
            
            bcrypt.compare(password, user.password, (err, success) => {
                if(err) return done(err)
                if(success)
                    return done(null, user)
                
                return done(null, false, {message: 'Password incorrect'})                
            })

        })
    }
    passport.use(new localStrategy({usernameField: 'username'}, authenticate))

    passport.serializeUser((user, done)=>{
        console.log("serialize is")
        done(null, user.id)
    })

    passport.deserializeUser((id, done)=>{
        console.log("Deserialize is")
        User.findOne({_id: id}, (err, user)=>{            
            done(err, {username: user.username})
        })
    })
}