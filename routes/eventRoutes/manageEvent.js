const express = require('express');
const { authCheck } = require('../../middleware/authCheck');
const EventRouter = express.Router();
const ZoneRouter = require('../zoneRoutes/zoneRoutes');
const z = require('zod');

const { User, Event } = require('../../db');

//middleware
const zoneAuth = require('../../middleware/zoneAuth');

EventRouter.use(authCheck);
EventRouter.use(zoneAuth);

EventRouter.use('/zone', ZoneRouter);
EventRouter.post('/addZone', async(req, res)=>{
    const { zoneName, eventId } = req.body;
    const zoneNameSchema = z.string().min(1);
    if(!zoneNameSchema.safeParse(zoneName).success){
        return res.status(404).json({'message': 'Zone name must be of length more than 1'});
    }

    try {
        const currEvent = await Event.findOne({ _id: eventId });

        if (!currEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        let zoneExists = currEvent.nodes.filter((item)=>{
            return Object.keys(item)[0] === zoneName;
        })
        console.log(zoneExists);
        if(zoneExists.length > 0){
            return res.status(401).json({message: 'Zone exists already'});
        }

        let zoneObj = {};
        zoneObj[zoneName] = [];
        currEvent.nodes.push(zoneObj);

        await currEvent.save();
        return res.status(200).json({message: 'Zone Added'});
    }catch(error){
        return res.status(500).json({'message': 'Internal server error'+error});
    }

})


EventRouter.delete('/deleteZone', async(req, res)=>{
    const { zoneName, eventId } = req.body;
    const zoneNameSchema = z.string().min(1);
    if(!zoneNameSchema.safeParse(zoneName).success){
        return res.status(404).json({'message': 'Zone name must be of length more than 1'});
    }

    try {
        const currEvent = await Event.findOne({ _id: eventId });
        console.log(eventId);
        if (!currEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        let nodeExists = currEvent.nodes.filter((item)=>{
            return Object.keys(item)[0] === zoneName;
        })
        
        if (nodeExists.length === 1) {
            let remainingNodes = currEvent.nodes.filter((item)=>{
                return Object.keys(item)[0] != zoneName;
            })
            currEvent.nodes = remainingNodes;
            await currEvent.save();
            return res.json({ message: 'Zone deleted successfully' });
        } else {
            return res.json({ message: 'Zone not found in the event' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error'+error });
    }
})

EventRouter.post('/addConnection', async(req, res)=>{
    const {zoneFrom, zoneTo, eventId} =  req.body;
    const zoneNameSchema = z.string().min(1);
    if(!zoneNameSchema.safeParse(zoneName).success || !zoneNameSchema.safeParse(zoneTo).success){
        return res.status(404).json({'message': 'Zone name must be of length more than 1'});
    }
    try{
        const currEvent = await Event.findOne({_id: eventId});

        if(!currEvent){
            return res.status(404).json({"message": "Event not found"});
        }

        const zoneFromIndex = currEvent.nodes.indexOf(zoneFrom);
        const zoneToIndex = currEvent.nodes.indexOf(zoneTo);
        if(zoneFromIndex < 0 || zoneToIndex < 0){
            return res.status(404).json({"message": "Zone not found"});
        }

        let obj = {};
        obj[zoneFrom] = zoneTo;
        console.log(obj);
        currEvent.map.push(obj);
        await currEvent.save();
        return res.status(200).json({'message': 'Connection Added'});
    }catch(error){
        return res.status(500).json({'message': 'Internal Server Error'+ error});
    }
})

EventRouter.delete('/deleteConnection', async(req, res)=>{
    const {zoneFrom, zoneTo, eventId} =  req.body;
    const zoneNameSchema = z.string().min(1);
    if(!zoneNameSchema.safeParse(zoneName).success || !zoneNameSchema.safeParse(zoneTo).success){
        return res.status(404).json({'message': 'Zone name must be of length more than 1'});
    }
    try{
        const currEvent = await Event.findOne({_id: eventId});

        if(!currEvent){
            return res.status(404).json({"message": "Event not found"});
        }

        const zoneFromIndex = currEvent.nodes.indexOf(zoneFrom);
        const zoneToIndex = currEvent.nodes.indexOf(zoneTo);
        if(zoneFromIndex < 0 || zoneToIndex < 0){
            return res.status(404).json({"message": "Zone not found"});
        }

        let objToDelete = {};
        objToDelete[zoneFrom] = zoneTo;
        console.log(objToDelete);
        
        let new_map = currEvent.map.filter((item)=>{
            return JSON.stringify(item) != JSON.stringify(objToDelete);
        })

        currEvent.map = new_map;
        console.log(new_map);
        await currEvent.save();
        return res.status(200).json({'message': 'Connection Deleted'});
    }catch(error){
        return res.status(500).json({'message': 'Internal Server Error'+ error});
    }
})

module.exports = EventRouter