const { z } = require('zod');

// Schema for request body validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Middleware for request validation
function validateUser(req, res, next) {
    const validateUser = userSchema.safeParse(req.body);
    if(validateUser.success) next();
    else return res.status(404).json({'message': 'invalid email/password'});
}

module.exports = {
    validateUser
}
