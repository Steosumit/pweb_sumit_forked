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
const Student = require("./models/student");
const Recruiter = require("./models/recruiter");
const passport = require("passport");
// const twilio = require("twilio");
const nodemailer = require("nodemailer");
const LocalStrategy = require("passport-local");
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

let isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true; // Set a variable indicating the user
  } else {
    res.locals.isAuthenticated = false;
  }
  return next();
};

let isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first !");
    res.redirect("/");
  }
  return next();
};

let shallNotAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You Must Log out First !");
    res.redirect("/");
  }
  return next();
};

app.use(isAuthenticated);

app.listen(9090, () => {
  console.log("server is listening to port 9090");
});

app.get("/", (req, res) => {
  res.render("index.ejs", { isAuthenticated: res.locals.isAuthenticated });
});

app.get("/login-student", shallNotAuthenticated, (req, res) => {
  res.render("loginstu.ejs");
});
app.post(
  "/login-student",
  passport.authenticate("local", {
    failureRedirect: "/login-student",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to our website !");
    res.redirect("/");
  }
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
  res.render("loginrec.ejs");
});

app.get("/account", isLoggedIn, (req, res) => {
  res.send("in preparation");
});
app.get("/placement-team", (req, res) => {
  res.render("placementTeam.ejs");
});

app.get("/placement-team-contact", (req, res) => {
  res.render("contactus.ejs");
});
app.get("/student", (req, res) => {
  res.render("resourcesstudent.ejs");
});

app.get("/resrec", (req, res) => {
  res.render("resrecru.ejs");
});
app.get("/register/:user", shallNotAuthenticated, (req, res) => {
  let { user } = req.params;

  if (user == "rec") {
    res.render("regisrec.ejs");
  } else if (user == "stu") {
    res.render("regisstu.ejs");
  } else {
    res.send("invalid url");
  }
});

app.post("/register/:user", shallNotAuthenticated, async (req, res) => {
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
});

app.get("/verify", async (req, res) => {
  res.render("verification.ejs");
});
app.post("/sendotp", async (req, res) => {
  let { email, mobileno } = req.body;
  let newOtp = Math.floor(Math.random() * 900000) + 100000;

  const message = `<p style="color: red;">Hey Dear Fellow NFSUian !</p>
<br/>
We received a request to reset the password associated with your account. If you did not make this request, you can safely ignore this email.
<br/><br/>
To reset your password, please click on the <strong>Following link</strong>:
<br/><br/>
<a href="${"resetLink"}" >${"resetLink"}</a>
<br/><br/>
If clicking the link doesn't work, you can copy and paste it into your browser's address bar.
<br/><br/>
This link will expire on ${"expiry_time"}, so please reset your password as soon as possible.
<br/><br/>
<strong>Thank you,</strong><br/>
<p style="color: red;">Qbon Team .</p>
<br/>
<div>
<img
      src="https://res.cloudinary.com/ddxv0iwcs/image/upload/v1707926485/qbon_DEV/Screenshot_2024-02-07_at_10.01.59_AM_mbeifo.png"
      style="border-radius:2rem;width:60%;"
      alt="..."
    />
</div>
`;
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
    }
  });

  // await client.messages.create({
  //   body: `Your OTP is: ${newOtp}`,
  //   from: process.env.MY_PHONE,
  //   to: `+91${mobileno}`,
  // });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});
