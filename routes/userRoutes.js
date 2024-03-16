const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const zod = require('zod');

const UserRouter = express.Router();
const EventRouter = require('./eventRoutes/manageEvent');
const QrRouter = require('./qrRoutes/userQR');

//db model
const { User, Event } = require('../db');

//middleware
const { validateUser } = require('../middleware/userDetailValidation');
const { authCheck } = require('../middleware/authCheck');


UserRouter.use('/event', EventRouter);
UserRouter.use('/register', QrRouter);

UserRouter.post('/signup', validateUser, async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const newUser = new User({ email, password });
  await newUser.save();

  res.status(201).json({ message: 'User created successfully' });
});


UserRouter.post('/login', async (req, res) => {
  const authHeader = req.headers['auth'];
 
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      res.json({ message: 'Login successful using auth token', 'email': decoded.email});
    });
  } else {

    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = "Bearer " + jwt.sign({ email: user.email }, process.env.JWT_SECRET);

    res.json({ token });
  }
});

UserRouter.post('/add-event', authCheck, async(req, res)=>{
    try {
        const { eventName } = req.body;
        console.log(eventName);
        const user = await User.findOne({ email: req.user_email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const event = new Event({
            eventName,
            eventOwner: user._id
        });
        await event.save();

        user.events_hosted.push(event._id);
        await user.save();

        return res.status(201).json({ message: 'Event created successfully', eventId: event._id });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' + error});
    }
});

UserRouter.get('/all-events', authCheck, async(req, res)=>{
    try{
      let all_events = await Event.find({});
      console.log(all_events);
      res.status(200).json({'message': 'success', 'data': all_events});
    }catch(error){
      res.status(404).json({'message': error});
    }
})

UserRouter.post('/subscribe', authCheck, async(req, res)=>{
    const eventId = req.body.eventId;
    const email = req.user_email;

    const user = await User.findOne({'email': email}).exec();
    user.events_subscribed.push(eventId);
    await user.save()
    
    res.json({message: "subscribed"});

})




module.exports = {
    UserRouter
}