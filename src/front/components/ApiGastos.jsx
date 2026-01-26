export function ObtenerGastos(){
    return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gasto`)
      .then(res => res.json())
      .catch(err => console.error(err));
  
}

export function EditarGastos (editado, id){
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gasto/${id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(editado)
    })
      .then(response => response.json())
      .catch(error => {
        console.error("Error:", error);
      });
}

export function EliminarGastos(id) {
  if (!id) {
    console.error("ID inválido:", id);
    return;
  }
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gasto/${id}`, {
    method: "DELETE",
  })
  .then(res => res.json());
}