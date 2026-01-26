import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export default function Cuadro({ onSaved }) {
    const { store, dispatch } = useGlobalReducer();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Enviado!");
    };

    function addGasto() {
        const newGasto = {
            "gasto": store.gasto,   
            "tipo": store.tipo,
            "descripcion": store.descripcion,
            "monto": store.monto,
            "fecha": store.fecha
        }
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gasto`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGasto)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Respuesta del servidor:", data);
                dispatch({ type: 'limpiarForm' })
                dispatch({type: 'addGasto', payload: data})
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
                <button onClick={addGasto}>Guardar</button>
            </div>
        </form>
    );
}