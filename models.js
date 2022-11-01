const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Define Notes Schema
let NoteSchema = mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  LastEdited: Date,
});
//Define UserSchema
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }],
});
//Function to hash password
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
//Function to validate password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Note = mongoose.model('Note', NoteSchema);
let User = mongoose.model('User', userSchema);

module.exports.Note = Note;
module.exports.User = User;
