const { User } = require('../db');

async function zoneAuth(req, res, next){
    const { eventId } = req.body;

    const user = await User.findOne({email: req.user_email});
    if(user.events_hosted.indexOf(eventId) < 0){
        return res.status(404).json({"message": "Unauthorized access"});
    }
    next();
}

module.exports = zoneAuth;