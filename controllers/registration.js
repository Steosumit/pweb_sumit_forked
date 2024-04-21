module.exports.renderRegistrationForm = (req, res) => {
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
      console.log(req.user);
      res.render("auth/regisstu.ejs", {
        email: req.user.email,
        mobno: req.user.mobileno,
        enroll: req.user.enrollmentNo,
        fullname: req.user.fullname,
        course: req.user.course,
        username: req.user.username,
      });
    } else {
      req.flash("error", "Invalid URL");
      res.redirect("/");
    }
  } catch (e) {
    req.flash("error", "Please Verify Your Email !");
    res.redirect("/");
  }
};

module.exports.registerTheUser = async (req, res) => {
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
      //checking the joi validation
      // const { error } = studentSchema.validate(req.body);
      // if (error) {
      //   return res.status(400).send(error.details[0].message);
      // }

      let tenthMarksheetUrl = req.files.tenthmarksheet[0].path;
      let twelthMarksheetUrl = req.files.twelthmarksheet[0].path;
      const newStudentDetails = {
        tenthMarksheetUrl: tenthMarksheetUrl,
        twelthMarksheetUrl: twelthMarksheetUrl,
        isRegistered: true,
        disability: req.body.disability,
        fathername: req.body.fathername,
        mothername: req.body.mothername,
        birthdate: req.body.birthdate,
        maritalstatus: req.body.maritalstatus,
        gender: req.body.gender,

        altmobileno: req.body.altmobileno,

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
      };

      let query = { _id: req.user._id };
      let update = { $set: newStudentDetails };
      let options = { new: true };
      try {
        let updatedStudent = await Student.findOneAndUpdate(
          query,
          update,
          options
        );
        console.log("updated stu:" + updatedStudent);
        res.redirect("/account");
      } catch (e) {
        console.log("error in updating student :" + e);
        res.redirect("/register/stu");
      }

      // req.login(registeredStudent, (err) => {
      //   if (err) {
      //     return next(err);
      //   } else {
      //     req.flash("success", "Welcome to the Placement Cell !");
      //     res.redirect("/");
      //   }
      // });
    } catch (error) {
      console.log(error);
      req.flash("error", error.message);
      res.redirect("/register/stu");
    }
  } else {
    res.send("Invalid URL");
  }
};
