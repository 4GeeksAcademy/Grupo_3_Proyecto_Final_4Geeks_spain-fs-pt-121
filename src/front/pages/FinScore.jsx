
import { useEffect, useState } from "react";
import { isLoggedIn } from "../services/auth";
import { createSaving, getFinScore, getRewardsBalance, getRewardsHistory } from "../services/finscore";

export default function FinScore() {
  const logged = isLoggedIn();

  const [score, setScore] = useState(null);
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState("50");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setError("");
    setLoading(true);
    try {
      const s = await getFinScore();
      const b = await getRewardsBalance();
      const h = await getRewardsHistory();
      setScore(s);
      setBalance(b);
      setHistory(h.history || []);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (logged) loadAll();
    else setLoading(false);
  }, [logged]);

  async function onCreateSaving(e) {
    e.preventDefault();
    setError("");

    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("El ahorro debe ser un número > 0");
      return;
    }

    try {
      await createSaving(n);
      await loadAll();
    } catch (e) {
      setError(e.message || "Error registrando ahorro");
    }
  }

  if (!logged) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Inicia sesión para ver tu FinScore.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="app-title mb-1">FinScore</h2>
      <p className="text-muted">Tu puntuación se basa en los créditos generados por ahorro.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-muted">Cargando...</div>}

      {!loading && score && (
        <>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card app-card p-3">
                <div className="text-muted small">Score</div>
                <div className="fs-2 fw-bold">{score.score}</div>
                <div className="text-muted">Level {score.level}</div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card app-card p-3">
                <div className="text-muted small">Créditos</div>
                <div className="fs-2 fw-bold">{score.credits}</div>
                <div className="text-muted">Acumulados</div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card app-card p-3">
                <div className="text-muted small">Valor (USD)</div>
                <div className="fs-2 fw-bold">{balance?.value_usd ?? "--"}</div>
                <div className="text-muted">Balance rewards</div>
              </div>
            </div>
          </div>

          <div className="card app-card p-3 mt-3">
            <h5 className="mb-2">Registrar ahorro (MVP)</h5>
            <form onSubmit={onCreateSaving} className="d-flex gap-2">
              <input
                className="form-control"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50"
              />
              <button className="btn btn-primary">Registrar</button>
            </form>
            <div className="text-muted small mt-2">
              Regla actual: 1 crédito por cada $10 ahorrados.
            </div>
          </div>

          <div className="card app-card p-3 mt-3">
            <h5 className="mb-2">Historial</h5>
            {history.length === 0 ? (
              <div className="text-muted">Aún no hay movimientos.</div>
            ) : (
              <div className="list-group">
                {history.map((r) => (
                  <div key={r.id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">{r.reason}</span>
                      <span className="text-muted">
                        {r.credits_delta > 0 ? `+${r.credits_delta}` : r.credits_delta} créditos
                      </span>
                    </div>
                    <div className="text-muted small">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}