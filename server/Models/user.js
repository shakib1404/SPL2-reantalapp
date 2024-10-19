const mongoose =require("mongoose")

const userSchema= new mongoose.Schema({

    firstname: {
        type:String,
        required:true
    },
    lastname: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique: true
    },
    password: {
        type:String,
        required:true
    },
    profileimagePath: {
        type:String,
        default: "",
    },
    tripList: {
        type: Array,
        default:[],
    },
    wishList: {
        type: Array,
        default:[],
    },
    propertyList: {
        type: Array,
        default:[],
    },
    reservationList: {
        type: Array,
        default:[],
    }

},{timestamps: true})

const User=mongoose.model("User",userSchema)
module.exports=User