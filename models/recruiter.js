const { string } = require("joi");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const recruiterSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  surname: {
    type: String,

    required: true,
  },
  fathername: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,

    required: true,
  },
  mobileno: {
    type: Number,
    unique: true,
    required: true,
    minlength: 10,
    maxlength: 10,
    validate: {
      validator: function (v) {
        // Validate that the mobile number consists of exactly 10 digits
        return /^\d{10}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid mobile number! Please enter exactly 10 digits.`,
    },
  },
  altmobileno: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  altemail: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  presentcountry: {
    type: String,
    required: true,
  },
  presentstate: {
    type: String,
    required: true,
  },
  presentdistrict: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  presentaddress: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  disability: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  maritalstatus: {
    type: String,
    required: true,
  },
  enrollmentNo: {
    type: Number,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
    maxlength: 6,
  },
  tenth: {
    type: Number,
    required: true,
    maxlength: 3,
  },
  twelth: {
    type: Number,
    required: true,
    maxlength: 3,
  },
  lastsemcgpa: {
    type: Number,
    required: true,
    maxlength: 3,
  },
  username: {
    type: String,
    required: true,
  },
});
const Recruiter = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiter;
