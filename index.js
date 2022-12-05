const express = require('express');
const app = express();

path = require('path');

// Controls allowed origins
const cors = require('cors');

let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://localhost:4200',
  'https://tktamir.github.io',
  'https://https//notesapi.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application does not allow access from origin ' + origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const Models = require('./models.js');

const Notes = Models.Note;
const Users = Models.User;

// Parses body of requests to JSON
bodyParser = require('body-parser');

// Genereates uniqe id
uuid = require('uuid');

const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require('express-validator');

mongoose.connect('mongodb://localhost:27017/notesapi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//Get requests

//GET Main page
app.get('/', (req, res) => {
  res.send('Welcome to Notes API');
});

//GET Documentation
app.get('/documentation', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/documentation.html'));
});

//GET all notes of a user by user ID (including the note contents and date).
app.get('/users/:Username/notes', passport.authenticate('jwt', { session: false }), (req, res) => {
  Notes.find()
    .then((notes) => {
      res.status(200).json(notes);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a note by note ID.
app.get(
  '/users/:Username/notes/noteID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Notes.findOne({ _id: req.params._id })
      .then((note) => {
        res.status(200).json(note);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//GET a list of all users.
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then(function (users) {
      res.status(200).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a user’s info by username.
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a user’s info by user ID.
app.get('/users/:userID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ _id: req.params._id })
    .then((user) => {
      res.json(user);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//POST Register a new user account.
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

//UPDATE-put- Update user info
app.put(
  '/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 4 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').isLength({ min: 6 }),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
        },
      },
      { new: true }, //This line make sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//POST a new note.
app.post('/users/:Username/notes', passport.authenticate('jwt', { session: false }), (req, res) => {
  Notes.findOneAndUpdate(
    { Username: req.body.Username },
    { $push: { notes: req.params.noteID } },
    { new: true } // This line makes sure that the updated document is returned
  );
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  };
});

//DELETE allow users to delete notes
app.delete(
  '/users/:Username/notes/:noteID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { notes: req.params.noteID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);
//DELETE allow users to delete their account
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(201).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Access documentation.html through express.static
app.get('/documentation', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/documentation.html'));
});

//Access Stylesheets.css
app.use(express.static(__dirname + '/public/'));

//Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
