import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Groups() {
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function load() {
    setError("");
    try {
      const data = await apiGet("/api/groups");
      setGroups(data.groups || []);
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      await apiPost("/api/groups", { name: trimmed });
      setName("");
      await load();
    } catch (e) {
      setError(e.message || "No se pudo crear el grupo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h2 className="mb-3">Mis grupos</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Crear grupo</h5>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Ej: Viaje Madrid"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn-success" onClick={onCreate} disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Mis grupos</h5>

          {groups.length === 0 ? (
            <div className="text-muted">No tienes grupos aún.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="d-flex align-items-center justify-content-between border rounded px-3 py-2"
                  role="button"
                  onClick={() => navigate(`/groups/${g.id}`)}
                >
                  <div className="fw-semibold">{g.name}</div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">#{g.id}</span>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = confirm(
                          `¿Eliminar el grupo "${g.name}"? Esto borrará gastos y miembros del grupo.`
                        );
                        if (!ok) return;

                        try {
                          await apiDelete(`/api/groups/${g.id}`);
                          await load();
                        } catch (err) {
                          alert(err.message || "No se pudo eliminar el grupo");
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}