import React, { useEffect, useMemo, useState } from "react";
import { convertFx } from "../services/fx";
import { useFxRates } from "../hooks/useFxRates";
import "../index.css";

const POPULAR_PAIRS = [
  ["USD", "EUR"],
  ["EUR", "USD"],
  ["USD", "MXN"],
  ["GBP", "USD"]
];

export const Divisas = () => {
  const [amount, setAmount] = useState("100");
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("EUR");

  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);

  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState(null);

  const ratesState = useFxRates(fromCur);

  const currencyOptions = useMemo(() => {
    const rates = ratesState?.data?.data?.rates || {};
    const set = new Set([fromCur, ...Object.keys(rates)]);
    return Array.from(set).sort();
  }, [ratesState?.data, fromCur]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setConvertError(null);

      const n = Number(amount);
      if (!amount || Number.isNaN(n) || n < 0) {
        setResult(null);
        setRate(null);
        setConvertError("El monto debe ser un número válido (>= 0)");
        return;
      }

      setConvertLoading(true);
      try {
        const data = await convertFx(fromCur, toCur, n);
        if (!alive) return;
        setResult(data.result);
        setRate(data.rate);
      } catch (e) {
        if (!alive) return;
        setConvertError(e.message || "Error al convertir");
        setResult(null);
        setRate(null);
      } finally {
        if (alive) setConvertLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [amount, fromCur, toCur]);

  function swap() {
    setFromCur(toCur);
    setToCur(fromCur);
  }

  async function refreshPopular() {
    try {
      localStorage.removeItem(`fx_rates_${fromCur}`);
    } catch {}
    setAmount((a) => `${a}`);
  }

  
  const badgeClass =
    ratesState.loading
      ? "fx-badge-loading"
      : ratesState.data?.source === "cache"
      ? "fx-badge-cache"
      : "fx-badge-ok";

  const badgeText = ratesState.loading ? "loading" : (ratesState.data?.source || "ok");

  return (
    <div>
      <div className="container fx-container py-4">
      
        <div className="card fx-card border-0">
          <div className="card-body p-4">
            <h4 className="mb-1 fx-title">Divisas</h4>
            <div className="fx-subtitle mb-4">
            
            </div>

           
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-6">
                <label className="form-label">Monto</label>
                <input
                  className="form-control form-control-lg fx-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">De</label>
                <select
                  className="form-select form-select-lg fx-select"
                  value={fromCur}
                  onChange={(e) => setFromCur(e.target.value)}
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">A</label>
                <select
                  className="form-select form-select-lg fx-select"
                  value={toCur}
                  onChange={(e) => setToCur(e.target.value)}
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

           
            <div className="d-flex justify-content-center my-3">
              <button className="fx-swap" onClick={swap} title="Cambiar">
                ⇄
              </button>
            </div>

           
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <div className="p-3 fx-resultBox">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Resultado</div>
                      <div className="fx-resultValue">
                        {convertLoading ? "Convirtiendo..." : (result ?? "--")}
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="text-muted small">Tasa</div>
                      <div className="fx-ratePill">
                        {rate ? `1 ${fromCur} = ${Number(rate).toFixed(4)} ${toCur}` : "--"}
                      </div>
                    </div>
                  </div>

                  {convertError && (
                    <div className="fx-alert mt-3 mb-0 p-3">
                      {convertError}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 fx-resultBox h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">Estado rates</div>
                    <span className={`fx-badge ${badgeClass}`}>{badgeText}</span>
                  </div>

                  <div className="text-muted small mt-2">Base: {fromCur}</div>

                  {ratesState.error && (
                    <div className="alert alert-warning mt-3 mb-0">
                      {ratesState.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

       
        <div className="card fx-sectionCard border-0 mt-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fx-sectionTitle">Conversiones Populares</h5>
              <button className="fx-refresh" onClick={refreshPopular} title="Refrescar">
                ↻
              </button>
            </div>

            <PopularConversions />
          </div>
        </div>

        
        <div className="card fx-sectionCard border-0 mt-4">
          <div className="card-body p-4">
           <h5 className="mb-3 fx-sectionTitle">Monedas disponibles</h5>

            {ratesState.loading && <div className="text-muted">Cargando monedas...</div>}

            {!ratesState.loading && (
              <div className="row g-3">
                {currencyOptions.slice(0, 12).map((c) => (
                  <div className="col-6 col-md-4 col-lg-3" key={c}>
                    <div className="fx-currency h-100">
                      <div className="fx-currencyTop">
                        <div className="fx-code">{c}</div>
                      </div>
                      <div className="fx-mini mt-1">Disponible</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

function PopularConversions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const results = [];
      for (const [from, to] of POPULAR_PAIRS) {
        const data = await convertFx(from, to, 1);
        results.push({ from, to, rate: data.rate });
      }
      setRows(results);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="text-muted">Cargando conversiones...</div>;

  return (
    <div className="row g-3">
      {rows.map((r) => (
        <div className="col-12 col-md-6" key={`${r.from}-${r.to}`}>
          <div className="fx-pair d-flex justify-content-between align-items-center">
            <div className="fw-semibold">
              {r.from} ⇄ {r.to}
            </div>
            <div className="fx-pairRate">{Number(r.rate).toFixed(4)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}