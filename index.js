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
];
const passport = require('passport');
// require('./passport');

const Models = require('./models.js');

const Notes = Models.Notes;
const Users = Models.User;

// Parses body of requests to JSON
bodyParser = require('body-parser');

// Genereates uniqe id
uuid = require('uuid');

const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require('express-validator');

let notes = [
  {
    id: 1,
    content: 'Jessica Drake',
  },
  {
    id: 2,
    content: 'Ben Cohen',
  },
];

//Get requests

//GET Main page
app.get('/', (req, res) => {
  res.send('Welcome to Notes API');
});

//GET Documentation
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { roote: __dirname });
});

//GET all notes of a user by user ID (including the note contents and date).
app.get('/users/notes', (req, res) => {
  res.json(notes);
});

//GET a note by note ID.
app.get('/users/notes/noteID', (req, res) => {
  res.json(userNoteById);
});

//GET a user’s info by username.
app.get('/users/:Username', (req, res) => {
  res.json(userInfoByUserName);
});

//GET a user’s info by user ID.
app.get('/users/:uaerID', (req, res) => {
  res.json(userInfoByUserID);
});

//GET a list of all users.
app.get('/users', (req, res) => {
  res.json(allUsers);
});

//POST a new user account.
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username });
  Users.create({ Username: req.body.Username, Password: hashedPassword, Email: req.body.Email });
});

//POST a new note.
app.post('/users/notes', (req, res) => {
  Users.findOneAndUpdate(
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

//Maybe I need to add a put method to update the notes, need to decide on method.

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
