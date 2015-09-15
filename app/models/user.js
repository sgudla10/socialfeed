let mongoose = require('mongoose')
let bcrypt = require('bcrypt')


let UserSchema = mongoose.Schema({
   local: {
       email: {
      type:String,
      required:false
    },
    password: {
      type:String,
      required:false
    },
    } 
 ,

 facebook         : {
        id           : String,
        token        : String,
        username     : String,
        name         : String
    }
    ,
      twitter         : {
        id           : String,
        token        : String,
        username     : String,
        name         : String,
        secret       : String
    }

})




UserSchema.methods.generateHash= async function (password){
  return await bcrypt.promise.hash(password,8)
}


UserSchema.methods.validatePassword= async function (password){
  return await bcrypt.promise.compare(password,this.password)
}

//userSchema.methods.linkAccount = function(type, values) {
  // linkAccount('facebook', ...) => linkFacebookAccount(values)
  //return this['link'+_.capitalize(type)+'Account'](values)
//}

//userSchema.methods.linkLocalAccount = function({email, password}) {
  //throw new Error('Not Implemented.')
//}

//userSchema.methods.linkFacebookAccount = function({account, token}) {
  //throw new Error('Not Implemented.')
//}

//userSchema.methods.linkTwitterAccount = function({account, token}) {
  //throw new Error('Not Implemented.')
//}

//userSchema.methods.linkGoogleAccount = function({account, token}) {
  //throw new Error('Not Implemented.')
//}

//userSchema.methods.linkLinkedinAccount = function({account, token}) {
  //throw new Error('Not Implemented.')
//}

//userSchema.methods.unlinkAccount = function(type) {
  //throw new Error('Not Implemented.')
//}

module.exports = mongoose.model('User', UserSchema)
