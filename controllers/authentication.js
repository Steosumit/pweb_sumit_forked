const nodemailer = require("nodemailer");
const Student = require("../models/student");
const VerifiedUser = require("../models/verifiedUser");
const OTP = require("../models/otp");
const Recruiter = require("../models/recruiter");
const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapasync");

module.exports.renderLoginPage = (req, res) => {
  // let reCaptchaClientKey = process.env.CAPTCHACLIENTKEY;
  req.session.destroy();
  res.render("auth/loginstu.ejs");
};

module.exports.sendTwoFactor = async (req, res) => {
  let { username, password } = req.body;
  let stuDetails = await Student.findOne({ username: username });
  if (!stuDetails) {
    req.flash("error", "Please Enter Correct Username/Password !");
    res.redirect("/auth/login-student");
  }

  let newOtp = Math.floor(Math.random() * 900000) + 100000;
  if (stuDetails) await OTP.deleteMany({ email: stuDetails.email });
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
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.error(error);
  //     res.status(500).send("Failed to send OTP");
  //   } else {
  //     req.session.bodyData = req.body;
  //     req.session.bodyData.email = stuDetails.email;
  //     req.flash("success", "OTP sent successfully");
  //     res.redirect(`/auth/login-student/verifyotp`);
  //   }
  // });
  transporter.sendMail(mailOptions);
  req.session.username = req.body.username;
  req.session.password = req.body.password;
  req.session.email = stuDetails.email;
  req.flash("success", "OTP sent successfully");
  res.redirect(`/auth/login-student/verifyotp`);
};

