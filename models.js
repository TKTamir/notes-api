const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Define Movies Schema
let NotesSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  LastEdited: Date,
  editThisField: String,
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

let Notes = mongoose.model('Notes', NotesSchema);
let User = mongoose.model('User', userSchema);

module.exports.Notes = Notes;
module.exports.User = User;
