import { BotonEditar } from "./Botoes.jsx";
import { BotonEliminar } from "./Botoes.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";



export default function CardGasto({ id, gasto, tipo, descripcion, monto, fecha }) {

    const { store, dispatch } = useGlobalReducer()

    
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
                    <BotonEditar onClick={() => setAberto(true)} />
                </div>
                <div className="bot2">
                    <BotonEliminar />
                </div>
            </div>
        </div>
    );
}