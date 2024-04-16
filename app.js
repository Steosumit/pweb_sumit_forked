if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require("connect-mongo");
const wrapAsync = require("./utils/wrapasync");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const nodemailer = require("nodemailer");
const Student = require("./models/student");
const { studentSchema, recruiterSchema } = require("./schema");
const Recruiter = require("./models/recruiter");
const VerifiedUser = require("./models/verifiedUser");
const OTP = require("./models/otp");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in Mongo Session Store ", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

main()
  .then(() => {
    console.log("Connected To db");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
}

//middlewares
let isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true;
    res.locals.isAdmin = req.user.username == process.env.ADMIN_USERNAME;
  } else {
    res.locals.isAuthenticated = false;
    res.locals.isAdmin = false;
  }
  next();
};

let isLoggedIn = wrapAsync(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first !");
    res.redirect("/");
  } else {
    return next();
  }
});

let shallNotAuthenticated = wrapAsync(async (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You Must Log out First !");
    res.redirect("/");
  } else {
    return next();
  }
});

let isVerified = wrapAsync(async (req, res, next) => {
  let result = await VerifiedUser.findOne({ bodyData: req.session.bodyData });
  if (result) {
    return next();
  } else {
    req.flash("error", "Please verify your Email First !");
    res.redirect("/");
  }
});
let isThisAdmin = (req, res, next) => {
  if (res.locals.isAdmin == true) {
    return next();
  } else {
    req.flash("error", "You Must be Admin to access Admin Page !");
    res.redirect("/");
  }
};
let isLoginFieldsFilled = (req, res, next) => {
  if (req.session.bodyData.username == "Student") {
    if (
      req.session.bodyData.stuname &&
      req.session.bodyData.enrollnostu &&
      req.session.bodyData.email &&
      req.session.bodyData.stumobno &&
      req.session.bodyData.coursename
    ) {
      return next();
    } else {
      req.flash("error", "Please Provide all Login Details !");
      res.redirect("/otp-verify-page");
    }
  } else if (req.session.bodyData.email) {
    return next();
  } else {
    req.flash("error", "Please Provide all Login Details !");
    res.redirect("/otp-verify-page");
  }
};
let studentStayInDashboard = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    res.locals.isAdmin == false &&
    req.url != "/account" &&
    req.url != "/logout"
  ) {
    res.redirect("/account");
  } else {
    return next();
  }
};
app.use(isAuthenticated);
app.use(studentStayInDashboard);
app.listen(9090, () => {
  console.log("server is listening to port 9090");
});

app.get("/", (req, res) => {
  res.render("index.ejs", {
    isAuthenticated: res.locals.isAuthenticated,
    isAdmin: res.locals.isAdmin,
  });
});

// login

app.get("/login-student", shallNotAuthenticated, (req, res) => {
  res.render("auth/loginstu.ejs");
});

app.post(
  "/login-student",
  passport.authenticate("local", {
    failureRedirect: "/login-student",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    if (
      req.body.username == process.env.ADMIN_USERNAME &&
      req.body.password == process.env.ADMIN_PASS
    ) {
      res.locals.isAdmin = true;
      req.flash("success", "Welcome to the Admin Dashboard !");
      res.redirect("/admin");
    } else {
      req.flash("success", "Welcome to The Placement Cell !");
      res.redirect("/account");
    }
  })
);

// app.get("/login-recruiter", shallNotAuthenticated, (req, res) => {
//   res.render("auth/loginrec.ejs");
// });

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      req.flash("error", "Error Logging out :: ", err.message);
      return next(err);
    }

    res.redirect("/");
  });
});

app.get(
  "/otp-initialize",
  shallNotAuthenticated,
  wrapAsync(async (req, res) => {
    req.session.username = req.query.username;
    res.render("auth/otpinit.ejs", { username: req.session.username });
  })
);

app.post(
  "/sendotp",
  wrapAsync(async (req, res) => {
    let { email, username } = req.body;
    let existingOTP = await OTP.findOne({ email: email });
    let newOtp = Math.floor(Math.random() * 900000) + 100000;
    if (username == "Student") {
      if (!email.trim().endsWith("@nfsu.ac.in")) {
        req.flash("error", "Please Enter a valid College Student Email.");
        res.redirect("/otp-initialize/?username=Student");
      }
    }
    if (existingOTP) {
      req.flash("success", "OTP is already Sent");
      req.session.bodyData = req.body;
      res.redirect(`/otp-verify-page`);
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
          res.redirect(`/otp-verify-page`);
        }
      });
    }
  })
);

