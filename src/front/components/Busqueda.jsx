import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Busqueda() {
  const { store, dispatch } = useGlobalReducer();
  const [texto, setTexto] = useState("");

  function handleSearch(e) {
    e.preventDefault();

    const filtro = texto.toLowerCase().trim();

    const gastosFiltrados = store.gastosOriginales.filter(gasto =>
      gasto.tipo.toLowerCase().includes(filtro)
    );

    dispatch({
      type: "setGastos",
      payload: gastosFiltrados
    });
  }

  function limpiarFiltro() {
    dispatch({
      type: "setGastos",
      payload: store.gastosOriginales
    });
  }

  return (
    <div className="busqueda">
      <form className="d-flex" role="search" onSubmit={handleSearch}>
        <input
          className="form-control me-2 cuadoBusqueda"
          type="search"
          placeholder="Buscar por tipo..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <button className="btn btn-outline-success botonesBus" type="submit">
          Search
        </button>

        <button 
          className="btn btn-outline-secondary ms-2 Letras" type="button"
          onClick={limpiarFiltro} >
          <div> Ver todos </div>
        </button>
      </form>
    </div>
  );
}