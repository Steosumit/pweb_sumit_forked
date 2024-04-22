const { string, bool } = require("joi");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const recruiterSchema = new mongoose.Schema({
  isAudited: {
    type: Boolean,
    required: true,
  },
  isRegistered: { type: Boolean, required: true },
  companyname: { type: String },
  natureofbusiness: { type: String },
  websitelink: { type: String },
  postaladdress: { type: String },
  category: { type: String },
  selectposition: { type: String },
  headhrname: { type: String },
  headhrdesignation: { type: String },
  headhrmobno: { type: String },
  headhraltmobno: { type: String },
  headhremail: { type: String },
  headhraddress: { type: String },
  poc1name: { type: String },
  poc1designation: { type: String },
  poc1mobno: { type: String },
  poc1altmobno: { type: String },
  poc1email: { type: String },
  poc1address: { type: String },
  poc2name: { type: String },
  poc2designation: { type: String },
  poc2mobno: { type: String },
  poc2altmobno: { type: String },
  poc2email: { type: String },
  poc2address: { type: String },
  jobtitle: { type: String },
  jobtype: { type: String },
  jobdesignation: { type: String },
  sector: { type: String },
  tentativenoofhires: { type: String },
  tentativejoblocation: { type: String },
  JobDescription: { type: String },
  basicmtechcs: { type: String },
  pfmtechcs: { type: String },
  hramtechcs: { type: String },
  joiningbonusmtechcs: { type: String },
  relocationbonusmtechcs: { type: String },
  stocksmtechcs: { type: String },
  takehomemtechcs: { type: String },
  ctcmtechcs: { type: String },
  othersmtechcs: { type: String },
  basicmtechadsai: { type: String },
  pfmtechadsai: { type: String },
  hramtechadsai: { type: String },
  joiningbonusmtechadsai: { type: String },
  relocationbonusmtechadsai: { type: String },
  stocksmtechadsai: { type: String },
  takehomemtechadsai: { type: String },
  ctcmtechadsai: { type: String },
  othersmtechadsai: { type: String },
  basicmsccs: { type: String },
  pfmsccs: { type: String },
  hramsccs: { type: String },
  joiningbonusmsccs: { type: String },
  relocationbonusmsccs: { type: String },
  stocksmsccs: { type: String },
  takehomemsccs: { type: String },
  ctcmsccs: { type: String },
  othersmsccs: { type: String },
  basicmscdfis: { type: String },
  pfmscdfis: { type: String },
  hramscdfis: { type: String },
  joiningbonusmscdfis: { type: String },
  relocationbonusmscdfis: { type: String },
  stocksmscdfis: { type: String },
  takehomemscdfis: { type: String },
  ctcmscdfis: { type: String },
  othersmscdfis: { type: String },
  CGPAmtechcs: { type: String },
  Graduationmtechcs: { type: String },
  twelthmtechcs: { type: String },
  tenthmtechcs: { type: String },
  agelimitmtechcs: { type: String },
  CGPAmtechadsai: { type: String },
  Graduationmtechadsai: { type: String },
  mtechadsai12th: { type: String },
  mtechadsai10th: { type: String },
  agelimitmtechadsai: { type: String },
  CGPAmsccs: { type: String },
  Graduationmsccs: { type: String },
  msccs12th: { type: String },
  msccs10th: { type: String },
  agelimitmsccs: { type: String },
  CGPAmscdfis: { type: String },
  Graduationmscdfis: { type: String },
  mscdfis12th: { type: String },
  mscdfis10th: { type: String },
  agelimitmscdfis: { type: String },
  internmtechcsduration: { type: String },
  internmtechcsstipend: { type: String },
  internmtechcsctc: { type: String },
  internmsccsduration: { type: String },
  internmsccsstipend: { type: String },
  internmsccsctc: { type: String },
  internmscdfisduration: { type: String },
  internmscdfisstipend: { type: String },
  internmscdfisctc: { type: String },
  internmtechadsaiduration: { type: String },
  internmtechadsaistipend: { type: String },
  internmtechadsaictc: { type: String },
  isvirtual: { type: String },
  servicebonddetails: { type: String },
  MedicalRequirements: { type: String },
  selectioncriteriadetails: { type: String },
  stagename1: { type: String },
  stageduration1: { type: String },
  noofrounds1: { type: String },
  modeofstage1: { type: String },
  otherdetails1: { type: String },
  stagename2: { type: String },
  stageduration2: { type: String },
  noofrounds2: { type: String },
  modeofstage2: { type: String },
  otherdetails2: { type: String },
  stagename3: { type: String },
  stageduration3: { type: String },
  noofrounds3: { type: String },
  modeofstage3: { type: String },
  otherdetails3: { type: String },
  stagename4: { type: String },
  stageduration4: { type: String },
  noofrounds4: { type: String },
  modeofstage4: { type: String },
  otherdetails4: { type: String },
  stagename5: { type: String },
  stageduration5: { type: String },
  noofrounds5: { type: String },
  modeofstage5: { type: String },
  otherdetails5: { type: String },
  checkmtechcs: {
    type: String,
  },
  checkmsccs: {
    type: String,
  },
  checkmscdfis: {
    type: String,
  },
  checkmtechadsai: {
    type: String,
  },
});
const Recruiter = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiter;
