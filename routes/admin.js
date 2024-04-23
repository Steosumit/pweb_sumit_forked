const express = require("express");
const router = express.Router({ mergeParams: true });
const adminController = require("../controllers/admin");
const { isThisAdmin } = require("../middleware");
const wrapAsync = require("../utils/wrapasync");

router.route("/").get(isThisAdmin, wrapAsync(adminController.showAdmin));

router
  .route("/recdetails/:recid")
  .get(isThisAdmin, wrapAsync(adminController.showRecDetails));

router
  .route("/recaudited/:recid")
  .put(isThisAdmin, wrapAsync(adminController.markRecAudit));

router
  .route("/addcompanylisting")
  .post(isThisAdmin, wrapAsync(adminController.addCompanyListing));

router
  .route("/removefromlisting/:listingId")
  .get(isThisAdmin, wrapAsync(adminController.removeCompanyListing));

router
  .route("/markStuAudit/:verifiedStuID")
  .get(isThisAdmin, wrapAsync(adminController.markStuAudit));

router
  .route("/deboard/recruiter/:recid")
  .get(isThisAdmin, wrapAsync(adminController.deboardRecruiter));
router
  .route("/deboard/student/:stuid")
  .get(isThisAdmin, wrapAsync(adminController.deboardStudent));

module.exports = router;
