import { BotonEditar } from "./Botoes.jsx";
import { BotonEliminar } from "./Botoes.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";



export default function CardGasto({ id, gasto, tipo, descripcion, monto, fecha }) {

    const { store, dispatch } = useGlobalReducer()

    const eliminarGasto = async () => {
        console.log('entrado en la function', id);

        await fetch(`https://playground.4geeks.com/contact/agendas/Radamis/contacts/${id}`, {
            method: 'DELETE'
        })
            .then(
                dispatch({
                    type: "deleteGasto",
                    payload: id
                })
            )
            .catch(error => {
                console.error("Error:", error);
            });
    }

    const EditarGasto = async () => {
        dispatch({
            type: "gasto",
            payload: { id, gasto, tipo, descripcion, monto, fecha }
        })
        await fetch(`https://playground.4geeks.com/contact/agendas/Radamis/contacts/${theId}`, {
            method: 'put'
        })
            .then(
                dispatch({
                    type: "deleteGasto",
                    payload: id
                })
            )
            .catch(error => {
                console.error("Error:", error);
            });
    }

    return (
        <div className="card">
            <div className="carDG">
                <div>
                    <h3>{gasto}</h3>
                    <div className="tipo1">
                        <p>{tipo}</p>
                    </div>
                    <div className="descricao">
                        <p>{descripcion}</p>
                    </div>
                    <div className="GranaData">
                        <p>💲 {monto}</p>
                        <p className="data">📅 {fecha}</p>
                    </div>
                </div>
                <div className="bot1">
                    <BotonEditar />
                </div>
                <div className="bot2">
                    <BotonEliminar />
                </div>
            </div>
        </div>
    );
}