import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roll_number: "",
    department: "",
    batch: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      navigate("/"); // go to login page
    } else {
      setError(JSON.stringify(data));
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto" }}>
      <h2>Student Signup</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <br /><br />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <br /><br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <br /><br />
        <input name="roll_number" placeholder="Roll Number" onChange={handleChange} required />
        <br /><br />
        <input name="department" placeholder="Department" onChange={handleChange} />
        <br /><br />
        <input name="batch" placeholder="Batch" onChange={handleChange} />
        <br /><br />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <br /><br />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <br /><br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;