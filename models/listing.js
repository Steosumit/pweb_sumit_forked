const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  forCourse: {
    type: [
      {
        type: String,
        enum: ["MscCs", "MscDfis", "MtechCs", "MtechAdsai", "All"],
      },
    ],
    required: true,
  },
  jobDescription: {
    type: String,
  },
  ctc: {
    type: Number,
    required: true,
  },
  lastDateToApply: {
    type: Date,
    required: true,
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
