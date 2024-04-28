const Student = require("../models/student");
const Recruiter = require("../models/recruiter");
const VerifiedUser = require("../models/verifiedUser");
const Listing = require("../models/listing");
const Application = require("../models/application");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const Update = require("../models/update");
let converter = require("json-2-csv");

module.exports.showAdmin = async (req, res) => {
  let allRecruitersPending = await Recruiter.find({ isAudited: false });
  let countAllRecruitersPending = allRecruitersPending.length;
  let allStudentsPending = await VerifiedUser.find({
    "bodyData.username": "Student",
  });
  let countallStudentsPending = allStudentsPending.length;
  let allRegisteredRecruiters = await Recruiter.find({ isRegistered: true });
  let countAllRegisteredRecruiters = allRegisteredRecruiters.length;
  let allAuditedRecruiters = await Recruiter.find({
    isAudited: true,
    isRegistered: false,
  });
  let allAuditedStudents = await Student.find({
    isAudited: true,
    isRegistered: false,
  });
  let countallAuditedStudents = allAuditedStudents.length;
  let allRegisteredStudents = await Student.find({ isRegistered: true });
  let countallRegisteredStudents = allRegisteredStudents.length;
  let allListedRecruiters = await Listing.find({});
  let countAllListedRecruiters = allListedRecruiters.length;
  let allApplications = await Application.find({})
    .populate("stuId")
    .populate("listingId");
  let countallApplications = allApplications.length;

  let allUpdates = await Update.find({});
  let updatesForAll = allUpdates.filter((update) =>
    update.forCourse.includes("All")
  );
  let updatesForMtechCs = allUpdates.filter((update) =>
    update.forCourse.includes("MtechCs")
  );
  let updatesForMtechAdsai = allUpdates.filter((update) =>
    update.forCourse.includes("MtechAdsai")
  );
  let updatesForMscCs = allUpdates.filter((update) =>
    update.forCourse.includes("MScCs")
  );
  let updatesForMscDfis = allUpdates.filter((update) =>
    update.forCourse.includes("MscDfis")
  );
  let allplacedStudents = await Student.find({ isPlaced: true });

  let allDeboardedStudents = await Student.find({ isDeboarded: true });

  res.render("users/admin.ejs", {
    allRecruitersPending: allRecruitersPending,
    allAuditedRecruiters: allAuditedRecruiters,
    allStudentsPending: allStudentsPending,
    allRegisteredRecruiters: allRegisteredRecruiters,
    allAuditedStudents: allAuditedStudents,
    allRegisteredStudents: allRegisteredStudents,
    allListedRecruiters: allListedRecruiters,
    allApplications: allApplications,
    countAllRecruitersPending: countAllRecruitersPending,
    countAllRegisteredRecruiters: countAllRegisteredRecruiters,
    countAllListedRecruiters: countAllListedRecruiters,
    countallStudentsPending: countallStudentsPending,
    countallRegisteredStudents: countallRegisteredStudents,
    countallAuditedStudents: countallAuditedStudents,
    countallApplications: countallApplications,
    updatesForAll: updatesForAll,
    updatesForMtechCs: updatesForMtechCs,
    updatesForMtechAdsai: updatesForMtechAdsai,
    updatesForMscCs: updatesForMscCs,
    updatesForMscDfis: updatesForMscDfis,
    allplacedStudents: allplacedStudents,
    allDeboardedStudents: allDeboardedStudents,
  });
};

module.exports.showRecDetails = async (req, res) => {
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
};

