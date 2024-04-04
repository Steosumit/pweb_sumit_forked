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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

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
app.use(session(sessionOptions));
app.use(flash());
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

app.listen(9090, () => {
  console.log("server is listening to port 9090");
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login-student", (req, res) => {
  res.render("loginstu.ejs");
});

app.get("/login-recruiter", (req, res) => {
  res.render("loginrec.ejs");
});

app.get("/placement-team", (req, res) => {
  res.render("placementTeam.ejs");
});

app.get("/placement-team-contact", (req, res) => {
  res.render("contactus.ejs");
});
app.get("/register/:user", (req, res) => {
  let { user } = req.params;

  if (user == "rec") {
    res.render("regisrec.ejs");
  } else if (user == "stu") {
    res.render("regisstu.ejs");
  } else {
    res.send("invalid url");
  }
});

app.get("/student", (req, res) => {
  res.render("resourcesstudent.ejs");
});

app.get("/resrec", (req, res) => {
  res.render("resrecru.ejs");
});
app.post("/register/:user", async (req, res) => {
  let { user } = req.params;

  if (user == "rec") {
    res.send("recruiter registered ");
  } else if (user == "stu") {
    try {
      const { error } = studentSchema.validate(req.body);
      if (error) {
        // If validation fails, respond with the validation error
        return res.status(400).send(error.details[0].message);
      } else {
        console.log("validated");
      }

      // Create a new instance of the Student model with data from req.body
      const newStudent = new Student({
        firstname: req.body.firstname,
        surname: req.body.surname,
        fathername: req.body.fathername,
        birthdate: req.body.birthdate,
        maritalstatus: req.body.maritalstatus,
        mobileno: req.body.mobileno,
        altmobileno: req.body.altmobileno,
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
        twelth: req.body.twelth,
        lastsemcgpa: req.body.lastsemcgpa,
        // Add other fields here as needed
      });

      // Save the new student to the database
      await newStudent.save();

      // Respond with a success message
      res.send("Student registered successfully");
    } catch (error) {
      // If an error occurs during saving, respond with an error message
      console.error(error);
      res
        .status(500)
        .send("An error occurred while registering the student:" + error);
    }
  } else {
    res.send("Invalid URL");
  }
});
