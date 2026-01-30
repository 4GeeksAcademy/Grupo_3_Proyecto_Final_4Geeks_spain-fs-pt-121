import { useState } from "react";
import { BotonEditar, BotonEliminar } from "./Botones.jsx";
import Modal from "./Modal.jsx";
import CuadroEditar from "./InputEditar.jsx";
import { deleteGasto } from "../services/gastos.js";

export default function CardGasto({ id, gasto, tipo, descripcion, monto, fecha, onChanged }) {
  const [aberto, setAberto] = useState(false);

  async function onDelete() {
    const ok = confirm("¿Seguro que quieres eliminar este gasto?");
    if (!ok) return;
    await deleteGasto(id);
    if (onChanged) onChanged();
  }

  return (
    <div className="bodyCards">
      <div className="card">
        <div className="carDG">
          <div>
            <h3>{gasto}</h3>
            <div className="tipo1">{tipo}</div>
            {descripcion && <div className="descricao">{descripcion}</div>}
            <div className="GranaData">
              <div>💲 {monto}</div>
              <div className="data">📅 {fecha}</div>
            </div>
          </div>

          <BotonEditar onClick={() => setAberto(true)} />
          <BotonEliminar onClick={onDelete} />
        </div>

        <Modal isOpen={aberto} onClose={() => setAberto(false)}>
          <h2 className="tituloR">Editar Gasto</h2>
          <CuadroEditar
            id={id}
            onSaved={async () => {
              setAberto(false);
              if (onChanged) onChanged();
            }}
          />
        </Modal>
      </div>
    </div>
  );
}