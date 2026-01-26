// Import necessary components from react-router-dom and other parts of the application.
import { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import Cuadro from "../components/Input.jsx";
import { A_Gastos } from "../components/Botoes.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardGasto from "../components/Card.jsx";

export default function Gastos() {
  const [aberto, setAberto] = useState(false);

  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gasto`)
      .then(res => res.json())
      .then(data => {
        dispatch({
          type: "setGastos",
          payload: data
        });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="paginaR">
      <div className="Gastos">
        <h1 className="texto-animado">Mi Gastos</h1>
        <A_Gastos onClick={() => setAberto(true)} />
      </div>
      <Modal isOpen={aberto} onClose={() => setAberto(false)}>
        <h2 className="tituloR">Nuevo Gasto</h2>
        <Cuadro onSaved={() => setAberto(false)} />
      </Modal>
      <div className="bodyCards">
        <ul>
          {store.gastos && store.gastos.length > 0 ? (
            store.gastos.map((gasto) => (
              <li key={gasto.id} className="list-group-item">
                <CardGasto
                  id={gasto.id}
                  gasto={gasto.gasto}
                  tipo={gasto.tipo}
                  descripcion={gasto.descripcion}
                  monto={gasto.monto}
                  fecha={gasto.fecha}
                />
              </li>
            ))
          ) : (
            <p>Nenhum gasto encontrado.</p>
          )}
        </ul>
      </div>
    </div>
  );
}