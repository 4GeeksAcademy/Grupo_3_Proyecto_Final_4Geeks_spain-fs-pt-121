import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export default function Cuadro({ onSaved }) {
  const { store, dispatch } = useGlobalReducer();

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "addGasto" });
    if (onSaved) onSaved();
  }

  return (
    <form className="cuerpo" onSubmit={handleSubmit}>
      <div className="modalR">
      <input className="dados" placeholder="Gasto" onChange={e => dispatch({type:"setGasto", payload:e.target.value})} />
      <input placeholder="Tipo" onChange={e => dispatch({type:"setTipo", payload:e.target.value})} />
      <input placeholder="Descripción" onChange={e => dispatch({type:"setDescripcion", payload:e.target.value})} />
      <div className="GranaDataInp">
      <input type="number" placeholder="Monto" onChange={e => dispatch({type:"setMonto", payload:e.target.value})} />
      <input className="dataInp" type="date" onChange={e => dispatch({type:"setFecha", payload:e.target.value})} />
      </div>
      <button>Guardar</button>
      </div>
    </form>
  );
}