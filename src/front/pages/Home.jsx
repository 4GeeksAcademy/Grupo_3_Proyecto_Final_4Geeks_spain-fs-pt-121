import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../services/auth";
import { apiGet } from "../services/api";

export const Home = () => {
  const logged = isLoggedIn();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await apiGet("/api/dashboard/summary");
      setSummary(data);
    } catch (e) {
      setError(e.message || "Error cargando resumen");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (logged) load();
    else setLoading(false);
  }, [logged]);

  return (
    <div className="container py-4">
      <h1 className="app-title mb-1">Finza</h1>
      <p className="text-muted">
        Control simple: gastos, divisas, grupos y tu FinScore.
      </p>

      {!logged && (
        <div className="alert alert-info">
          Puedes ver la web, pero para usar funciones necesitas iniciar sesión.
          <div className="mt-2 d-flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-outline-primary btn-sm">Registro</Link>
          </div>
        </div>
      )}

      {logged && (
        <>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="text-muted">Cargando resumen...</div>}

          {!loading && summary && (
            <div className="row g-3 mt-1">
              <div className="col-12 col-md-6">
                <div className="card app-card p-3">
                  <div className="text-muted small">Gastos (total)</div>
                  <div className="fs-4 fw-bold">${summary.total_gastos}</div>
                  <div className="text-muted">Desde tu módulo de gastos</div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card app-card p-3">
                  <div className="text-muted small">Ahorros (mi cuenta)</div>
                  <div className="fs-4 fw-bold">${summary.total_ahorro}</div>
                  <div className="text-muted">Registrados en FinScore</div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card app-card p-3">
                  <div className="text-muted small">Créditos</div>
                  <div className="fs-4 fw-bold">{summary.credits}</div>
                  <div className="text-muted">Rewards acumulados</div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card app-card p-3">
                  <div className="text-muted small">Accesos rápidos</div>
                  <div className="d-flex gap-2 flex-wrap mt-2">
                    <Link className="btn btn-primary btn-sm" to="/gastos">Gastos</Link>
                    <Link className="btn btn-outline-primary btn-sm" to="/groups">Grupos</Link>
                    <Link className="btn btn-outline-primary btn-sm" to="/finscore">FinScore</Link>
                    <Link className="btn btn-outline-dark btn-sm" to="/divisas">Divisas</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
