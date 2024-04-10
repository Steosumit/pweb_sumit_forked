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
const { studentSchema } = require("./schema");
const wrapAsync = require("./utils/wrapasync");
const Student = require("./models/student");
const VerifiedUser = require("./models/verifiedUser");
const Recruiter = require("./models/recruiter");
const OTP = require("./models/otp");
const passport = require("passport");
// const twilio = require("twilio");
const nodemailer = require("nodemailer");
const LocalStrategy = require("passport-local");
const { wrap } = require("module");
const wrapasync = require("./utils/wrapasync");
// const { isAuthenticated } = require("./middleware");
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
// const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
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

let isAuthenticated = wrapAsync(async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true; // Set a variable indicating the user
  } else {
    res.locals.isAuthenticated = false;
  }
  return next();
});
app.use(isAuthenticated);

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

app.listen(9090, () => {
  console.log("server is listening to port 9090");
});

app.get("/", (req, res) => {
  res.render("index.ejs", { isAuthenticated: res.locals.isAuthenticated });
});

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
    req.flash("success", "Welcome to our website !");
    res.redirect("/");
  })
);
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
app.get("/error", (req, res) => {
  req.flash("error", "some error occurred !");
  res.redirect("/");
});
app.get("/login-recruiter", shallNotAuthenticated, (req, res) => {
  res.render("auth/loginrec.ejs");
});

app.get("/account", isLoggedIn, (req, res) => {
  res.render("users/youraccountstu.ejs");
});
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
let isVerified = wrapAsync(async (req, res, next) => {
  let result = await VerifiedUser.findOne({ email: req.session.email });
  if (result) {
    return next();
  } else {
    req.flash("error", "Please wait untill Admin Verifies your account !");
    res.redirect("/");
  }
});
app.get("/register/:user", shallNotAuthenticated, isVerified, (req, res) => {
  let { user } = req.params;

  if (user == "rec") {
    res.render("auth/regisrec.ejs");
  } else if (user == "stu") {
    res.render("auth/regisstu.ejs");
  } else {
    res.send("invalid url");
  }
});

app.post(
  "/register/:user",
  shallNotAuthenticated,
  wrapAsync(async (req, res) => {
    let { user } = req.params;

    if (user == "rec") {
      res.send("recruiter registration pending ");
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
    let { email } = req.body;
    let existingOTP = await OTP.findOne({ email: email });
    let newOtp = Math.floor(Math.random() * 900000) + 100000;

    if (existingOTP) {
      req.flash("success", "OTP is already Sent");
      req.session.email = email;
      res.redirect(`/otp-verify-page`);
    } else {
      // Otherwise, create a new OTP document
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
We received a request to OTP Verification associated with your account. If you did not make this request, you can safely ignore this email.
<br/><br/>
To Verify your Email, please Insert the <strong>Following OTP</strong>:
<br/><br/>
<strong>${newOtp}</strong>
<br/><br/>
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
          // console.log("Email sent: " + info.response);
          // Send OTP to phone number using Twilio or another SMS service
          // Code for sending OTP via SMS goes here
          // res.status(200).send("OTP sent successfully");
          req.flash("success", "OTP sent successfully");
          req.session.email = email;
          res.redirect(`/otp-verify-page`);
        }
      });

      // await client.messages.create({
      //   body: `Your OTP is: ${newOtp}`,
      //   from: process.env.MY_PHONE,
      //   to: `+91${mobileno}`,
      // });
    }
  })
);

app.get("/otp-verify-page", (req, res) => {
  res.render("auth/otpverify.ejs", {
    email: req.session.email,
    username: req.session.username,
  });
});

app.post(
  "/otp-verify",
  wrapasync(async (req, res) => {
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
          // await VerifiedUser.insertMany({
          //   email: email,
          //   username: req.session.username,
          // });
          if (req.session.username == "Student") {
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
        return res
          .status(400)
          .json({ success: false, message: "Invalid OTP." });
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
