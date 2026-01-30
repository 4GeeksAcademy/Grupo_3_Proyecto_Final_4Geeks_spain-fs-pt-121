import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getGroupDetail,
  createSharedExpense,
  getGroupBalances,
  updateSharedExpense,
  deleteSharedExpense,
} from "../services/groups";
import { isLoggedIn } from "../services/auth";

function parseParticipants(text) {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

export default function SharedGroup() {
  const { id } = useParams();
  const logged = isLoggedIn();

  const [detail, setDetail] = useState(null);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState("equal");
  const [participantsText, setParticipantsText] = useState("");

  
  const [editOpen, setEditOpen] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState("");
  const [editParticipantsText, setEditParticipantsText] = useState("");

  async function loadAll() {
    setError("");
    setLoading(true);
    try {
      const d = await getGroupDetail(id);
      setDetail(d);

      const b = await getGroupBalances(id);
      setBalances(b);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (logged) loadAll();
    else setLoading(false);
  }, [logged, id]);

  
  const splitsByExpenseId = useMemo(() => {
    const map = {};
    const rows = detail?.splits || [];
    for (const s of rows) {
      const key = String(s.shared_expense_id);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [detail]);

  async function onCreateExpense(e) {
    e.preventDefault();
    setError("");

    const n = Number(totalAmount);
    if (!title.trim() || !Number.isFinite(n) || n <= 0) {
      setError("Completa título y total_amount (>0).");
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        total_amount: n,
        currency: "USD",
        split_method: splitMethod,
      };

      if (splitMethod === "equal") {
        const participants = parseParticipants(participantsText);
        if (participants.length < 1) {
          setError("En equal debes poner participants (ej: 1,2,3)");
          return;
        }
        payload.participants = participants;
      }

      await createSharedExpense(id, payload);

      setTitle("");
      setTotalAmount("");
      setParticipantsText("");
      await loadAll();
    } catch (e) {
      setError(e.message || "Error creando gasto compartido");
    }
  }

  function openEdit(expense) {
    setEditExpenseId(expense.id);
    setEditTitle(expense.title || "");
    setEditTotalAmount(String(expense.total_amount ?? ""));
    
    const splits = splitsByExpenseId[String(expense.id)] || [];
    const ids = splits.map((s) => s.user_id).join(",");
    setEditParticipantsText(ids);
    setEditOpen(true);
  }

  async function onSaveEdit(e) {
    e.preventDefault();
    setError("");

    const n = Number(editTotalAmount);
    if (!editTitle.trim() || !Number.isFinite(n) || n <= 0) {
      setError("En editar: título y total (>0) son requeridos.");
      return;
    }

    try {
      const payload = {
        title: editTitle.trim(),
        total_amount: n,
        currency: "USD",
        split_method: "equal",
        participants: parseParticipants(editParticipantsText),
      };

      if (!payload.participants || payload.participants.length < 1) {
        setError("En editar: participants debe tener al menos 1 id (ej: 1,2).");
        return;
      }

      await updateSharedExpense(id, editExpenseId, payload);
      setEditOpen(false);
      setEditExpenseId(null);
      await loadAll();
    } catch (e) {
      setError(e.message || "Error editando gasto");
    }
  }

  async function onDelete(expenseId) {
    const ok = confirm("¿Seguro que quieres borrar este gasto compartido?");
    if (!ok) return;

    setError("");
    try {
      await deleteSharedExpense(id, expenseId);
      await loadAll();
    } catch (e) {
      setError(e.message || "Error borrando gasto");
    }
  }

  if (!logged) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Inicia sesión para usar esta sección.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="app-title mb-1">Grupo #{id}</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-muted">Cargando...</div>}

      {!loading && detail && (
        <>
         
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="card app-card p-3">
                <h5 className="mb-2">Miembros</h5>
                <div className="text-muted small mb-2">
                  (Por ahora mostramos IDs porque el backend guarda miembros por user_id)
                </div>
                <ul className="mb-0">
                  {(detail.members || []).map((m) => (
                    <li key={m.id}>
                      user_id: <strong>{m.user_id}</strong> — role: {m.role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card app-card p-3">
                <h5 className="mb-2">Balances</h5>
                {!balances ? (
                  <div className="text-muted">Sin datos</div>
                ) : (
                  <>
                    <div className="mb-2">
                      <strong>Net</strong> (positivo = le deben / negativo = debe):
                      <pre className="mt-2 mb-0">{JSON.stringify(balances.net, null, 2)}</pre>
                    </div>
                    <div>
                      <strong>Transferencias sugeridas</strong>:
                      {(balances.transfers || []).length === 0 ? (
                        <div className="text-muted">No hay transferencias.</div>
                      ) : (
                        <ul className="mb-0">
                          {balances.transfers.map((t, idx) => (
                            <li key={idx}>
                              {t.from_user_id} → {t.to_user_id} : <strong>${t.amount}</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          
          <div className="card app-card p-3 mt-3">
            <h5 className="mb-2">Crear gasto compartido</h5>

            <form onSubmit={onCreateExpense} className="row g-2">
              <div className="col-12 col-md-5">
                <label className="form-label">Título</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cena / Hotel / Uber..."
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Total</label>
                <input
                  className="form-control"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="50"
                  type="number"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Método</label>
                <select
                  className="form-select"
                  value={splitMethod}
                  onChange={(e) => setSplitMethod(e.target.value)}
                >
                  <option value="equal">equal</option>
                  <option value="percent" disabled>
                    percent (luego)
                  </option>
                  <option value="amount" disabled>
                    amount (luego)
                  </option>
                </select>
              </div>

              {splitMethod === "equal" && (
                <div className="col-12">
                  <label className="form-label">Participants (IDs separados por coma)</label>
                  <input
                    className="form-control"
                    value={participantsText}
                    onChange={(e) => setParticipantsText(e.target.value)}
                    placeholder="Ej: 1,2,3"
                  />
                </div>
              )}

              <div className="col-12">
                <button className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>

          
          <div className="card app-card p-3 mt-3">
            <h5 className="mb-2">Gastos del grupo</h5>

            {(detail.shared_expenses || []).length === 0 ? (
              <div className="text-muted">Aún no hay gastos.</div>
            ) : (
              <div className="list-group">
                {detail.shared_expenses.map((e) => {
                  const splits = splitsByExpenseId[String(e.id)] || [];
                  return (
                    <div key={e.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <div className="fw-bold">{e.title}</div>
                          <div className="text-muted small">
                            created_by: {e.created_by} — {new Date(e.date).toLocaleString()}
                          </div>

                          {splits.length > 0 && (
                            <div className="mt-2 text-muted small">
                              <strong>Splits:</strong>{" "}
                              {splits.map((s) => `user ${s.user_id}: $${s.amount}`).join(" | ")}
                            </div>
                          )}
                        </div>

                        <div className="text-end">
                          <div className="fw-bold">${e.total_amount}</div>

                          <div className="d-flex gap-2 justify-content-end mt-2">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => openEdit(e)}>
                              Editar
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(e.id)}>
                              Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          
          {editOpen && (
            <div className="modal-overlay">
              <div className="modal-content p-3" style={{ height: "auto" }}>
                <button className="modal-close" onClick={() => setEditOpen(false)}>
                  ✖
                </button>

                <h5 className="mb-3">Editar gasto compartido</h5>

                <form onSubmit={onSaveEdit} className="row g-2">
                  <div className="col-12">
                    <label className="form-label">Título</label>
                    <input className="form-control" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Total</label>
                    <input
                      className="form-control"
                      type="number"
                      value={editTotalAmount}
                      onChange={(e) => setEditTotalAmount(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Participants (IDs separados por coma)</label>
                    <input
                      className="form-control"
                      value={editParticipantsText}
                      onChange={(e) => setEditParticipantsText(e.target.value)}
                      placeholder="Ej: 1,2,3"
                    />
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary">Guardar cambios</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditOpen(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}