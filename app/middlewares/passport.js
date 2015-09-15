let passport = require('passport')
let nodeifyit = require('nodeifyit')
require('songbird')
let LocalStrategy = require('passport-local').Strategy
let User=require('../models/user')
let util=require('util')
let FacebookStrategy = require('passport-facebook').Strategy;
let config=require('../../config/auth')
let TwitterStrategy = require('passport-twitter').Strategy;




passport.serializeUser(nodeifyit(async (user) => user._id))
    passport.deserializeUser(nodeifyit(async (id)=>{
    return await User.promise.findById(id)
     }))

  passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    // We'll need this later
    failureFlash: true
   }, nodeifyit(async (username, password) => {
     let user
     let email=username

    user=await User.promise.findOne(email)
    if(!user|| username !==user.local.email){
      return [false,{message:'Invalid email '}]
    }
   
   return user

   }, {spread: true})))


 passport.use('local-signup', new LocalStrategy({
   // Use "email" field instead of "username"
     usernameField: 'email',
     failureFlash:true,
     passReqToCallback:true
  }, nodeifyit(async (req,email, password) => {

      email = (email || '').toLowerCase()
     // Is the email taken?
     if(await User.promise.findOne({email})){
       return [false,{message:'Email is already taken'}]
     }
     
    
    let user = new User()
    user.local.email = email
    user.local.password =password
    try {
      return await user.save()
     }
     catch(e){

      console.log(util.inspect(e))
      return [false,{message:e.message}]
     }


}, {spread: true})))
   
passport.use('facebook',new FacebookStrategy({
    clientID: config.facebook.consumerKey,
    clientSecret: config.facebook.consumerSecret,
    callbackURL: config.facebook.callbackUrl
  },
  
 nodeifyit(async (username, password) => {
     let user
    user=await User.promise.findOne({email:username})
    console.log("user from db  inside facebook stategy"+user)
     
     
    if(!user|| username !==user.email){
      return [false,{message:'Invalid email '}]
    }
    if(!await user.validatePassword(password)){
      return [false,{message:'Invalid password'}]
    }
   
   return user

   }, {spread: true})))
     
    







function useExternalPassportStrategy(OauthStrategy, config, field) {
  config.passReqToCallback = true
  console.log("i am here in userexternal passport stategy")
  passport.use(new OauthStrategy(config, nodeifyit(authCB, {spread: true})))


  async function authCB(req, token, _ignored_, account) {

    console.log("async call back")
    console.log("request  user "+req.user)  

    if(req.user){//if request user exists then 
      let user=req.user
       user.facebook.id    = account.id;                  
       user.facebook.token = token;                  
       user.facebook.name  = account.displayName
       user.facebook.usernmae=account.displayName
       console.log("before saving "+user)
        return await user.save();
    }  


  
  }
}

function useExternalPassportStrategyTwitter(OauthStrategy, config, field) {
  config.passReqToCallback = true
  console.log("i am here in userexternal passport stategy")
  passport.use(new OauthStrategy(config, nodeifyit(authCB, {spread: true})))


  async function authCB(req, token,secret ,account) {

    console.log("async call back")
    console.log("request  user "+req.user)  

    if(req.user){//if request user exists then 
      let user=req.user


       user.twitter.id    = account.id;                  
       user.twitter.token = token;                  
       user.twitter.name  = account.displayName
        console.log("before saving  secret "+secret)
       user.twitter.secret=secret
       console.log("before saving "+user)
        return await user.save();
    }  
  

  
  }
}


function configure(config) {
  console.log("Configure ie being called ")
  passport.serializeUser(nodeifyit(async (user) => {
       return user._id
    }));

    passport.deserializeUser(nodeifyit(async (id) => {
        return await User.promise.findById(id);
    }));
   useExternalPassportStrategy(FacebookStrategy, {
        clientID: config.facebook.consumerKey,
        clientSecret: config.facebook.consumerSecret,
        callbackURL: config.facebook.callbackUrl
    }, 'facebook')

useExternalPassportStrategyTwitter(TwitterStrategy, {
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,

        callbackURL: config.twitter.callbackUrl
    }, 'twitter')

   

  return passport
}

module.exports = {passport, configure}
