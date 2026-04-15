const mongoose = require("mongoose"); 
const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {
    const { company, role, status, link, notes } = req.body;

    const job = await Job.create({
      user: req.user._id, // from middleware
      company,
      role,
      status,
      link,
      notes,
    });

    res.status(201).json(job);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { status, search } = req.query;

    let queryObject = {
      user: req.user._id,
    };

    // Filter by status
    if (status && status !== "all") {
      queryObject.status = status;
    }

    // Search (company or role)
    if (search) {
      queryObject.$or = [
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(queryObject);

    res.status(200).json(jobs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    console.log("PARAM ID:", req.params.id);
    console.log("BODY:", req.body);
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Ensure user owns the job
    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedJob);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await job.deleteOne();

    res.json({ message: "Job removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobStats = async (req, res) => {
  try {
    console.log("Stats route hit");
    console.log("User:", req.user); // debug

    // ✅ Ensure user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // ✅ Convert to ObjectId (IMPORTANT for aggregation)
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await Job.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // ✅ Default structure
    const statsObject = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    // ✅ Fill values
    stats.forEach((item) => {
      statsObject[item._id] = item.count;
    });

    res.status(200).json(statsObject);

  } catch (error) {
    console.log("STATS ERROR:", error); // 🔥 shows real issue in Render logs
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getJobs, updateJob, deleteJob, getJobStats };