import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const tokenResponse = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      setError("Invalid username or password");
      return;
    }

    localStorage.setItem("access", tokenData.access);
    localStorage.setItem("refresh", tokenData.refresh);

    // Fetch user role to decide which dashboard to show
    const userResponse = await fetch("http://127.0.0.1:8000/api/user/", {
      headers: { Authorization: `Bearer ${tokenData.access}` },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      localStorage.setItem("is_staff", userData.is_staff ? "true" : "false");
      navigate(userData.is_staff ? "/staff-dashboard" : "/student-dashboard");
    } else {
      // Fallback if user endpoint fails
      navigate("/student-dashboard");
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;