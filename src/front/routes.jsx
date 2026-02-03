import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Divisas } from "./pages/Divisas";
import Login from "./pages/Login";
import Register from "./pages/Register";
import  Gastos  from "./pages/Gastos";
import RecuperarContrasena from "./pages/Recuperar_Contrasena";
import Resetear from "./pages/Resetear_Contrasena";


function ComingSoon({ title }) {
  return (
    <div className="container py-4">
      <h2>{title}</h2>
      <p className="text-muted">Pantalla en construcción 👷‍♂️</p>
    </div>
  );
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      <Route path="/divisas" element={<Divisas />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recuperar" element={<RecuperarContrasena />} />
      <Route path="/resetear" element={<Resetear />} />

      <Route path="/gastos" element={<Gastos />} />
      <Route path="/finscore" element={<ComingSoon title="FinScore" />} />
    </Route>
  )
);