const express = require("express");
const router = express.Router({ mergeParams: true });
const accountController = require("../controllers/account");
const wrapAsync = require("../utils/wrapasync");
const { isLoggedIn } = require("../middleware");
const { storage, cloudinary } = require("../cloudConfig");

const multer = require("multer");
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
router.route("/").get(isLoggedIn, wrapAsync(accountController.showAccount));

router
  .route("/sturegisdetails")
  .get(isLoggedIn, wrapAsync(accountController.showStuPlacementProfile));

router
  .route("/apply")
  .get(wrapAsync(accountController.renderApplyForm))
  .post(upload.single("resumeLink"), wrapAsync(accountController.submitApply));

module.exports = router;