app.get("/otp-verify-page", (req, res) => {
  res.render("auth/otpverify.ejs", {
    email: req.session.bodyData.email,
    username: req.session.bodyData.username,
  });
});

app.get(
  "/resendotp",
  wrapAsync(async (req, res) => {
    let { email, username } = req.query;
    try {
      await OTP.deleteMany({ email: email });
    } catch (e) {
      req.flash("error", e.message);
    }
    res.redirect(`/otp-initialize/?username=${username}`);
  })
);

app.post(
  "/otp-verify",
  isLoginFieldsFilled,
  wrapAsync(async (req, res) => {
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
            res.redirect("/register/stu");
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
        res.redirect("/otp-verify-page");
      }
    } else {
      // No OTP document found for the provided email
      return res.status(404).json({
        success: false,
        message: "No OTP found for the provided email.",
      });
    }
  })
);

app.get("/register/:user", shallNotAuthenticated, isVerified, (req, res) => {
  try {
    let { user } = req.params;
    //3 things stored
    //1.req.session.username = "Student"/ "Recruiter"
    //2.req.session.bodyData = {email:"smi..", username:"Student"/"Recruiter"}
    //3.Inside VerifiedUser= {
    //  bodydata = Object =={ email, username}
    // }

    //recruiter is successfully stored in db with isAudited == false but student is just stored in VerifiedUser model with 5 UserFields and will shown in admin dash from that model only , its not saved in Student model as of yet
    if (user == "rec") {
      res.render("auth/regisrec.ejs", { email: req.session.bodyData.email });
    } else if (user == "stu") {
      req.flash(
        "success",
        `Email Verification Successfull ! <br> We will send Your Credentials on the Provided Email. <br> Please wait for further Email Updates on approval of the Admin.`
      );
      res.redirect("/");
    } else {
      req.flash("error", "Invalid URL");
      res.redirect("/");
    }
  } catch (e) {
    req.flash("error", "Please Verify Your Email !");
    res.redirect("/");
  }
});

