import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useEffect } from "react";

export default function Cuadro({ onSaved }) {
  const { store, dispatch } = useGlobalReducer();
  const { theId } = useParams()

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviado!");
  };

  useEffect(() => {
    if (store.gastos.length > 0) {
      console.log(store.gastos);

      const gasto = store.gastos.find(
        (c) => c.id === Number(theId)
      )

      if (gasto) {
        dispatch({ type: "setGasto", payload: gasto.gasto })
        dispatch({ type: "setTipo", payload: gasto.tipo })
        dispatch({ type: "setDescripcion", payload: gasto.descripcion })
        dispatch({ type: "setMonto", payload: gasto.monto })
        dispatch({ type: "setFecha", payload: gasto.fecha })
      }
    }
  }, [store.gastos, theId])

  function saveGasto() {
    const editado = {
      "gasto": store.gasto,
      "tipo": store.tipo,
      "descripcion": store.descripcion,
      "monto": store.monto,
      "fecha": store.fecha
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gasto/${theId}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(editado)
    })
      .then(response => response.json())
      .then(data => {
        console.log("Respuesta del servidor:", data);
        dispatch({ type: 'limpiarForm' })
      })
      .catch(error => {
        console.error("Error:", error);
      });

    if (onSaved) onSaved();
  }

  return (
    <form className="cuerpo" onSubmit={handleSubmit}>
      <div className="modalR">
        <input value={store.gasto} className="dados" placeholder="Gasto" onChange={e => dispatch({ type: "setGasto", payload: e.target.value })} />
        <input value={store.tipo} placeholder="Tipo" onChange={e => dispatch({ type: "setTipo", payload: e.target.value })} />
        <input value={store.descripcion} placeholder="Descripción" onChange={e => dispatch({ type: "setDescripcion", payload: e.target.value })} />
        <div className="GranaDataInp">
          <input value={store.monto} type="number" placeholder="Monto" onChange={e => dispatch({ type: "setMonto", payload: e.target.value })} />
          <input value={store.fecha} className="dataInp" type="date" onChange={e => dispatch({ type: "setFecha", payload: e.target.value })} />
        </div>
        <button onClick={saveGasto}>Guardar</button>
      </div>
    </form>
  );
}