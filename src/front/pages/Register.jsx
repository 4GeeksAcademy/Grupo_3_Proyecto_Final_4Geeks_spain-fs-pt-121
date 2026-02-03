import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authApi";

export default function Register() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
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
      await register(form);
      navigate("/"); // o "/login" si prefieres
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <h2>Registro</h2>
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
          <label className="form-label">Username</label>
          <input
            className="form-control"
            name="username"
            value={form.username}
            onChange={onChange}
            type="text"
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
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}