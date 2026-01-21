import { BotonEditar } from "./Botoes.jsx";
import { BotonEliminar } from "./Botoes.jsx";



export default function CardGasto({ gasto, tipo, descripcion, monto, fecha }) {
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