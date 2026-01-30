
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createGroup, listGroups } from "../services/groups";
import { isLoggedIn } from "../services/auth";

export default function Groups() {
  const logged = isLoggedIn();

  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await listGroups();
      setRows(data.groups || []);
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

    if (!name.trim()) {
      setError("Pon un nombre para el grupo");
      return;
    }

    try {
      await createGroup({ name: name.trim() });
      setName("");
      await load();
    } catch (e) {
      setError(e.message || "Error creando grupo");
    }
  }

  if (!logged) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Inicia sesión para usar grupos.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="app-title mb-1">Mis Grupos</h2>
      <p className="text-muted">Crea un grupo y entra para dividir gastos.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-muted">Cargando...</div>}

      <div className="card app-card p-3 mb-3">
        <h5 className="mb-2">Crear grupo</h5>
        <form onSubmit={onCreate} className="d-flex gap-2">
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Viaje Madrid"
          />
          <button className="btn btn-primary">Crear</button>
        </form>
      </div>

      <div className="card app-card p-3">
        <h5 className="mb-2">Mis grupos</h5>

        {rows.length === 0 ? (
          <div className="text-muted">Aún no tienes grupos.</div>
        ) : (
          <div className="list-group">
            {rows.map((g) => (
              <Link key={g.id} to={`/groups/${g.id}`} className="list-group-item list-group-item-action">
                <div className="d-flex justify-content-between">
                  <span className="fw-semibold">{g.name}</span>
                  <span className="text-muted">#{g.id}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}