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

    case "addGasto":
      return {
        ...store,
        gastos: [
          ...store.gastos,
          {
            gasto: store.gasto,
            tipo: store.tipo,
            descripcion: store.descripcion,
            monto: store.monto,
            fecha: store.fecha,
          },
        ],
        gasto: "",
        tipo: "",
        descripcion: "",
        monto: "",
        fecha: "",
      };

    default:
      return store;
  }
}
