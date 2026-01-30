import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createGroup, listGroups } from "../services/groups";
import { isLoggedIn } from "../services/auth";

export default function Shared() {
  const logged = isLoggedIn();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await listGroups();
      setGroups(data.groups || []);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (logged) load();
    else setLoading(false);
  }, [logged]);

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;

    try {
      await createGroup({ name: name.trim() });
      setName("");
      await load();
    } catch (e) {
      setError(e.message || "Error creando grupo");
    }
  }

  return (
    <div className="container py-4">
      <h2 className="app-title mb-1">Gastos compartidos</h2>
      <p className="text-muted">Crea grupos, añade miembros y divide gastos.</p>

      {!logged && (
        <div className="alert alert-info">
          Para usar Gastos compartidos necesitas iniciar sesión.
        </div>
      )}

      {logged && (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card app-card p-3 mb-3">
            <h5 className="mb-2">Crear grupo</h5>
            <form className="d-flex gap-2" onSubmit={onCreate}>
              <input
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Viaje a Madrid"
              />
              <button className="btn btn-primary" type="submit">
                Crear
              </button>
            </form>
          </div>

          <div className="card app-card p-3">
            <h5 className="mb-3">Mis grupos</h5>

            {loading && <div className="text-muted">Cargando...</div>}

            {!loading && groups.length === 0 && (
              <div className="text-muted">Aún no tienes grupos.</div>
            )}

            {!loading && groups.length > 0 && (
              <div className="list-group">
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    to={`/shared/${g.id}`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex justify-content-between">
                      <strong>{g.name}</strong>
                      <span className="text-muted">#{g.id}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}