const express = require("express");
const router = express.Router({ mergeParams: true });
const registrationController = require("../controllers/registration");
const wrapAsync = require("../utils/wrapasync");
const { shallNotAuthenticated, isVerified } = require("../middleware");
const { storage } = require("../cloudConfig");

const multer = require("multer");
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router
  .route("/")
  .get(
    shallNotAuthenticated,
    isVerified,
    wrapAsync(registrationController.renderRegistrationForm)
  )
  .post(
    shallNotAuthenticated,
    isVerified,
    upload.fields([
      { name: "tenthmarksheet", maxCount: 1 },
      { name: "twelthmarksheet", maxCount: 1 },
      { name: "attachedFile", maxCount: 1 },
    ]),
    wrapAsync(registrationController.registerTheUser)
  );

module.exports = router;
