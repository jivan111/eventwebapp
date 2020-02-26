const mongoose=require("mongoose")

const localUrl="mongodb://localhost:27017/Eventdb"
mongoose.connect(localUrl,{useNewUrlParser:true,useUnifiedTopology: true } )
const Schema =mongoose.Schema;
const eventSchema=new Schema({
    name:{
        type:String,
        required:true
    },
   
    lastDateRegisteration:{
        type:String,
        required:true
    }
})

const eventModel=mongoose.model("eventName",eventSchema)
const userSchema=new Schema({

    name:{
        type:String,
        required:true
    },
    username:{
        type:"String",
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const userModel=mongoose.model("user",userSchema)
module.exports={
    eventModel:eventModel,
    userModel:userModel}





