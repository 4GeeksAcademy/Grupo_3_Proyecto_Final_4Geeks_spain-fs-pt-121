import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authApi";

export default function RecuperarContrasena() {
  const [correoEletronico, setCorreoEletronico] = useState("");

  function enviarCorreo() {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/reset-contrasena`, {
      method: 'POST',
      body: JSON.stringify({ email: correoEletronico }),
      headers: { "Content-Type": "application/json" },
    })
      .then(response => response.json())
      .then(data => { 
        if (data && data.success) {
          alert ('Checkea tu correo eletronico!')
        }
        else alert ('Hubo un error!')
        })
      .catch(error => {
        alert ('Hubo un error!')
        console.error("Error:", error);
      });
  }

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <form>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            name="email"
            type="text"
            onChange={(e) => setCorreoEletronico(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            name="email"
            type="text"
            onChange={(e) => setCorreoEletronico(e.target.value)}
          />
        </div>
      </form>
      <button type="button" onClick={enviarCorreo} className="btn btn-primary w-100">Recuperar Contraseña</button>
    </div>
  );
}