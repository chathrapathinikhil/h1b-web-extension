const express = require("express");
const { getJobsByEmployer, aboutPage, sendReport } = require("../controllers");

const router = express.Router();

// Route for the "about" page
router.get("/about", aboutPage);

// Route to fetch jobs by employer name
router.get("/:Employer_Petitioner_Name", getJobsByEmployer);

// 🔽 New route to handle report submissions
router.post("/report", sendReport);

module.exports = router;
