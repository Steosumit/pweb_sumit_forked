const nodemailer = require("nodemailer");
const Student = require("../models/student");
const VerifiedUser = require("../models/verifiedUser");
const OTP = require("../models/otp");

module.exports.renderLoginPage = (req, res) => {
  // let reCaptchaClientKey = process.env.CAPTCHACLIENTKEY;
  res.render("auth/loginstu.ejs");
};

module.exports.sendTwoFactor = async (req, res) => {
  let { username, password } = req.body;
  let stuDetails = await Student.findOne({ username: username });
  if (stuDetails == undefined) {
    req.flash("error", "Please Enter Correct Username/Password !");
    res.redirect("/auth/login-student");
  }

  let newOtp = Math.floor(Math.random() * 900000) + 100000;
  await OTP.deleteMany({ email: stuDetails.email });
  await OTP.insertMany({
    email: stuDetails.email,
    code: newOtp,
  });
  message = `<p style="color: red;">Hey Dear Fellow NFSUian !</p>
    <br/>
We have received a request to OTP Verification associated with your account. If you did not make this request, you can safely ignore this email.
<br/><br/>
To Verify your Email, please Insert the <strong>Following OTP</strong>:
<br/><br/>
<h1>
<strong>${newOtp}</strong></h1>
<br/>
    <br/><br/>
 Please verify your Email as soon as possible.
 <br/><br/>
<strong>Thank you,</strong><br/>
<p style="color: red;">The Placement Team .</p>
<br/>
<div>
<img
      src="https://res.cloudinary.com/ddxv0iwcs/image/upload/v1710502741/emblem_e7gmxn.png"
      style="border-radius:2rem;width:60%;"
      alt="..."
    />
</div>`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "smile.itsadil@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: "ThePlacementCell@NFSU<smile.itsadil@gmail.com>",
    to: stuDetails.email,
    subject: "2 Factor Authentication Request",
    html: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send OTP");
    } else {
      req.flash("success", "OTP sent successfully");
      req.session.bodyData = req.body;
      req.session.bodyData.email = stuDetails.email;
      res.redirect(`/auth/login-student/verifyotp`);
    }
  });
};

module.exports.renderVerifyTwoFactor = (req, res) => {
  res.render("auth/twofactorverify.ejs", {
    email: req.session.bodyData.email,
    username: req.session.bodyData.username,
    password: req.session.bodyData.password,
  });
};

module.exports.authenticateUser = async (req, res) => {
  if (
    req.body.username == process.env.ADMIN_USERNAME &&
    req.body.password == process.env.ADMIN_PASS
  ) {
    res.locals.isAdmin = true;
    res.redirect("/admin");
  } else {
    //send the user back if captcha not done
    // const postData = {
    //   secret: process.env.CAPTCHASECRET,
    //   response: req.body["g-recaptcha-response"],
    // };

    // let captchaValidationResponse = await axios
    //   .post("https://www.google.com/recaptcha/api/siteverify", postData)
    //   .then((response) => {
    //     // console.log("Response:", response.data);
    //   })
    //   .catch((error) => {
    //     console.error("Error in response:", error);
    //   });

    req.flash("success", "Welcome to The Placement Cell !");
    res.redirect("/account");
  }
};

module.exports.logOutUser = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      req.flash("error", "Error Logging out :: ", err.message);
      return next(err);
    }

    res.redirect("/");
  });
};

module.exports.renderOtpInputForm = async (req, res) => {
  req.session.username = req.query.username;
  res.render("auth/otpinit.ejs", { username: req.session.username });
};

