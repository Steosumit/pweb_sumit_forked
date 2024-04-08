const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const verifiedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const VerifiedUser = mongoose.model("VerifiedUser", verifiedUserSchema);

module.exports = VerifiedUser;
