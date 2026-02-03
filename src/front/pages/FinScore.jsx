import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";

export default function FinScore() {
  const [score, setScore] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [totalSavings, setTotalSavings] = useState(null);

  const [amount, setAmount] = useState("50");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setError("");
    try {
      const [scoreData, rewardsData, totalSavingsData] = await Promise.all([
        apiGet("/api/finscore"),
        apiGet("/api/rewards/balance"),
        apiGet("/api/savings/total"),
      ]);
      setScore(scoreData);
      setRewards(rewardsData);
      setTotalSavings(totalSavingsData);
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave() {
    setLoading(true);
    setError("");
    try {
      await apiPost("/api/savings", { amount: Number(amount), currency: "USD" });
      await load();
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>
      <h2 className="mb-2">FinScore</h2>
      <p className="text-muted">Tu puntuación se basa en los créditos generados por ahorro.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Score</div>
              <div className="display-6 fw-bold">{score?.score ?? "--"}</div>
              <div className="text-muted">Level {score?.level ?? "--"}</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Créditos</div>
              <div className="display-6 fw-bold">{rewards?.credits ?? "--"}</div>
              <div className="text-muted">Acumulados</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Ahorro total</div>
              <div className="display-6 fw-bold">
                {totalSavings ? `$${totalSavings.total_savings}` : "--"}
              </div>
              <div className="text-muted">USD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Registrar ahorro (MVP)</h5>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
            />
            <button className="btn btn-success" onClick={onSave} disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
          <div className="text-muted mt-2">Regla actual: 1 crédito por cada $10 ahorrados.</div>
        </div>
      </div>
    </div>
  );
}