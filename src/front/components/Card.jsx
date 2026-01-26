import { useState } from "react";
import { BotonEditar } from "./Botoes.jsx";
import { BotonEliminar } from "./Botoes.jsx";
import Modal from "./Modal.jsx";
import CuadroEditar from "./InputEditar.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { EliminarGastos} from "./ApiGastos.jsx";



export default function CardGasto({ id, gasto, tipo, descripcion, monto, fecha }) {

    const { store, dispatch } = useGlobalReducer()
    const [aberto, setAberto] = useState({show:false, id:null});

    /*useEffect(() => {
    EliminarGastos().then(data => { dispatch({ type: "deleteGastos",
          payload: data }); })
      }, []);*/


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
                    <BotonEditar onClick={() => setAberto({show:true, id:id})} />
                </div>
                <div className="bot2">
                    <BotonEliminar onClick={() =>EliminarGastos} />
                </div>
                <Modal isOpen={aberto.show} onClose={() => setAberto({show:false, id:null})}>
                    <h2 className="tituloR">Gasto</h2>
                    <CuadroEditar onSaved={() => setAberto({show:false, id:null})} id={id} />
                </Modal>
            </div>
        </div>
    );
}