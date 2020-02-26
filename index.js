const express =require("express");
const bodyParser=require("body-parser")
const app=express()
const passport=require("passport")
const sessions =require("express-session")
const bcrypt=require("bcrypt")
const {eventModel,userModel}=require("./database/event")
// const methodOverride=require("method-override")
const localStrategy=require("passport-local").Strategy
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// app.use(methodOverride("_method"))
app.use(sessions({
  secret:"teri jaat ka",
  saveUninitialized:false,
  resave:false,
  cookie:{maxAge:3600000}
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(authenticateUser))








// this function is called to check credential matched  or not
async function  authenticateUser(email,password,done){
    let user=await findUser(email)
    console.log(user)
     if(user.length==0){
       console.log("no user found from localStrategy ")
      return  done(null,null,"no user found")
     }try{
     if(await bcrypt.compare(password,user[0].password)){
       console.log("compared from new localStrategy",email," ",password)
       done(null,user,"success")
     }else{
       console.log("failed to log in from localstrategy ",email," ",password)
       done(null,null,"wrong username or password")
     }
      
   }catch(e){
      done(e)
   }
   
   }
//    finding user with email
   function  findUser(username){
    return userModel.find({username:username},(err,result)=>{
           if(err)
           console.log(err)
           else{
 
             return result
           }
  })
 }
 app.get("/",ifAuthenticated,(req,res)=>{
     res.render("index")
 })
 app.get("/login",ifNotAuthenticated,(req,res)=>{
    res.render("login")
  })
  app.get("/logout",(req,res)=>{
    req.logOut()
    res.redirect("/")
  })
  app.get("/register",ifNotAuthenticated,(req,res)=>{
    res.render("register")
    
  })
  app.get("/event",ifAuthenticated,(req,res)=>{
    eventModel.find((err,result)=>{
      if(err){
        console.log("error fetching a data")
      }else{
       console.log(result)
        res.render("event",{result:result})
      }
    })
  
  })
  app.get("/registerevents",ifAuthenticated,(req,res)=>{
     res.render("createEvents")
  })
  app.post("/registerevents",(req,res)=>{
    console.log(req.body)
    eventModel.insertMany(req.body,(err)=>{
      if(err){
        console.log("error creating an events",err)
      }else{
    res.redirect("/")
      }
    })
  })
  app.post("/register",checkIfUserExist,passport.authenticate("local",{successRedirect:"/",failureRedirect:"/register"}))
  
  app.post("/login",passport.authenticate("local",{failureRedirect:"/login",successRedirect:"/"}),(req,res)=>{
    console.log(req.user,"from passport.authenticate()")
    res.redirect("/home")
  })
  passport.serializeUser((userdata,done)=>{
    console.log("from serialzeUser ",userdata)
    done(null,userdata[0]._id)
  })
  passport.deserializeUser(async(userid,done)=>{
    console.log("from deserializeUser ",userid)
  return done(null,getUserWithId(userid))
  })
  function ifAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      next()
    }else{
      res.redirect("/login")
    }
  }
  function getUserWithId(id){
    return userModel.find({_id:id},(err,result)=>{
      if(err){
        console.log(err)
      }else{
        return result;
      }
    })
  }
  function ifNotAuthenticated(req,res,next){
   if(req.isAuthenticated()){
       res.redirect("/home")
   }else{
     next()
   }
  }

// for registeration to check if username already exist 
async function checkIfUserExist(req,res,next){

    result=await findUser(req.body.username)
    console.log(result)
    if(result.length){
      res.redirect("/register")
      }else{
      
        let javascriptObj={}
        javascriptObj.username=req.body.username
        javascriptObj.name=req.body.name
        javascriptObj.password=await bcrypt.hash(req.body.password,10);
        userModel.insertMany(javascriptObj,(err)=>{
          if(err){
            res.send(err)
          }else{
            console.log(" inserted from register middleware ",req.body.password)
            next()
          }
        })
      }
  
}

 app.listen( process.env.PORT || 3000,()=>{
    console.log("3000 running")
})