module.exports.markRecAudit = async (req, res) => {
  let { recid } = req.params;
  try {
    let recDetails = await Recruiter.findOne({ _id: recid });

    if (!recDetails) {
      // If recruiter not found, return a 404 Not Found response
      return res.status(404).send("Recruiter not found");
    }

    // Update the isAudited field to true
    recDetails.isAudited = true;
    recDetails.isRegistered = false;

    // Save the changes to the database
    await recDetails.save();

    //Send Email to the Recruiter informing him of pursuing further detailed registration

    let regisLink = `https://placementcellnfsu.onrender.com/register/rec?recid=${recid}`;
    let message = `<p style="color: red;">Dear Respected Recruiter,</p>

<br/>
We have audited and accepted your participation request associated with your account in The NFSU School of Cyber Security and Digital Forensics Placement Cell. We Request you to Please Follow the Given Link below and complete the <strong>Remaining Registration Procedure.</strong>.
<br/><br/>
 <strong>Following is The Registration Link</strong>:
<br/><br/>
<h1>
<strong>${regisLink}</strong></h1>
<br/>
You can paste the above Link in the Browser's address bar.
 <br/><br/>
 Please Complete Your Remaining Registration Procedure as soon as possible.
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
      to: recDetails.headhremail,
      subject: "Registration Pending Information",
      html: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Failed to send Registration Mail");
      } else {
        req.flash("success", "Recruiter Updated Successfully !");
        res.redirect("/admin");
      }
    });

    // Respond with a success message
  } catch (error) {
    // If an error occurs during database query or save operation,
    // return a 500 Internal Server Error response
    console.error("Error updating recruiter details:", error);
    res.status(500).send("Error updating recruiter details");
  }
};

module.exports.addCompanyListing = async (req, res) => {
  console.log(req.file.path);
  let newListing = new Listing({
    jobDescriptionFile: req.file.path,
    companyName: req.body.companyName,
    jobLocation: req.body.jobLocation,
    jobType: req.body.jobType,
    jobTitle: req.body.jobTitle,
    forCourse: req.body.forCourse,
    ctc: req.body.ctc,
    lastDateToApply: req.body.lastDateToApply,
  });

  await newListing.save();
  req.flash("success", "Listing Added Successfully !");
  res.redirect("/admin");
  // console.log("newlisting: " + newListing);
};

module.exports.showListingDetails = async (req, res) => {
  let { listingId } = req.params;
  let listingDetails = await Listing.findOne({ _id: listingId });

  res.render("resources/listingDetails.ejs", {
    listingDetails: listingDetails,
  });
};

module.exports.updateListing = async (req, res) => {
  let { listingId } = req.params;
  let query = { _id: listingId };
  let update = { $set: req.body };
  let options = { new: true };
  let result = await Listing.findOneAndUpdate(query, update, options);

  if (!result) {
    req.flash("error", "Listing Updation Failed !");
    res.redirect(`/admin/listingDetails/${listingId}`);
  }
  req.flash("success", "Listing Updated Successfully !");
  res.redirect(`/admin/listingDetails/${listingId}`);
};

module.exports.removeCompanyListing = async (req, res) => {
  let { listingId } = req.params;
  await Listing.deleteMany({ _id: listingId });
  req.flash("success", "Listing Removed Successfully !");
  res.redirect("/admin");
};

module.exports.markStuAudit = async (req, res) => {
  let { verifiedStuID } = req.params;
  let stuVerified = await VerifiedUser.findOne({ _id: verifiedStuID });
  await VerifiedUser.deleteMany({ _id: verifiedStuID });
  let twoDigitNo = stuVerified.bodyData.enrollnostu.slice(-2);
  let courseName = stuVerified.bodyData.coursename;
  function generatePID(courseName, twoDigitNo) {
    let prefix = "";
    switch (courseName) {
      case "MscCs":
        prefix = "PL-MSCS-";
        break;
      case "MscDfis":
        prefix = "PL-MSDF-";
        break;
      case "MtechCs":
        prefix = "PL-MTCS-";
        break;
      case "MtechAdsai":
        prefix = "PL-MTADSAI-";
        break;
      default:
        return "Invalid course name";
    }
    return prefix + twoDigitNo;
  }

  let pId = generatePID(courseName, twoDigitNo);
  let password = uuidv4();

  const newStudent = new Student({
    isAudited: true,
    isRegistered: false,
    haveResetPass: false,
    enrollmentNo: stuVerified.bodyData.enrollnostu,
    fullname: stuVerified.bodyData.stuname,
    tenthMarksheetUrl: "",
    twelthMarksheetUrl: "",
    fathername: "",
    mothername: "",
    course: stuVerified.bodyData.coursename,
    gender: "",
    birthdate: "",
    maritalstatus: "",
    disability: "",
    mobileno: stuVerified.bodyData.stumobno,
    altmobileno: "",
    email: stuVerified.bodyData.email,
    altemail: "",
    category: "",
    nationality: "",
    presentcountry: "",
    presentstate: "",
    presentdistrict: "",
    username: pId,
    landmark: "",
    presentaddress: "",
    pincode: "",
    tenth: "",
    twelth: "",
    lastsemcgpa: "",
  });

  //send credentials
  let message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
    <style>
        /* Reset styles */
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f5f5f5;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #007bff;
            margin-bottom: 20px;
        }

        .credentials {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .credentials p {
            margin-bottom: 5px;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }

        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Our Platform!</h1>
        <p>We're excited to have you onboard. Below are your login credentials:</p>
        <div class="credentials">
            <p><strong>Username:
            <br> </strong>${pId}</p>
            <p><strong>Password:
            <br> </strong>${password}</p>
        </div>
        <p>Please use the provided credentials to log in to your account and complete your registration process as soon as possible.</p>
        <p>If you have any questions or need assistance, feel free to contact us.</p>
        <a href="#" style="color:white;" class="btn">Login Now</a>
    </div>
</body>
</html>
`;

  const registeredStudent = await Student.register(newStudent, password);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "smile.itsadil@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: "ThePlacementCell@NFSU<smile.itsadil@gmail.com>",
    to: stuVerified.bodyData.email,
    subject:
      "Welcome to National Forensic Science University's Placement Cell.",
    html: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.flash("error", "error in sending credentials to student : " + error);
      res.redirect("/admin");
    } else {
      req.flash("success", "Student marked as Audited. ");
      res.redirect("/admin");
    }
  });
};

