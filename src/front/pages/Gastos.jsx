// Import necessary components from react-router-dom and other parts of the application.
import { useState } from "react";
import Modal from "../components/Modal.jsx";
import Cuadro from "../components/Input.jsx";
import {A_Gastos} from "../components/Botoes.jsx";
import ListaGastos from "../components/ListaGastos.jsx";

export default function Gastos() {
  const [aberto, setAberto] = useState(false);

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

      <ListaGastos />
    </div>
  );
}