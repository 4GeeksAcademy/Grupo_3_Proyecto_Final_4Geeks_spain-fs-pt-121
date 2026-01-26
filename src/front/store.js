export const initialStore = () => ({
  gastos: [],
  gasto: "",
  tipo: "",
  descripcion: "",
  monto: "",
  fecha: "",
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "limpiarForm":
      return {
        ...store,
        gasto: "",
        tipo: "",
        descripcion: "",
        monto: "",
        fecha: "",
      };
    case "setGasto":
      return { ...store, gasto: action.payload };
    case "setTipo":
      return { ...store, tipo: action.payload };
    case "setDescripcion":
      return { ...store, descripcion: action.payload };
    case "setMonto":
      return { ...store, monto: action.payload };
    case "setFecha":
      return { ...store, fecha: action.payload };
     case "setGastos":
      return { ...store, gastos: action.payload };

    case "addGasto": {
      
      return {
        ...store,
        gastos: [...store.gastos, action.payload],

      };
    }

    case "deleteGasto":
      console.log(action.payload, store.gastos[0].id);
      
      return {
        ...store,
        gastos: store.gastos.filter((c) => c.id !== action.payload),
      };

    case "selectGasto":
      return {
        ...store,
        gastos: action.payload,
        gasto: action.payload.gasto,
        tipo: action.payload.tipo,
        descripcion: action.payload.descripcion,
        monto: action.payload.monto,
        fecha: action.payload.fecha,
      };

    default:
      return store;
  }
}
