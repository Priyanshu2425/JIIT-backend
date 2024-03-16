const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then((data)=>{
    console.log('CONNECTED TO MONGODB SERVER');
}).catch((err)=>{
    console.log('Error connecting to mongodb');
    console.log(err);
})

const UserSchema = mongoose.Schema({
    'email': String,
    'password': String,
    'events_hosted': [],
    'events_subscribed': []
}) 

const EventsSchema = mongoose.Schema({
    'eventName': String,
    'eventOwner': UserSchema,
    'nodes': [],
    'map': []
})

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventsSchema);

module.exports = {
    User,
    Event
}