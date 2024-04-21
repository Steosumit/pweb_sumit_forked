const express = require("express");
const router = express.Router({ mergeParams: true });
const resourceController = require("../controllers/resources");

router.route("/student").get(resourceController.showResourcesForStudents);

router.route("/recruiter").get(resourceController.showResourcesForRecruiters);

module.exports = router;
