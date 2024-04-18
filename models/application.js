const { ref, required } = require("joi");
const mongoose = require("mongoose");
const Student = require("./student");
const Listing = require("./listing");
const applicationSchema = new mongoose.Schema({
  stuId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Student,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Listing,
  },
  resumeLink: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
