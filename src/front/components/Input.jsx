import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { createGasto } from "../services/gastos.js";

export default function Cuadro({ onSaved }) {
  const { store, dispatch } = useGlobalReducer();

  async function addGasto(e) {
    e.preventDefault();

    const payload = {
      gasto: store.gasto,
      tipo: store.tipo,
      descripcion: store.descripcion,
      monto: store.monto,
      fecha: store.fecha,
    };
console.log (payload)


    try {
      await createGasto(payload);
      dispatch({ type: "limpiarForm" });
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Error creando gasto:", err);
      alert(err.message || "Error creando gasto");
    }
  }

  return (
    <form className="modalR" onSubmit={addGasto}>
      <input
        value={store.gasto}
        className="dados"
        placeholder="Gasto"
        onChange={(e) => dispatch({ type: "setGasto", payload: e.target.value })}
      />
      <input
        value={store.tipo}
        placeholder="Tipo"
        onChange={(e) => dispatch({ type: "setTipo", payload: e.target.value })}
      />
      <input
        value={store.descripcion}
        placeholder="Descripción"
        onChange={(e) => dispatch({ type: "setDescripcion", payload: e.target.value })}
      />

      <div className="GranaDataInp">
        <input
          value={store.monto}
          type="number"
          placeholder="Monto"
          onChange={(e) => dispatch({ type: "setMonto", payload: e.target.value })}
        />
        <input
          value={store.fecha}
          className="dataInp"
          type="date"
          onChange={(e) => dispatch({ type: "setFecha", payload: e.target.value })}
        />
      </div>

      <button type="submit">Guardar</button>
    </form>
  );
}