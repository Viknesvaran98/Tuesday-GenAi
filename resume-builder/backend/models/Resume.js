import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    default: "My Resume"
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    portfolio: String
  },
  summary: String,
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    graduationDate: String,
    gpa: String
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }],
  atsScore: {
    type: Number,
    default: 0
  },
  atsOptimizedContent: {
    summary: String,
    experience: String,
    skills: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Resume", resumeSchema);
