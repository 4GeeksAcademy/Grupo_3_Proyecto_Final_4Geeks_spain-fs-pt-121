import { useEffect, useState } from "react";
import Modal from "../components/Modal.jsx";
import Cuadro from "../components/Input.jsx";
import { A_Gastos } from "../components/Botones.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardGasto from "../components/Card.jsx";
import { listGastos } from "../services/gastos.js";
import { isLoggedIn } from "../services/auth";

export default function Gastos() {
  const logged = isLoggedIn();
  const [aberto, setAberto] = useState(false);
  const [error, setError] = useState("");
  const { store, dispatch } = useGlobalReducer();

  async function load() {
    setError("");
    try {
      const data = await listGastos();
      dispatch({ type: "setGastos", payload: data });
    } catch (e) {
      setError(e.message || "Error listando gastos");
    }
  }

  useEffect(() => {
    if (logged) load();
  }, [logged]);

  if (!logged) {
    return (
      <div className="container py-4">
        <h2>Gastos</h2>
        <p>Inicia sesión para usar Gastos.</p>
      </div>
    );
  }

  return (
    <div className="paginaR">
      <div className="Gastos">
        <h1 className="texto-animado">Mis Gastos</h1>
        <A_Gastos onClick={() => setAberto(true)} />
      </div>

      {error && <div className="alert fx-alert">{error}</div>}

      <Modal isOpen={aberto} onClose={() => setAberto(false)}>
        <h2 className="tituloR">Nuevo Gasto</h2>
        <Cuadro
          onSaved={async () => {
            setAberto(false);
            await load();
          }}
        />
      </Modal>

      {store.gastos && store.gastos.length > 0 ? (
        store.gastos.map((g) => <CardGasto key={g.id} {...g} onChanged={load} />)
      ) : (
        <p>Nenhum gasto encontrado.</p>
      )}
    </div>
  );
}