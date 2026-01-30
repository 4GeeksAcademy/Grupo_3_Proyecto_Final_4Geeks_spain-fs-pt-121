import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { updateGasto } from "../services/gastos.js";

export default function CuadroEditar({ onSaved, id }) {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const g = store.gastos.find((x) => x.id === Number(id));
    if (g) {
      dispatch({ type: "setGasto", payload: g.gasto });
      dispatch({ type: "setTipo", payload: g.tipo });
      dispatch({ type: "setDescripcion", payload: g.descripcion || "" });
      dispatch({ type: "setMonto", payload: g.monto });
      dispatch({ type: "setFecha", payload: g.fecha });
    }
  }, [id, store.gastos]);

  async function saveGasto(e) {
    e.preventDefault();

    const payload = {
      gasto: store.gasto,
      tipo: store.tipo,
      descripcion: store.descripcion,
      monto: store.monto,
      fecha: store.fecha,
    };

    try {
      await updateGasto(id, payload);
      dispatch({ type: "limpiarForm" });
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Error editando gasto:", err);
      alert(err.message || "Error editando gasto");
    }
  }

  return (
    <form className="modalR" onSubmit={saveGasto}>
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