const { string, bool } = require("joi");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const recruiterSchema = new mongoose.Schema({
  isAudited: {
    type: Boolean,
    required: true,
  },
  companyname: {
    type: String,
    required: true,
  },
  natureofbusiness: {
    type: String,
    required: true,
  },
  websitelink: {
    type: String,
    required: true,
  },
  postaladdress: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  hrname: {
    type: String,
    required: true,
  },
  hrdesignation: {
    type: String,
    required: true,
  },
  hrofficeaddress: {
    type: String,
    required: true,
  },
  hrmobileno: {
    type: Number,
    required: true,
  },
  althrmobileno: {
    type: Number,

    required: true,
  },
  hremail: {
    type: String,
    required: true,
  },
  pocname: {
    type: String,
    required: true,
  },
  pocdesignation: {
    type: String,
    required: true,
  },
  pocofficeaddress: {
    type: String,
    required: true,
  },
  pocmobileno: {
    type: Number,
    required: true,
  },
  altpocmobileno: {
    type: Number,

    required: true,
  },
  pocemail: {
    type: String,
    required: true,
  },
  jobtype: {
    type: String,
    required: true,
  },
  jobdesignation: {
    type: String,
    required: true,
  },
  sector: {
    type: String,
    required: true,
  },
  tentativenoofhires: {
    type: Number,

    required: true,
  },
  tentativejoblocation: {
    type: String,
    required: true,
  },
  JobDescription: {
    type: String,
    required: true,
  },
  MTechCS: {
    type: String,
    required: true,
  },
  MScCS: {
    type: String,
    required: true,
  },
  MScDFIS: {
    type: String,
    required: true,
  },
  MTechADSAI: {
    type: String,
    required: true,
  },
  categorycompensation: {
    type: String,
    required: true,
  },
  isvirtual: {
    type: String,
    required: true,
  },
});
const Recruiter = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiter;
