const express = require("express");
const router = express.Router({ mergeParams: true });
const communityController = require("../controllers/community");

router.route("/student").get(communityController.showStudentCommunity);

module.exports = router;
