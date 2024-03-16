const jwt = require('jsonwebtoken');

function authCheck(req, res, next){
    const authHeader = req.headers['auth'];

    if(authHeader && authHeader.startsWith('Bearer ')){
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                return res.status(401).json({message: 'Invalid Login Credentials'});
            }
            req.user_email = decoded.email;
            next();
        });
        
    }else{
        return res.status(401).json({message: "Invalid Login Credentials"});
    }

}

module.exports = {
    authCheck
}