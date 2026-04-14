const express = require("express");
const router = express.Router();

const { createJob, getJobs, updateJob, deleteJob, getJobStats} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createJob);

router.get("/stats", protect, getJobStats);

router.get("/", protect, getJobs);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);


module.exports = router;
