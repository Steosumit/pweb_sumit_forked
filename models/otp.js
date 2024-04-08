const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: Number, required: true },
  expirationTime: { type: Date, default: () => Date.now() + 10 * 60 * 1000 },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
