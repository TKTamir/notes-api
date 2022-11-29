const jwtSecret = 'your_jwt_secret'; // jwtSecret which was defined in passport.js

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Require passport.js file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // The username that is being encoded in the JWT
    expiresIn: '7d', // The token expires in 7 days
    algorithm: 'HS256', // The algorithm which is used to encode the values of JWT
  });
};

/* POST login endpoint */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
