const mongoose = require("mongoose");
const updateSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  forCourse: {
    type: [
      {
        type: String,
      },
    ],
  },
});

const Update = mongoose.model("Update", updateSchema);

module.exports = Update;
