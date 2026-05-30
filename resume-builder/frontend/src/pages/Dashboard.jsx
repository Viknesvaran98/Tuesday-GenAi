import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/resumes");
      setResumes(res.data);
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resumes/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📄 My Resumes</h1>
        <Link to="/builder" className="btn-primary">+ Create New Resume</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <p>No resumes yet. Create your first one!</p>
          <Link to="/builder" className="btn-primary">Create Resume</Link>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map(resume => (
            <div key={resume._id} className="resume-card">
              <h3>{resume.title}</h3>
              <p className="resume-name">{resume.personalInfo?.fullName || "No name"}</p>
              <p className="resume-email">{resume.personalInfo?.email || "No email"}</p>
              
              {resume.atsScore > 0 && (
                <div className="ats-badge" data-score={resume.atsScore >= 80 ? "good" : resume.atsScore >= 60 ? "medium" : "low"}>
                  ATS Score: {resume.atsScore}
                </div>
              )}

              <div className="card-actions">
                <Link to={`/builder/${resume._id}`} className="btn-edit">Edit</Link>
                <Link to={`/ats/${resume._id}`} className="btn-ats">ATS Check</Link>
                <button onClick={() => deleteResume(resume._id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
