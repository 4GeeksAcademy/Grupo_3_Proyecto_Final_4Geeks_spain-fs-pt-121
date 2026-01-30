export function BotonEditar({ onClick }) {
  return (
    <button className="bot1" onClick={onClick} type="button" title="Editar">
      ✏️
    </button>
  );
}

export function BotonEliminar({ onClick }) {
  return (
    <button className="bot2" onClick={onClick} type="button" title="Eliminar">
      🗑️
    </button>
  );
}

export function A_Gastos({ onClick }) {
  return (
    <button className="AGasto" onClick={onClick} type="button">
      + Agregar Gasto
    </button>
  );
}