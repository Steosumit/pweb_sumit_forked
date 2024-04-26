const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const router = express.Router({ mergeParams: true });
const authenticationController = require("../controllers/authentication");
const {
  shallNotAuthenticated,
  isTwoFactorDone,
  isLoginFieldsFilled,
  isPassResetEligible,
} = require("../middleware");
const wrapAsync = require("../utils/wrapasync");

router
  .route("/login-student")
  .get(shallNotAuthenticated, authenticationController.renderLoginPage)
  .post(
    // isTwoFactorDone,
    passport.authenticate("local", {
      failureRedirect: "/auth/login-student",
      failureFlash: true,
    }),
    wrapAsync(authenticationController.authenticateUser)
  );

router
  .route("/twofactorauth")
  .post(wrapAsync(authenticationController.sendTwoFactor));

router
  .route("/login-student/verifyotp")
  .get(authenticationController.renderVerifyTwoFactor);

router.route("/logout").get(authenticationController.logOutUser);

router
  .route("/otp-initialize")
  .get(
    shallNotAuthenticated,
    wrapAsync(authenticationController.renderOtpInputForm)
  );

router.route("/sendotp").post(wrapAsync(authenticationController.sendOtp));

router
  .route("/otp-verify-page")
  .get(authenticationController.renderOtpVerifyPage);

router.route("/resendotp").get(wrapAsync(authenticationController.resendOtp));

router
  .route("/otp-verify")
  .post(isLoginFieldsFilled, wrapAsync(authenticationController.verifyOtp));

router
  .route("/resetpass")
  .get(authenticationController.renderResetPass)
  .post(wrapAsync(authenticationController.sendResetPassOtp))
  .put(wrapAsync(authenticationController.verifyResetPassOtp))
  .patch(wrapAsync(authenticationController.makeResetPass));

module.exports = router;