module.exports.renderVerifyTwoFactor = (req, res) => {
  res.render("auth/twofactorverify.ejs", {
    email: req.session.email,
    username: req.session.username,
    password: req.session.password,
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

//FOR REGISTRATION
module.exports.renderOtpInputForm = async (req, res) => {
  req.session.destroy();
  req.session.username = req.query.username;
  res.render("auth/otpinit.ejs", { username: req.session.username });
};

module.exports.sendOtp = async (req, res) => {
  let { email, username } = req.body;
  // if (username == "Student") {
  //   let checkExistingStudent = await Student.findOne({ email: email });
  //   if (checkExistingStudent) {
  //     req.flash("error", "Email already Registered !");
  //     res.redirect("/auth/login-student");
  //   }
  // }
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
        req.session.bodyData = req.body;
        req.flash("success", "OTP sent successfully");
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
          //   res.redirect("/register/rec");

          const newRecruiter = new Recruiter({
            isAudited: false,
            isRegistered: false,
            _id: new mongoose.Types.ObjectId(),
            companyname: req.session.bodyData.companyname,
            natureofbusiness: req.session.bodyData.natureofbusiness,
            websitelink: req.session.bodyData.websitelink,
            postaladdress: req.session.bodyData.postaladdress,
            category: req.session.bodyData.category,
            headhrname: req.session.bodyData.headhrname || "",
            headhrdesignation: req.body.headhrdesignation || "",
            headhraltmobno: req.body.headhraltmobno || "",
            headhrmobno: req.session.bodyData.headhrmobno || "",
            headhremail: req.session.bodyData.email || "",
            headhraddress: req.body.headhraddress || "",
            poc1name: req.body.poc1name || "",
            poc1designation: req.body.poc1designation || "",
            poc1altmobno: req.body.poc1altmobno || "",
            poc1mobno: req.body.poc1mobno || "",
            poc1email: req.body.poc1email || "",
            poc1address: req.body.poc1address || "",
            poc2name: req.body.poc2name || "",
            poc2designation: req.body.poc2designation || "",
            poc2altmobno: req.body.poc2altmobno || "",
            poc2mobno: req.body.poc2mobno || "",
            poc2email: req.body.poc2email || "",
            poc2address: req.body.poc2address || "",

            jobtitle: "",
            jobtype: "",
            jobdesignation: "",
            sector: "",
            tentativenoofhires: "",
            tentativejoblocation: "",
            JobDescription: "",
            checkmtechcs: "",
            checkmsccs: "",
            checkmscdfis: "",
            checkmtechadsai: "",
            basicmtechcs: "",
            pfmtechcs: "",
            hramtechcs: "",
            joiningbonusmtechcs: "",
            relocationbonusmtechcs: "",
            stocksmtechcs: "",
            takehomemtechcs: "",
            ctcmtechcs: "",
            othersmtechcs: "",
            basicmtechadsai: "",
            pfmtechadsai: "",
            hramtechadsai: "",
            joiningbonusmtechadsai: "",
            relocationbonusmtechadsai: "",
            stocksmtechadsai: "",
            takehomemtechadsai: "",
            ctcmtechadsai: "",
            othersmtechadsai: "",
            basicmsccs: "",
            pfmsccs: "",
            hramsccs: "",
            joiningbonusmsccs: "",
            relocationbonusmsccs: "",
            stocksmsccs: "",
            takehomemsccs: "",
            ctcmsccs: "",
            othersmsccs: "",
            basicmscdfis: "",
            pfmscdfis: "",
            hramscdfis: "",
            joiningbonusmscdfis: "",
            relocationbonusmscdfis: "",
            stocksmscdfis: "",
            takehomemscdfis: "",
            ctcmscdfis: "",
            othersmscdfis: "",
            CGPAmtechcs: "",
            Graduationmtechcs: "",
            twelthmtechcs: "",
            tenthmtechcs: "",
            agelimitmtechcs: "",
            CGPAmtechadsai: "",
            Graduationmtechadsai: "",
            mtechadsai12th: "",
            mtechadsai10th: "",
            agelimitmtechadsai: "",
            CGPAmsccs: "",
            Graduationmsccs: "",
            msccs12th: "",
            msccs10th: "",
            agelimitmsccs: "",
            CGPAmscdfis: "",
            Graduationmscdfis: "",
            mscdfis12th: "",
            mscdfis10th: "",
            agelimitmscdfis: "",
            internmtechcsduration: "",
            internmtechcsstipend: "",
            internmtechcsctc: "",
            internmsccsduration: "",
            internmsccsstipend: "",
            internmsccsctc: "",
            internmscdfisduration: "",
            internmscdfisstipend: "",
            internmscdfisctc: "",
            internmtechadsaiduration: "",
            internmtechadsaistipend: "",
            internmtechadsaictc: "",
            isvirtual: "",
            servicebonddetails: "",
            MedicalRequirements: "",
            selectioncriteriadetails: "",
            stagename1: "",
            stageduration1: "",
            noofrounds1: "",
            modeofstage1: "",
            otherdetails1: "",
            stagename2: "",
            stageduration2: "",
            noofrounds2: "",
            modeofstage2: "",
            otherdetails2: "",
            stagename3: "",
            stageduration3: "",
            noofrounds3: "",
            modeofstage3: "",
            otherdetails3: "",
            stagename4: "",
            stageduration4: "",
            noofrounds4: "",
            modeofstage4: "",
            otherdetails4: "",
            stagename5: "",
            stageduration5: "",
            noofrounds5: "",
            modeofstage5: "",
            otherdetails5: "",
          });

          await newRecruiter.save();

          req.flash(
            "success",
            `Email Verification Successfull ! <br> We will soon Reach out to You on Provided Details. <br> Please wait for further Email Updates on approval of the Admin.`
          );
          res.redirect("/");
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

module.exports.renderResetPass = (req, res) => {
  // req.session.resetPass = undefined;

  if (req.session.resentOtpVerified == true) {
    res.render("auth/resetpass.ejs", {
      otpSent: true,
      resentOtpVerified: true,
    });
  }
  if (req.session.resetPass != undefined)
    res.render("auth/resetpass.ejs", {
      otpSent: true,
      resentOtpVerified: false,
    });
  res.render("auth/resetpass.ejs", {
    otpSent: false,
    resentOtpVerified: false,
  });
};

module.exports.sendResetPassOtp = async (req, res) => {
  await OTP.deleteMany({ email: req.body.email });
  let newOtp = Math.floor(Math.random() * 900000) + 100000;
  await OTP.insertMany({
    email: req.body.email,
    code: newOtp,
  });
  message = `<p style="color: red;">Hey Dear Fellow NFSUian !</p>
    <br/>
We have received a request to Reset Password associated with your account. If you did not make this request, you can safely ignore this email.
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
    to: req.body.email,
    subject: "Password Reset Request",
    html: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send OTP");
    } else {
      req.session.resetPass = req.body;
      res.redirect("/auth/resetpass");
    }
  });
};

module.exports.verifyResetPassOtp = async (req, res) => {
  let result = await OTP.findOne({
    email: req.session.resetPass.email,
    code: req.body.otp,
  });

  if (result) {
    await OTP.deleteMany({ email: req.session.resetPass.email });
    req.session.resentOtpVerified = true;
    res.redirect("/auth/resetpass");
  }
  req.flash("error", "Please Enter Correct OTP.");
  res.redirect("/auth/resetpass");
};

module.exports.makeResetPass = async (req, res) => {
  if (req.session.resentOtpVerified) {
    let stu = await Student.findOne({ email: req.session.resetPass.email });

    if (stu.haveResetPass == true) {
      req.session.resentOtpVerified = false;
      req.flash("error", "Cant Reset the Password more than Once !");
      res.redirect("/auth/login-student");
    }

    stu.setPassword(
      req.body.password.trim(),
      wrapAsync(async () => {
        stu.haveResetPass = true;
        await stu.save();
      })
    );

    req.flash("success", "Password Reset Successful !");
    res.redirect("/auth/login-student");
  }
  req.flash("error", "Please Enter Correct OTP.");
  res.redirect("/auth/resetpass");
};
