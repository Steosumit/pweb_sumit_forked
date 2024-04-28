const { string } = require("joi");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  isDeboarded: {
    type: Boolean,
    default: false,
  },
  placedCompany: {
    type: String,
    default: "",
  },
  placedCtc: {
    type: Number,
    default: -1,
  },
  placedJobLocation: {
    type: String,
    default: "",
  },
  placedJobDescription: {
    type: String,
    default: "",
  },
  placedOtherDetails: {
    type: String,
    default: "",
  },
  placedDate: {
    type: Date,
    default: Date.now,
  },
  isPlaced: {
    type: Boolean,
    default: false,
  },
  haveResetPass: {
    type: Boolean,
  },
  tenthMarksheetUrl: {
    type: String,
  },
  twelthMarksheetUrl: {
    type: String,
  },
  isAudited: {
    type: Boolean,
  },
  isRegistered: {
    type: Boolean,
  },
  course: {
    type: String,
  },
  fullname: {
    type: String,
  },

  fathername: {
    type: String,
  },
  mothername: {
    type: String,
  },
  birthdate: {
    type: Date,
  },
  mobileno: {
    type: Number,
    //
    // minlength: 10,
    // unique: true,
    // maxlength: 10,
    // validate: {
    //   validator: function (v) {
    //     // Validate that the mobile number consists of exactly 10 digits
    //     return /^\d{10}$/.test(v);
    //   },
    //   message: (props) =>
    //     `${props.value} is not a valid mobile number! Please enter exactly 10 digits.`,
    // },
  },
  altmobileno: {
    type: Number,
  },
  email: {
    type: String,
    // unique: true,
  },
  altemail: {
    type: String,
  },
  category: {
    type: String,
  },
  nationality: {
    type: String,
  },
  presentcountry: {
    type: String,
  },
  presentstate: {
    type: String,
  },
  presentdistrict: {
    type: String,
  },
  landmark: {
    type: String,
  },
  presentaddress: {
    type: String,
  },
  gender: {
    type: String,
  },
  disability: {
    type: String,
  },
  maritalstatus: {
    type: String,
  },
  enrollmentNo: {
    type: Number,
  },
  pincode: {
    type: Number,

    maxlength: 6,
  },
  tenth: {
    type: Number,

    maxlength: 3,
  },
  twelth: {
    type: Number,

    maxlength: 3,
  },
  lastsemcgpa: {
    type: Number,

    maxlength: 3,
  },
});
studentSchema.plugin(passportLocalMongoose); //above the below line
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
