const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const verifiedUserSchema = new mongoose.Schema({
  
  bodyData: {
    type: Object,
    required: true,
  },
});

const VerifiedUser = mongoose.model("VerifiedUser", verifiedUserSchema);

module.exports = VerifiedUser;
