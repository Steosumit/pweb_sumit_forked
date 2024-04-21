module.exports.showAccount = async (req, res) => {
  let { isRegistered, _id, course } = req.user;

  const allListings = await Listing.find({});

  try {
    const studentApplications = await Application.find({ stuId: _id });
    const appliedListingIds = studentApplications.map((app) => app.listingId);
    const filteredOnAppliedListings = allListings.filter((listing) => {
      return !appliedListingIds.some((appliedListingId) =>
        appliedListingId.equals(listing._id)
      );
    });
    const appliedListings = allListings.filter((listing) => {
      return appliedListingIds.some((appliedListingId) =>
        appliedListingId.equals(listing._id)
      );
    });
    const availableListings = filteredOnAppliedListings.filter(
      (listing) =>
        listing.forCourse.includes(course) || listing.forCourse.includes("All")
    );

    res.render("users/youraccountstu.ejs", {
      isRegistered: isRegistered,
      stuId: _id,
      availableListings: availableListings,
      appliedListings: appliedListings,
    });
  } catch (err) {
    console.error("Error retrieving student applications:", err);
    res.redirect("/account");
  }
};

module.exports.showStuPlacementProfile = async (req, res) => {
  let { stuId } = req.query;
  let stuDetails = await Student.findOne({ _id: stuId });

  res.render("resources/studentDetails.ejs", {
    stuDetails: stuDetails,
  });
};

module.exports.renderApplyForm = async (req, res) => {
  let { listingId, stuId } = req.query;
  let stuDetails = await Student.findOne({ _id: stuId });
  res.render("resources/apply.ejs", {
    listingId: listingId,
    stuId: stuId,
    stuDetails: stuDetails,
  });
};

module.exports.submitApply = async (req, res) => {
  let { listingId, stuId } = req.body;
  //let resumeLink = upload file
  let resumeLink = req.file.path;

  let prevapp = await Application.find({
    stuId: stuId,
    listingId: listingId,
  });
  if (prevapp.length != 0) {
    req.flash("error", "Already Applied !");
    res.redirect("/account");
  } else {
    let newApplication = new Application({
      stuId: stuId,
      listingId: listingId,
      resumeLink: resumeLink,
      createdAt: new Date(),
    });

    await newApplication.save();

    req.flash("success", "Application Submitted Succesfully !");
    res.redirect("/account");
  }
};
