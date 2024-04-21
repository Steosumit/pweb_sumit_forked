const express = require("express");


const router = express.Router({ mergeParams: true });
const teamController = require("../controllers/team");

router.route("/").get(teamController.showTeam);

router.route("/contact").get(teamController.showContactPage);

module.exports = router;
