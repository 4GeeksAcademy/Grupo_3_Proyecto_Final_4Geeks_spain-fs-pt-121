import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../services/api";

// helpers
function currency(n) {
  const x = Number(n || 0);
  return x.toLocaleString("es-ES", { style: "currency", currency: "USD" });
}

function pct(a, b) {
  const A = Number(a || 0);
  const B = Number(b || 0);
  const total = A + B;
  if (!total) return 0;
  return Math.round((A / total) * 100);
}

function Home() {
  const [dash, setDash] = useState(null);
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [d, m] = await Promise.all([
          apiGet("/api/dashboard"),
          apiGet("/api/market"),
        ]);
        if (!mounted) return;
        setDash(d);
        setMarket(m);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Error cargando inicio");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const gastosPorTipo = useMemo(() => {
    const items = dash?.charts?.gastos_por_tipo || [];
    const total = items.reduce((acc, x) => acc + Number(x.total || 0), 0);
    return { items, total };
  }, [dash]);

  const gastosPorMes = useMemo(() => {
    const items = dash?.charts?.gastos_por_mes || [];
    const max = items.reduce((acc, x) => Math.max(acc, Number(x.total || 0)), 0);
    return { items, max };
  }, [dash]);

  const totals = dash?.totals || {};
  const ratioAhorro = pct(totals.ahorros_mes, totals.gastos_mes);

  if (loading) {
    return (
      <div className="container py-4">
        <h1 className="mb-2" style={{ color: "var(--brand, #19b3b3)" }}>
          Finza
        </h1>
        <div className="text-muted">Cargando tu resumen…</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-1" style={{ color: "var(--brand, #19b3b3)" }}>
        Finza
      </h1>
      <p className="text-muted mb-4">
        Control simple: gastos, divisas, grupos y tu FinScore.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Gastos (este mes)</div>
              <div className="fs-2 fw-bold">{currency(totals.gastos_mes)}</div>
              <div className="text-muted">
                Total histórico: {currency(totals.gastos_total)}
              </div>
              <div className="mt-3">
                <Link className="btn btn-outline-primary btn-sm" to="/gastos">
                  Ver gastos
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Ahorros (este mes)</div>
              <div className="fs-2 fw-bold">{currency(totals.ahorros_mes)}</div>
              <div className="text-muted">
                Total histórico: {currency(totals.ahorros_total)}
              </div>

              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Ratio ahorro</small>
                  <small className="fw-semibold">{ratioAhorro}%</small>
                </div>
                <div className="progress" style={{ height: 10 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${ratioAhorro}%` }}
                    aria-valuenow={ratioAhorro}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>

              <div className="mt-3">
                <Link className="btn btn-outline-primary btn-sm" to="/finscore">
                  Ver FinScore
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Créditos</div>
              <div className="fs-2 fw-bold">{Number(totals.credits || 0)}</div>
              <div className="text-muted">Nivel {totals.finscore_level || 1}</div>
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Link className="btn btn-primary btn-sm" to="/gastos">
                  Gastos
                </Link>
                <Link className="btn btn-outline-primary btn-sm" to="/finscore">
                  FinScore
                </Link>
                <Link className="btn btn-outline-secondary btn-sm" to="/divisas">
                  Divisas
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted">Mercado hoy</div>
                  <div className="fw-semibold">Actualidad financiera</div>
                </div>
                <span className="badge bg-light text-dark">
                  {market?.source || "live"}
                </span>
              </div>

              <hr />

              <div className="row g-2">
                <div className="col-6">
                  <div className="small text-muted">EUR/USD</div>
                  <div className="fw-bold">{market?.fx?.eur_usd ?? "—"}</div>
                </div>
                <div className="col-6">
                  <div className="small text-muted">USD/EUR</div>
                  <div className="fw-bold">{market?.fx?.usd_eur ?? "—"}</div>
                </div>

                <div className="col-6">
                  <div className="small text-muted">BTC (USD)</div>
                  <div className="fw-bold">
                    {market?.crypto?.btc_usd ? `$${market.crypto.btc_usd}` : "—"}
                    <span className="ms-2 small text-muted">
                      ({market?.crypto?.btc_24h ?? "—"}%)
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="small text-muted">ETH (USD)</div>
                  <div className="fw-bold">
                    {market?.crypto?.eth_usd ? `$${market.crypto.eth_usd}` : "—"}
                    <span className="ms-2 small text-muted">
                      ({market?.crypto?.eth_24h ?? "—"}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 small text-muted">
                *Datos informativos (CoinGecko + Frankfurter).
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="fw-semibold mb-2">Gastos por tipo</div>

              {gastosPorTipo.items.length === 0 ? (
                <div className="text-muted">Sin datos todavía.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {gastosPorTipo.items.map((x) => {
                    const total = Number(x.total || 0);
                    const p = gastosPorTipo.total
                      ? Math.round((total / gastosPorTipo.total) * 100)
                      : 0;

                    return (
                      <div key={x.tipo}>
                        <div className="d-flex justify-content-between">
                          <div className="fw-semibold">{x.tipo}</div>
                          <div className="text-muted small">
                            {currency(total)} · {p}%
                          </div>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className="progress-bar"
                            style={{ width: `${p}%` }}
                            role="progressbar"
                            aria-valuenow={p}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="fw-semibold mb-2">Gastos últimos meses</div>

              {gastosPorMes.items.length === 0 ? (
                <div className="text-muted">Sin datos todavía.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {gastosPorMes.items.map((x) => {
                    const total = Number(x.total || 0);
                    const w = gastosPorMes.max
                      ? Math.round((total / gastosPorMes.max) * 100)
                      : 0;

                    return (
                      <div key={x.month}>
                        <div className="d-flex justify-content-between">
                          <div className="fw-semibold">{x.month}</div>
                          <div className="text-muted small">{currency(total)}</div>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className="progress-bar"
                            style={{ width: `${w}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-semibold">Tus grupos</div>
          </div>

          {dash?.groups?.length ? (
            <div className="list-group">
              {dash.groups.map((g) => {
                const gid = g.group_id ?? g.id ?? g.group?.id;
                const net = Number(g.net_me ?? g.net ?? 0);
                const label =
                  net > 0 ? "Te deben" : net < 0 ? "Debes" : "Balanceado";

                return (
                  <div
                    key={gid ?? `${g.name}-${Math.random()}`}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold">
                        {g.name || `Grupo #${gid}`}
                      </div>
                      <div className="small text-muted">
                        {label}:{" "}
                        <span className="fw-semibold">
                          {currency(Math.abs(net))}
                        </span>
                      </div>

                      {g.suggested_transfer?.amount ? (
                        <div className="small text-muted">
                          Sugerencia:{" "}
                          {g.suggested_transfer.from_user_id
                            ? `Paga $${g.suggested_transfer.amount} al usuario ${g.suggested_transfer.to_user_id}`
                            : `Recibe $${g.suggested_transfer.amount} del usuario ${g.suggested_transfer.from_user_id}`}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted">No tienes grupos todavía.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export { Home };
export default Home;