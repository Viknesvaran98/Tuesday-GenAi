import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: "My Resume",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    education: [
      { institution: "", degree: "", field: "", graduationDate: "", gpa: "" },
    ],
    skills: "",
    projects: [{ name: "", description: "", technologies: "", link: "" }],
    certifications: [{ name: "", issuer: "", date: "" }],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resumes/${id}`);
      const data = res.data;
      setFormData({
        ...data,
        skills: Array.isArray(data.skills)
          ? data.skills.join(", ")
          : data.skills || "",
        projects: data.projects?.length
          ? data.projects
          : [{ name: "", description: "", technologies: "", link: "" }],
        certifications: data.certifications?.length
          ? data.certifications
          : [{ name: "", issuer: "", date: "" }],
      });
    } catch (err) {
      console.error("Error fetching resume:", err);
    }
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addArrayItem = (section, template) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], template],
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/resumes/${id}`, payload);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/resumes",
          payload,
        );
        navigate(`/ats/${res.data._id}`);
        return;
      }
      navigate("/");
    } catch (err) {
      console.error("Error saving resume:", err);
      alert("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="builder">
      <div className="builder-header">
        <h1>{isEditing ? "Edit Resume" : "Create Resume"}</h1>
        <button onClick={() => navigate("/")} className="btn-back">
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="resume-form">
        {/* Personal Info Section */}
        <section className="form-section">
          <h2>👤 Personal Information</h2>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.personalInfo.fullName}
              onChange={(e) =>
                handleChange("personalInfo", "fullName", e.target.value)
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.personalInfo.email}
              onChange={(e) =>
                handleChange("personalInfo", "email", e.target.value)
              }
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.personalInfo.phone}
              onChange={(e) =>
                handleChange("personalInfo", "phone", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Location (City, State)"
              value={formData.personalInfo.location}
              onChange={(e) =>
                handleChange("personalInfo", "location", e.target.value)
              }
            />
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={formData.personalInfo.linkedin}
              onChange={(e) =>
                handleChange("personalInfo", "linkedin", e.target.value)
              }
            />
            <input
              type="url"
              placeholder="Portfolio URL"
              value={formData.personalInfo.portfolio}
              onChange={(e) =>
                handleChange("personalInfo", "portfolio", e.target.value)
              }
            />
          </div>
        </section>

        {/* Summary Section */}
        <section className="form-section">
          <h2>📝 Professional Summary</h2>
          <textarea
            placeholder="Write a brief summary of your experience and goals..."
            value={formData.summary}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, summary: e.target.value }))
            }
            rows={4}
          />
        </section>

        {/* Experience Section */}
        <section className="form-section">
          <h2>💼 Work Experience</h2>
          {formData.experience.map((exp, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    handleArrayChange(
                      "experience",
                      index,
                      "company",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) =>
                    handleArrayChange(
                      "experience",
                      index,
                      "position",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Start Date (e.g., Jan 2020)"
                  value={exp.startDate}
                  onChange={(e) =>
                    handleArrayChange(
                      "experience",
                      index,
                      "startDate",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="End Date"
                  value={exp.endDate}
                  onChange={(e) =>
                    handleArrayChange(
                      "experience",
                      index,
                      "endDate",
                      e.target.value,
                    )
                  }
                  disabled={exp.current}
                />
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    handleArrayChange(
                      "experience",
                      index,
                      "current",
                      e.target.checked,
                    )
                  }
                />
                Currently working here
              </label>
              <textarea
                placeholder="Job description (use bullet points with action verbs)"
                value={exp.description}
                onChange={(e) =>
                  handleArrayChange(
                    "experience",
                    index,
                    "description",
                    e.target.value,
                  )
                }
                rows={3}
              />
              {formData.experience.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem("experience", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() =>
              addArrayItem("experience", {
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
              })
            }
          >
            + Add Experience
          </button>
        </section>

        {/* Education Section */}
        <section className="form-section">
          <h2>🎓 Education</h2>
          {formData.education.map((edu, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "institution",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "degree",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={edu.field}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "field",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Graduation Date"
                  value={edu.graduationDate}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "graduationDate",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="GPA (optional)"
                  value={edu.gpa}
                  onChange={(e) =>
                    handleArrayChange("education", index, "gpa", e.target.value)
                  }
                />
              </div>
              {formData.education.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem("education", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() =>
              addArrayItem("education", {
                institution: "",
                degree: "",
                field: "",
                graduationDate: "",
                gpa: "",
              })
            }
          >
            + Add Education
          </button>
        </section>

        {/* Skills Section */}
        <section className="form-section">
          <h2>🛠️ Skills</h2>
          <input
            type="text"
            placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
            value={formData.skills}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, skills: e.target.value }))
            }
          />
        </section>

        {/* Projects Section */}
        <section className="form-section">
          <h2>🚀 Projects</h2>
          {formData.projects.map((proj, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) =>
                    handleArrayChange("projects", index, "name", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Technologies (comma-separated)"
                  value={proj.technologies}
                  onChange={(e) =>
                    handleArrayChange(
                      "projects",
                      index,
                      "technologies",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="url"
                  placeholder="Project Link (optional)"
                  value={proj.link}
                  onChange={(e) =>
                    handleArrayChange("projects", index, "link", e.target.value)
                  }
                />
              </div>
              <textarea
                placeholder="Project description"
                value={proj.description}
                onChange={(e) =>
                  handleArrayChange(
                    "projects",
                    index,
                    "description",
                    e.target.value,
                  )
                }
                rows={2}
              />
              {formData.projects.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem("projects", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() =>
              addArrayItem("projects", {
                name: "",
                description: "",
                technologies: "",
                link: "",
              })
            }
          >
            + Add Project
          </button>
        </section>

        {/* Certifications Section */}
        <section className="form-section">
          <h2>📜 Certifications</h2>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Certification Name"
                  value={cert.name}
                  onChange={(e) =>
                    handleArrayChange(
                      "certifications",
                      index,
                      "name",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Issuing Organization"
                  value={cert.issuer}
                  onChange={(e) =>
                    handleArrayChange(
                      "certifications",
                      index,
                      "issuer",
                      e.target.value,
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Date Obtained"
                  value={cert.date}
                  onChange={(e) =>
                    handleArrayChange(
                      "certifications",
                      index,
                      "date",
                      e.target.value,
                    )
                  }
                />
              </div>
              {formData.certifications.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem("certifications", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() =>
              addArrayItem("certifications", { name: "", issuer: "", date: "" })
            }
          >
            + Add Certification
          </button>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Update & Check ATS"
                : "Save & Check ATS"}
          </button>
        </div>
      </form>
    </div>
  );
}
