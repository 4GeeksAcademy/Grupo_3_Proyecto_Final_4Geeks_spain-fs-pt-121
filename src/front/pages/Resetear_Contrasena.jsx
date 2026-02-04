import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Resetear() {
  const [params] = useSearchParams()
  const navigate = useNavigate();
  const [password, setPassword] = useState("")
  const [repite, setRepite] = useState("")

  function ResetearContrasena() {
    if (password !== repite) {
      alert('Las contraseñas no coinciden')
      return
    }

    let token = params.get('token')

    fetch(`${import.meta.env.VITE_BACKEND_URL}/change-contrasena`, {
      method: 'POST',
      body: JSON.stringify({ password: password }),
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + token
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.success) {
          alert('Contraseña cambiada correctamente!');
          navigate("/login");
        }
        else alert('Error al cambiar contraseña!')
      })
      .catch(error => {
        alert('Error al cambiar contraseña!')
        console.error("Error:", error);
      });
  }

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <form>
        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            className="form-control"
            name="Nueva contraseña"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            className="form-control"
            name="Nueva contraseña"
            type="password"
            onChange={(e) => setRepite(e.target.value)}
          />
        </div>
      </form>
      <button type="button" onClick={ResetearContrasena} className="btn btn-primary w-100">Recuperar Contraseña</button>
    </div>
  );
}