module.exports.markStuArrayAudit = async (req, res) => {
  let { idsOfCheckboxes } = req.body;
  const idsOfCheckboxesArray = JSON.parse(idsOfCheckboxes);

  for (verifiedStuID of idsOfCheckboxesArray) {
    try {
      let stuVerified = await VerifiedUser.findOne({ _id: verifiedStuID });
      await VerifiedUser.deleteMany({ _id: verifiedStuID });
      let twoDigitNo = stuVerified.bodyData.enrollnostu.slice(-2);
      let courseName = stuVerified.bodyData.coursename;
      function generatePID(courseName, twoDigitNo) {
        let prefix = "";
        switch (courseName) {
          case "MscCs":
            prefix = "PL-MSCS-";
            break;
          case "MscDfis":
            prefix = "PL-MSDF-";
            break;
          case "MtechCs":
            prefix = "PL-MTCS-";
            break;
          case "MtechAdsai":
            prefix = "PL-MTADSAI-";
            break;
          default:
            return "Invalid course name";
        }
        return prefix + twoDigitNo;
      }

      let pId = generatePID(courseName, twoDigitNo);
      let password = uuidv4();

      const newStudent = new Student({
        isAudited: true,
        isRegistered: false,
        haveResetPass: false,
        enrollmentNo: stuVerified.bodyData.enrollnostu,
        fullname: stuVerified.bodyData.stuname,
        tenthMarksheetUrl: "",
        twelthMarksheetUrl: "",
        fathername: "",
        mothername: "",
        course: stuVerified.bodyData.coursename,
        gender: "",
        birthdate: "",
        maritalstatus: "",
        disability: "",
        mobileno: stuVerified.bodyData.stumobno,
        altmobileno: "",
        email: stuVerified.bodyData.email,
        altemail: "",
        category: "",
        nationality: "",
        presentcountry: "",
        presentstate: "",
        presentdistrict: "",
        username: pId,
        landmark: "",
        presentaddress: "",
        pincode: "",
        tenth: "",
        twelth: "",
        lastsemcgpa: "",
      });

      //send credentials
      let message = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Platform</title>
      <style>
          /* Reset styles */
          body, p, h1, h2, h3, h4, h5, h6 {
              margin: 0;
              padding: 0;
          }

          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              background-color: #f5f5f5;
              color: #333;
          }

          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          h1 {
              color: #007bff;
              margin-bottom: 20px;
          }

          .credentials {
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 20px;
          }

          .credentials p {
              margin-bottom: 5px;
          }

          .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
          }

          .btn:hover {
              background-color: #0056b3;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Welcome to Our Platform!</h1>
          <p>We're excited to have you onboard. Below are your login credentials:</p>
          <div class="credentials">
              <p><strong>Username:
              <br> </strong>${pId}</p>
              <p><strong>Password:
              <br> </strong>${password}</p>
          </div>
          <p>Please use the provided credentials to log in to your account and complete your registration process as soon as possible.</p>
          <p>If you have any questions or need assistance, feel free to contact us.</p>
          <a href="#" style="color:white;" class="btn">Login Now</a>
      </div>
  </body>
  </html>
  `;

      const registeredStudent = await Student.register(newStudent, password);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "smile.itsadil@gmail.com",
          pass: process.env.APP_PASSWORD,
        },
      });
      const mailOptions = {
        from: "ThePlacementCell@NFSU<smile.itsadil@gmail.com>",
        to: stuVerified.bodyData.email,
        subject:
          "Welcome to National Forensic Science University's Placement Cell.",
        html: message,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          req.flash(
            "error",
            "error in sending credentials to student : " + error
          );
          // res.redirect("/admin");
          console.log("error in sending mail to array of students ", error);
        } else {
          // req.flash("success", "Student marked as Audited. ");
          // res.redirect("/admin");
        }
      });
    } catch (e) {
      console.log("error in registering array of students ", e);
    }
  }
  req.flash("success", "All Marked Students Audited !");
  res.redirect("/admin");
};

module.exports.deboardRecruiter = async (req, res) => {
  let { recid } = req.params;
  let result = await Recruiter.deleteMany({ _id: recid });

  req.flash("success", "Recruiter De-Boarded Successfully !");
  res.redirect("/admin");
};

module.exports.deboardStudent = async (req, res) => {
  let { stuid } = req.params;
  let stu = await Student.findOne({ _id: stuid });

  if (stu) {
    await VerifiedUser.deleteMany({
      "bodyData.email": stu.email,
    });
  } else {
    await VerifiedUser.deleteMany({
      _id: stuid,
    });
  }

  await Application.deleteMany({ stuId: stuid });
  // await Student.deleteMany({ _id: stuid });
  stu.isDeboarded = true;
  stu.isRegistered = false;

  await stu.save();

  req.flash("success", "Student De-Boarded Successfully !");
  res.redirect("/admin");
};

module.exports.onboardStudent = async (req, res) => {
  let { stuid } = req.params;
  let stu = await Student.findOne({ _id: stuid });

  stu.isDeboarded = false;

  await stu.save();

  req.flash("success", "Student On-Boarded Successfully !");
  res.redirect("/admin");
};

module.exports.exportAllStudentData = async (req, res) => {
  try {
    const students = await Student.find({});
    const sanitizedStudents = students.map((student) => {
      const sanitizedStudent = {};
      Object.entries(student).forEach(([key, value]) => {
        if (!key.startsWith("$") && !key.startsWith("_doc._id.")) {
          sanitizedStudent[key] = value;
        }
      });
      return sanitizedStudent;
    });
    const csv = await converter.json2csv(sanitizedStudents);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, "0");
    var min = String(today.getMinutes()).padStart(2, "0");
    var formattedDateTime = dd + "-" + mm + "-" + yyyy + " " + hh + "_" + min;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SPC Students ${formattedDateTime}.csv`
    );
    res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).send("Error exporting CSV");
  }
};
module.exports.exportAllCompanyData = async (req, res) => {
  try {
    const companies = await Recruiter.find({});
    const sanitizedcompanies = companies.map((company) => {
      const sanitizedcompanies = {};
      Object.entries(company).forEach(([key, value]) => {
        if (!key.startsWith("$") && !key.startsWith("_doc._id.")) {
          sanitizedcompanies[key] = value;
        }
      });
      return sanitizedcompanies;
    });
    const csv = await converter.json2csv(sanitizedcompanies);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, "0");
    var min = String(today.getMinutes()).padStart(2, "0");
    var formattedDateTime = dd + "-" + mm + "-" + yyyy + " " + hh + "_" + min;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SPC Companies ${formattedDateTime}.csv`
    );
    res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).send("Error exporting CSV");
  }
};

module.exports.renderSendUpdateForm = (req, res) => {
  res.render("resources/sendupdate.ejs");
};

module.exports.pushUpdateToStudents = async (req, res) => {
  let newUpdate = new Update(req.body);
  await newUpdate.save();
  req.flash("Update sent Successfully !");
  res.redirect("/admin");
};

module.exports.deleteUpdate = async (req, res) => {
  let { updateId } = req.params;
  await Update.deleteMany({ _id: updateId });
  req.flash("success", "Update Deleted Successfully !");
  res.redirect("/admin");
};

module.exports.renderPlacedStudentForm = (req, res) => {
  res.render("resources/placedstudent.ejs", {
    applicationId: req.params.applicationId,
  });
};

module.exports.markPlacedStudent = async (req, res) => {
  let application = await Application.findOne({
    _id: req.params.applicationId,
  });
  let student = await Student.findOne({ _id: application.stuId });
  student.isPlaced = true;
  student.placedCompany = req.body.companyname;
  student.placedCtc = req.body.ctc;
  student.placedJobLocation = req.body.joblocation;
  student.placedJobDescription = req.body.jobdescription;
  student.placedOtherDetails = req.body.otherdetails;

  await student.save();

  await Application.deleteMany({ stuId: student._id });
  req.flash("success", "Marked as Placed Successfully !");
  res.redirect("/admin");
};
