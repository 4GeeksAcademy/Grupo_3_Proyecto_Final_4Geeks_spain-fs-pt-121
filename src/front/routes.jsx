
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";

import { Layout } from "./pages/Layout";
import { HomeGate } from "./pages/HomeGate";
import { Divisas } from "./pages/Divisas";
import Gastos from "./pages/Gastos";
import Groups from "./pages/Groups";
import SharedGroup from "./pages/SharedGroup";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FinScore from "./pages/FinScore";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route index element={<HomeGate />} />

      <Route path="divisas" element={<Divisas />} />
      <Route path="gastos" element={<Gastos />} />
      <Route path="groups" element={<Groups />} />
      <Route path="groups/:id" element={<SharedGroup />} />

      <Route path="finscore" element={<FinScore />} />

      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>
  )
);