app.post(
  "/register/:user",
  shallNotAuthenticated,
  isVerified,
  wrapAsync(async (req, res) => {
    let { user } = req.params;

    if (user == "rec") {
      try {
        // Iterate over the keys of req.body
        // for (const key in req.body) {
        //   // Generate the code to store each field in the database
        //   console.log(`${key}:{ type:String},`);
        // }

        //check if the email isnt the verified one

        let verifiedBodyData = await VerifiedUser.findOne({
          bodyData: req.session.bodyData,
        });
        if (req.body.headhremail != verifiedBodyData.bodyData.email) {
          req.flash("error", "Please Provide a Verified Email Address !");
          console.log("Error finding user in Verified User ! ");
          res.redirect("/register/rec");
        }
        //validate the rec's regis form using joi on server side
        // const { error } = recruiterSchema.validate(req.body);
        // if (error) {
        //   req.flash("error", "error validating recruiter's details" + error);
        //   res.redirect("/register/rec");
        // }

        const newRecruiter = new Recruiter({
          isAudited: false,
          //with the isAudited field
          _id: new mongoose.Types.ObjectId(),
          companyname: req.body.companyname,
          natureofbusiness: req.body.natureofbusiness,
          websitelink: req.body.websitelink,
          postaladdress: req.body.postaladdress,
          category: req.body.category,
          headhrname: req.body.headhrname || "",
          headhrdesignation: req.body.headhrdesignation || "",
          headhraltmobno: req.body.headhraltmobno || "",
          headhrmobno: req.body.headhrmobno || "",
          headhremail: req.body.headhremail || "",
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

          jobtitle: req.body.jobtitle,
          jobtype: req.body.jobtype,
          jobdesignation: req.body.jobdesignation,
          sector: req.body.sector,
          tentativenoofhires: req.body.tentativenoofhires,
          tentativejoblocation: req.body.tentativejoblocation,
          JobDescription: req.body.JobDescription,
          checkmtechcs: req.body.checkmtechcs,
          checkmsccs: req.body.checkmsccs,
          checkmscdfis: req.body.checkmscdfis,
          checkmtechadsai: req.body.checkmtechadsai,
          basicmtechcs: req.body.basicmtechcs,
          pfmtechcs: req.body.pfmtechcs,
          hramtechcs: req.body.hramtechcs,
          joiningbonusmtechcs: req.body.joiningbonusmtechcs,
          relocationbonusmtechcs: req.body.relocationbonusmtechcs,
          stocksmtechcs: req.body.stocksmtechcs,
          takehomemtechcs: req.body.takehomemtechcs,
          ctcmtechcs: req.body.ctcmtechcs,
          othersmtechcs: req.body.othersmtechcs,
          basicmtechadsai: req.body.basicmtechadsai,
          pfmtechadsai: req.body.pfmtechadsai,
          hramtechadsai: req.body.hramtechadsai,
          joiningbonusmtechadsai: req.body.joiningbonusmtechadsai,
          relocationbonusmtechadsai: req.body.relocationbonusmtechadsai,
          stocksmtechadsai: req.body.stocksmtechadsai,
          takehomemtechadsai: req.body.takehomemtechadsai,
          ctcmtechadsai: req.body.ctcmtechadsai,
          othersmtechadsai: req.body.othersmtechadsai,
          basicmsccs: req.body.basicmsccs,
          pfmsccs: req.body.pfmsccs,
          hramsccs: req.body.hramsccs,
          joiningbonusmsccs: req.body.joiningbonusmsccs,
          relocationbonusmsccs: req.body.relocationbonusmsccs,
          stocksmsccs: req.body.stocksmsccs,
          takehomemsccs: req.body.takehomemsccs,
          ctcmsccs: req.body.ctcmsccs,
          othersmsccs: req.body.othersmsccs,
          basicmscdfis: req.body.basicmscdfis,
          pfmscdfis: req.body.pfmscdfis,
          hramscdfis: req.body.hramscdfis,
          joiningbonusmscdfis: req.body.joiningbonusmscdfis,
          relocationbonusmscdfis: req.body.relocationbonusmscdfis,
          stocksmscdfis: req.body.stocksmscdfis,
          takehomemscdfis: req.body.takehomemscdfis,
          ctcmscdfis: req.body.ctcmscdfis,
          othersmscdfis: req.body.othersmscdfis,
          CGPAmtechcs: req.body.CGPAmtechcs,
          Graduationmtechcs: req.body.Graduationmtechcs,
          twelthmtechcs: req.body.twelthmtechcs,
          tenthmtechcs: req.body.tenthmtechcs,
          agelimitmtechcs: req.body.agelimitmtechcs,
          CGPAmtechadsai: req.body.CGPAmtechadsai,
          Graduationmtechadsai: req.body.Graduationmtechadsai,
          mtechadsai12th: req.body.mtechadsai12th,
          mtechadsai10th: req.body.mtechadsai10th,
          agelimitmtechadsai: req.body.agelimitmtechadsai,
          CGPAmsccs: req.body.CGPAmsccs,
          Graduationmsccs: req.body.Graduationmsccs,
          msccs12th: req.body.msccs12th,
          msccs10th: req.body.msccs10th,
          agelimitmsccs: req.body.agelimitmsccs,
          CGPAmscdfis: req.body.CGPAmscdfis,
          Graduationmscdfis: req.body.Graduationmscdfis,
          mscdfis12th: req.body.mscdfis12th,
          mscdfis10th: req.body.mscdfis10th,
          agelimitmscdfis: req.body.agelimitmscdfis,
          internmtechcsduration: req.body.internmtechcsduration,
          internmtechcsstipend: req.body.internmtechcsstipend,
          internmtechcsctc: req.body.internmtechcsctc,
          internmsccsduration: req.body.internmsccsduration,
          internmsccsstipend: req.body.internmsccsstipend,
          internmsccsctc: req.body.internmsccsctc,
          internmscdfisduration: req.body.internmscdfisduration,
          internmscdfisstipend: req.body.internmscdfisstipend,
          internmscdfisctc: req.body.internmscdfisctc,
          internmtechadsaiduration: req.body.internmtechadsaiduration,
          internmtechadsaistipend: req.body.internmtechadsaistipend,
          internmtechadsaictc: req.body.internmtechadsaictc,
          isvirtual: req.body.isvirtual,
          servicebonddetails: req.body.servicebonddetails,
          MedicalRequirements: req.body.MedicalRequirements,
          selectioncriteriadetails: req.body.selectioncriteriadetails,
          stagename1: req.body.stagename1,
          stageduration1: req.body.stageduration1,
          noofrounds1: req.body.noofrounds1,
          modeofstage1: req.body.modeofstage1,
          otherdetails1: req.body.otherdetails1,
          stagename2: req.body.stagename2,
          stageduration2: req.body.stageduration2,
          noofrounds2: req.body.noofrounds2,
          modeofstage2: req.body.modeofstage2,
          otherdetails2: req.body.otherdetails2,
          stagename3: req.body.stagename3,
          stageduration3: req.body.stageduration3,
          noofrounds3: req.body.noofrounds3,
          modeofstage3: req.body.modeofstage3,
          otherdetails3: req.body.otherdetails3,
          stagename4: req.body.stagename4,
          stageduration4: req.body.stageduration4,
          noofrounds4: req.body.noofrounds4,
          modeofstage4: req.body.modeofstage4,
          otherdetails4: req.body.otherdetails4,
          stagename5: req.body.stagename5,
          stageduration5: req.body.stageduration5,
          noofrounds5: req.body.noofrounds5,
          modeofstage5: req.body.modeofstage5,
          otherdetails5: req.body.otherdetails5,
        });

        try {
          await newRecruiter.save();

          await VerifiedUser.deleteMany({
            "bodyData.email": newRecruiter.headhremail,
          });
          // If save operation is successful, continue with redirection or other operations
          req.flash(
            "success",
            `Welcome to the NFSU Placement Cell ! <br>  Please Contact the Administration for Further Recruitment Steps. <br> We'll Keep You Informed on the Provided HR Email.`
          );

          //sending thanking email
          message = `<p style="color: red;">Dear Respected Recruiter,</p><br/>
          <strong>
Thank you for registering with the Placement Cell of National Forensic Science University! We are thrilled to have you join our network of esteemed recruiters.
<br/><br/>
At The School of Cyber Security and Digital Forensics, We are committed to providing our students with exceptional opportunities to embark on rewarding career paths in the field of Computer Science and Cyber Security. Your participation in our placement activities is invaluable in helping our students achieve their professional aspirations.


<br/><br/>
We look forward to collaborating with you and your organization to identify talented individuals who will make meaningful contributions to your team. Together, we can nurture the next generation of leaders and innovators in the field of Cyber Security.
<br/><br/>
Once again, thank you for choosing to partner with us. We are excited about the possibilities that lie ahead and are confident that our partnership will be mutually beneficial.

<br/><br/>
<p style="color: red;">Warm regards,</p>

 <br/><br/>
Dr. Ahlad Kumar,
<br>
Placement Cell Coordinator,
<br>

School of Cyber Security and Digital Forensics,
<br>

National Forensic Science University.
<br>

</strong>
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
            to: req.session.bodyData.email,
            subject:
              "Welcome to National Forensic Science University's Placement Cell.",
            html: message,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("error in sending thanking email : " + error);
              res.redirect("/");
            } else {
              res.redirect("/");
            }
          });
          //now i have the req.session.bodyData and bodyData inside every object in VerifiedUser with bodyData.email and bodyData.username(Recruiter);
        } catch (error) {
          // If an error occurs during save operation, catch it here
          req.flash("error", "Error saving Recruiter's data:" + error.message);
          console.log(error);
          res.redirect("/register/rec"); // Redirect to an error page
        }
      } catch (error) {
        req.flash("error", "error saving recruiter's data :" + error);
        res.redirect("/register/rec");
      }
    } else if (user == "stu") {
      try {
        const { error } = studentSchema.validate(req.body);
        if (error) {
          return res.status(400).send(error.details[0].message);
        }

        const newStudent = new Student({
          firstname: req.body.firstname,
          disability: req.body.disability,
          surname: req.body.surname,
          fathername: req.body.fathername,
          birthdate: req.body.birthdate,
          maritalstatus: req.body.maritalstatus,
          gender: req.body.gender,
          mobileno: req.body.mobileno,
          altmobileno: req.body.altmobileno,
          enrollmentNo: req.body.enrollmentNo,
          email: req.body.email,
          altemail: req.body.altemail,
          category: req.body.category,
          nationality: req.body.nationality,
          presentcountry: req.body.presentcountry,
          presentstate: req.body.presentstate,
          presentdistrict: req.body.presentdistrict,
          landmark: req.body.landmark,
          presentaddress: req.body.presentaddress,
          pincode: req.body.pincode,
          tenth: req.body.tenth,
          username: req.body.enrollmentNo,
          twelth: req.body.twelth,
          lastsemcgpa: req.body.lastsemcgpa,
        });

        let { password } = req.body;
        const registeredStudent = await Student.register(newStudent, password);

        req.login(registeredStudent, (err) => {
          if (err) {
            return next(err);
          } else {
            req.flash("success", "Welcome to the Placement Cell !");
            res.redirect("/");
          }
        });
      } catch (error) {
        req.flash("error", error.message);
        res.redirect("/register/stu");
      }
    } else {
      res.send("Invalid URL");
    }
  })
);

app.get("/account", isLoggedIn, (req, res) => {
  res.render("users/youraccountstu.ejs");
});

app.get(
  "/admin",
  isThisAdmin,
  wrapAsync(async (req, res) => {
    let allRecruitersPending = await Recruiter.find({ isAudited: false });
    let allStudentsPending = await VerifiedUser.find({
      "bodyData.username": "Student",
    });
    let allRegisteredRecruiters = await Recruiter.find({ isAudited: true });
    // console.log("recs :");
    // console.log(allRecruitersPending);
    // console.log("stu");
    // console.log(allStudentsPending);
    res.render("users/admin.ejs", {
      allRecruitersPending: allRecruitersPending,
      allStudentsPending: allStudentsPending,
      allRegisteredRecruiters: allRegisteredRecruiters,
    });
  })
);

app.get(
  "/admin/recdetails/:recid",
  isThisAdmin,
  wrapAsync(async (req, res) => {
    let { recid } = req.params;
    let { noAuditNeeded } = req.query;

    try {
      let recDetails = await Recruiter.findOne({ _id: recid });

      if (!recDetails) {
        // If recruiter not found, return a 404 Not Found response
        return res.status(404).send("Recruiter not found");
      }

      // console.log(recDetails);
      // If recruiter found, send the recruiter details to the client
      res.render("resources/recruiterDetails", {
        recruiter: recDetails,
        recid: recid,
        noAuditNeeded: noAuditNeeded,
      });
    } catch (error) {
      // If an error occurs during database query, return a 500 Internal Server Error response
      res.status(500).send("Error fetching recruiter details:" + error);
    }
  })
);

app.put(
  "/admin/recaudited/:recid",
  isThisAdmin,
  wrapAsync(async (req, res) => {
    let { recid } = req.params;
    try {
      let recDetails = await Recruiter.findOne({ _id: recid });

      if (!recDetails) {
        // If recruiter not found, return a 404 Not Found response
        return res.status(404).send("Recruiter not found");
      }

      // Update the isAudited field to true
      recDetails.isAudited = true;

      // Save the changes to the database
      await recDetails.save();

      // Respond with a success message
      req.flash("success", "Recruiter Updated Successfully !");
      res.redirect("/admin");
    } catch (error) {
      // If an error occurs during database query or save operation,
      // return a 500 Internal Server Error response
      console.error("Error updating recruiter details:", error);
      res.status(500).send("Error updating recruiter details");
    }
  })
);
app.get("/placement-team", (req, res) => {
  res.render("team/placementTeam.ejs");
});

app.get("/placement-team-contact", (req, res) => {
  res.render("team/contactus.ejs");
});
app.get("/student", (req, res) => {
  res.render("resources/resourcesstudent.ejs");
});

app.get("/resrec", (req, res) => {
  res.render("resources/resrecru.ejs");
});

app.get("/studentcommunity", (req, res) => {
  res.render("resources/stucommunity.ejs");
});
