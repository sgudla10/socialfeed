let isLoggedIn = require('./middlewares/isLoggedIn')
let posts=require('../data/data')
let Twitter=require('twitter')
let then = require('express-then')
let config=require('../config/auth')


module.exports = (app) => {
    let passport = app.passport
    let scope = 'email'


    app.get('/', (req, res) => res.render('index.ejs'))

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    })

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

   	app.post('/login',passport.authenticate('local', {
    	successRedirect: '/profile',
    	failureRedirect: '/login',
    	failureFlash: true
    	}))



    app.get('/login', (req, res) => {
        res.render('login.ejs', {message: req.flash('error')})
    })

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error') })
    })
    app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
   }))



   // Authentication route & Callback URL
	app.get('/auth/facebook', passport.authenticate('facebook', {scope}))

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  	  successRedirect: '/profile',
  	  failureRedirect: '/profile',
   	 failureFlash: true
	}))

	// Authorization route & Callback URL
	app.get('/connect/facebook', passport.authorize('facebook', {scope}))
	app.get('/connect/facebook/callback', passport.authorize('facebook', {
    	successRedirect: '/profile',
    	failureRedirect: '/profile',
    	failureFlash: true
	}))


	// Authentication route & Callback URL
	app.get('/auth/twitter', passport.authenticate('twitter', {scope}))

	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  	  successRedirect: '/profile',
  	  failureRedirect: '/profile',
   	 failureFlash: true
	}))

	// Authorization route & Callback URL
	app.get('/connect/twitter', passport.authorize('twitter', {scope}))

	app.get('/connect/twitter/callback', passport.authorize('twitter', {
    	successRedirect: '/profile',
    	failureRedirect: '/profile',
    	failureFlash: true
	}))


	app.get('/timeline',isLoggedIn, then(async(req, res) => {
     try {
		let twitterClient=new Twitter({
			
			consumer_key:config.twitter.consumerKey,
			consumer_secret:config.twitter.consumerSecret,
			access_token_key:req.user.twitter.token,
			access_token_secret:req.user.twitter.secret,


		})
      console.log("beofre calling the service ")
      console.log(req.user.twitter.token)
	  console.log(req.user.twitter.secret)
	  console.log(config.twitter.consumerKey)
	  console.log(config.twitter.consumerSecret)



 let [tweets] = await twitterClient.promise.get('/statuses/home_timeline');	 

 tweets.map(tweet=>{
	 	return {

	 		id:tweet.id,
	 		id_str:tweet.id_str,
	 		image:tweet.user.profile_image_url,
	 		text:tweet.text,
	 		name:tweet.user.name,
	 		username:'@'+tweet.user.screen_name,
	 		liked:tweet.favorited
	 	}
	 })

 console.log(tweets[0].id_str)

		 res.render('timeline.ejs', {
		 	posts:tweets
		 }

		 	)
    
  }catch(e)
{
	console.log(e)
}


    }))


app.get('/compose', (req, res) => {
        res.render('compose.ejs',{
        	message:req.flash('error')
        })
    })


app.get('/reply/:id',isLoggedIn,then(async(req,res)=>{
	let id=req.params.id
	console.log("the id is "+id)
    let twitterClient=new Twitter({
			
			consumer_key:config.twitter.consumerKey,
			consumer_secret:config.twitter.consumerSecret,
			access_token_key:req.user.twitter.token,
			access_token_secret:req.user.twitter.secret,


		 })
     let [tweet]= await twitterClient.promise.get('/statuses/show',{id})
     let post = {
                id : tweet.id_str,
                image: tweet.user.profile_image_url,
                text: tweet.text,
                name: tweet.user.name,
                username: '@'+tweet.user.screen_name,
                liked: tweet.favorited,
               
        }
        res.render('replies.ejs', {
            message: req.flash('error'),
            post: post
        })
     
     

}))


app.post('/reply/:id',isLoggedIn,then(async(req,res)=>{
	let id=req.params.id
	let reply=req.body.reply
	console.log("the id is "+id)
	console.log("the post is  "+reply)
    let twitterClient=new Twitter({
			
			consumer_key:config.twitter.consumerKey,
			consumer_secret:config.twitter.consumerSecret,
			access_token_key:req.user.twitter.token,
			access_token_secret:req.user.twitter.secret,

	})

    await twitterClient.promise.post('/statuses/update', {
            status : reply,
            in_reply_to_status_id: id
        });
        res.redirect('/timeline')
     
     

}))



app.post('/compose',then(async(req, res) => {
        
let twitterClient=new Twitter({
			
			consumer_key:config.twitter.consumerKey,
			consumer_secret:config.twitter.consumerSecret,
			access_token_key:req.user.twitter.token,
			access_token_secret:req.user.twitter.secret,


		})
        let text=req.body.reply

        console.log("printing the test" +text)
        if(text.length >  140){
        	return req.flash('error','Status is over 140 of length')
        }
        if(!text){
        	    return req.flash('error','Status can not be empty')

        }
        let status=text;

      await twitterClient.promise.post('/statuses/update',{status})

      res.redirect('/timeline')
    }))

  app.post('/like/:id',isLoggedIn,then(async(req,res)=>{
  	  try {
		let id=req.params.id
  	   console.log("id is "+id)
	   let twitterClient=new Twitter({
		consumer_key:config.twitter.consumerKey,
			consumer_secret:config.twitter.consumerSecret,
			access_token_key:req.user.twitter.token,
			access_token_secret:req.user.twitter.secret,


		})
	   await twitterClient.promise.post('/favorites/create',{id})
	   res.end()
	}
	catch(e){
		console.log(e)
	}
	
}))


 app.post('/unlike/:id',isLoggedIn,then(async(req,res)=>{
  	   let id=req.params.id

	   let twitterClient=new Twitter({
			
			consumer_key:config.twitter.consumerKey,
			consumer_secret:config.twitter.consumerSecret,
			access_token_key:req.user.twitter.token,
			access_token_secret:req.user.twitter.secret,


		})
	   await twitterClient.promise.post('/favorites/destroy',{id})
	   res.end()
}))












}
