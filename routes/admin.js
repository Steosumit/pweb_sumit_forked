const express = require("express");
const router = express.Router({ mergeParams: true });
const adminController = require("../controllers/admin");
const { isThisAdmin } = require("../middleware");
const wrapAsync = require("../utils/wrapasync");
const { storage } = require("../cloudConfig");
const multer = require("multer");
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.route("/").get(isThisAdmin, wrapAsync(adminController.showAdmin));

router
  .route("/recdetails/:recid")
  .get(isThisAdmin, wrapAsync(adminController.showRecDetails));

router
  .route("/recaudited/:recid")
  .put(isThisAdmin, wrapAsync(adminController.markRecAudit));

router
  .route("/addcompanylisting")
  .post(
    isThisAdmin,
    upload.single("jobDescriptionFile"),
    wrapAsync(adminController.addCompanyListing)
  );

router
  .route("/listingDetails/:listingId")
  .get(isThisAdmin, wrapAsync(adminController.showListingDetails));

router
  .route("/updateListing/:listingId")
  .post(isThisAdmin, wrapAsync(adminController.updateListing));
router
  .route("/removefromlisting/:listingId")
  .get(isThisAdmin, wrapAsync(adminController.removeCompanyListing));

router
  .route("/markStuAudit/:verifiedStuID")
  .get(isThisAdmin, wrapAsync(adminController.markStuAudit))
  .post(isThisAdmin, wrapAsync(adminController.markStuArrayAudit));

router
  .route("/deboard/recruiter/:recid")
  .get(isThisAdmin, wrapAsync(adminController.deboardRecruiter));
router
  .route("/deboard/student/:stuid")
  .get(isThisAdmin, wrapAsync(adminController.deboardStudent));

router
  .route("/export/student")
  .get(isThisAdmin, wrapAsync(adminController.exportAllStudentData));

router
  .route("/export/company")
  .get(isThisAdmin, wrapAsync(adminController.exportAllCompanyData));

router
  .route("/sendupdate")
  .get(isThisAdmin, adminController.renderSendUpdateForm)
  .post(isThisAdmin, wrapAsync(adminController.pushUpdateToStudents));

router
  .route("/deleteupdate/:updateId")
  .get(isThisAdmin, wrapAsync(adminController.deleteUpdate));

module.exports = router;
