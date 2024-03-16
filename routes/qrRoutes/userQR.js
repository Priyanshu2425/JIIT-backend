const { v4: uuidv4 } = require('uuid');
const express = require('express');
const QrRouter = express.Router();

//middleware
const { authCheck } = require('../../middleware/authCheck');
//dbModel
const { User, Event } = require('../../db');
QrRouter.use(authCheck);
QrRouter.post('/', async(req, res)=>{
    const { eventId } = req.body;
    try{
        const user = await User.findOne({email: req.user_email});
        
        const event = await Event.findOne({_id: eventId});
        if(!event){
            return res.status(404).json({"message": "Event not found"});
        }

        if(user.events_subscribed.indexOf(eventId) >= 0){
            return res.status(401).json({message: "Event already subscribed"});
        }

        let userRegisterObj = {};
        userRegisterObj[eventId] = uuidv4();
        userRegisterObj.location = "";

        user.events_subscribed.push(userRegisterObj);
        await user.save();
        res.status(200).json({message: "Event Registered"});
    }catch(error){
        res.status(500).json({message: "Internal Server Error" + error});
    }
})

QrRouter.get('/qr', async(req, res)=>{
    const { eventId } = req.body;
    try{
        const event = await Event.findOne({_id: eventId});
        if(!event){
            return res.status(404).json({"message": "Event not found"});
        }

        const user = await User.findOne({email: req.user_email});
        const qrcode = user.events_subscribed.filter((item)=>{
            return Object.keys(item)[0] === eventId;
        })[0]
        
        res.status(200).json({message: "Event Registered", "qrcode": qrcode[eventId]});
    }catch(error){
        res.status(500).json({message: "Internal Server Error" + error});
    }
})


module.exports = QrRouter;
