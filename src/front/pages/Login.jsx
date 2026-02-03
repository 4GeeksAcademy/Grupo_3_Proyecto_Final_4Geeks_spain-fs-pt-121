import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authApi";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/"); 
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            name="email"
            value={form.email}
            onChange={onChange}
            type="email"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            required
          />
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}