const router=require("express").Router()

const Booking=require("../Models/Booking")

router.post("/create",async(req,res)=>
{
    try {
        const {customerId,listingId,startDate,endDate,totalPrice}=req.body
        const newBooking=new Booking({customerId,listingId,startDate,endDate,totalPrice})
        await newBooking.save()
        res.status(200).json(newBooking)
        
    } catch (err) {
        res.status(400).json({message:"Fail to create a new Booking!" ,error:err.message})
    }

})
module.exports=router