module.exports.sendOtp = async (req, res) => {
  let { email, username } = req.body;
  let existingOTP = await OTP.findOne({ email: email });
  let newOtp = Math.floor(Math.random() * 900000) + 100000;

  // if (username == "Student") {
  //   if (
  //     !email.trim().endsWith("@nfsu.ac.in")
  //     // !email.includes("mtcs12325") ||
  //     // !email.includes("dfis12325") ||
  //     // !email.includes("mscs12325") ||
  //     // !email.includes("mtadsai12325")
  //   ) {
  //     req.flash(
  //       "error",
  //       "Please Enter a valid College Student Email of SCSDF."
  //     );
  //     res.redirect("/otp-initialize/?username=Student");
  //   }
  // }
  if (existingOTP) {
    req.flash("success", "OTP is already Sent");
    req.session.bodyData = req.body;
    res.redirect(`/auth/otp-verify-page`);
  } else {
    await OTP.insertMany({
      email: email,
      code: newOtp,
    });
    let message = "";
    if (req.session.username == "Student") {
      message = `<p style="color: red;">Hey Dear Fellow NFSUian !</p>`;
    } else {
      message = `<p style="color: red;">Dear Respected Recruiter,</p>`;
    }

    message =
      message +
      `
<br/>
We have received a request to OTP Verification associated with your account. If you did not make this request, you can safely ignore this email.
<br/><br/>
To Verify your Email, please Insert the <strong>Following OTP</strong>:
<br/><br/>
<h1>
<strong>${newOtp}</strong></h1>
<br/>
You can paste the above OTP in the <strong>Following Link</strong>:
<br/><br/>
<a href="https://placementcellnfsu.onrender.com/otp-verify-page" >https://placementcellnfsu.onrender.com/otp-verify-page</a>
<br/><br/>
 If clicking the link doesn't work, you can copy and paste it into your browser's address bar.
 <br/><br/>
 Please verify your Email as soon as possible.
 <br/><br/>
<strong>Thank you,</strong><br/>
<p style="color: red;">The Placement Team .</p>
<br/>
<div>
<img
      src="https://res.cloudinary.com/ddxv0iwcs/image/upload/v1710502741/emblem_e7gmxn.png"
      style="border-radius:2rem;width:60%;"
      alt="..."
    />
</div>`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "smile.itsadil@gmail.com",
        pass: process.env.APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: "ThePlacementCell@NFSU<smile.itsadil@gmail.com>",
      to: email,
      subject: "OTP Verification Request",
      html: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Failed to send OTP");
      } else {
        req.flash("success", "OTP sent successfully");
        req.session.bodyData = req.body;
        res.redirect(`/auth/otp-verify-page`);
      }
    });
  }
};

module.exports.renderOtpVerifyPage = (req, res) => {
  res.render("auth/otpverify.ejs", {
    email: req.session.bodyData.email,
    username: req.session.bodyData.username,
  });
};

module.exports.resendOtp = async (req, res) => {
  let { email, username } = req.query;
  try {
    await OTP.deleteMany({ email: email });
  } catch (e) {
    req.flash("error", e.message);
  }
  res.redirect(`/auth/otp-initialize/?username=${username}`);
};

module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpDocument = await OTP.findOne({ email: email });
  if (otpDocument) {
    // Compare OTP codes
    if (otp == otpDocument.code) {
      // Check if OTP has expired
      const expirationTime = otpDocument.expirationTime;
      const currentTime = new Date().getTime();

      if (expirationTime >= currentTime) {
        // Delete the OTP document
        await OTP.deleteMany({ email: email });

        // OTP verification successful
        await VerifiedUser.insertMany({
          bodyData: req.session.bodyData,
        });
        if (req.session.bodyData.username == "Student") {
          req.flash(
            "success",
            `Email Verification Successfull ! <br> We will send Your Credentials on the Provided Email. <br> Please wait for further Email Updates on approval of the Admin.`
          );
          res.redirect("/");
        } else {
          res.redirect("/register/rec");
        }
      } else {
        // OTP has expired
        await OTP.deleteMany({ email: email });
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please Re-Request the OTP.",
        });
      }
    } else {
      // OTP codes do not match
      req.flash("error", "Invalid OTP Entered.");
      res.redirect("/auth/otp-verify-page");
    }
  } else {
    // No OTP document found for the provided email
    return res.status(404).json({
      success: false,
      message: "No OTP found for the provided email.",
    });
  }
};
