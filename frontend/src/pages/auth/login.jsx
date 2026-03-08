import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser } from "../../services/transportService";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const tokenRes = await getToken({ username, password });
      localStorage.setItem("access", tokenRes.data.access);
      localStorage.setItem("refresh", tokenRes.data.refresh);

      const userRes = await getUser();
      localStorage.setItem("is_staff", userRes.data.is_staff ? "true" : "false");
      navigate(userRes.data.is_staff ? "/admin/dashboard" : "/student/dashboard");
    } catch {
      setError("Invalid username or password");
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
