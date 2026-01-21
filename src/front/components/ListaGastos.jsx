import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardGasto from "./Card.jsx";

export default function ListaGastos() {
  const { store } = useGlobalReducer();

  return (
    <div>
      {store.gastos.map((g, i) => (
        <CardGasto key={i} {...g} />
      ))}
    </div>
  );
}