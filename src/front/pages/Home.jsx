import { Link } from "react-router-dom";
import { isLoggedIn } from "../services/auth";

export const Home = () => {
  const logged = isLoggedIn();

  return (
    <div className="container py-4">
      <h1 className="app-title mb-1">Control Financiero</h1>
      <p className="text-muted">
        Gestiona tus finanzas de manera inteligente.
      </p>

      {!logged && (
        <div className="alert alert-info">
          Puedes ver la web, pero para usar funciones necesitas iniciar sesión.
          <div className="mt-2 d-flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-outline-primary btn-sm">Registro</Link>
          </div>
        </div>
      )}

      <div className="row g-3 mt-1">
        <div className="col-12 col-md-6">
          <div className="card app-card p-3">
            <div className="text-muted small">Este mes</div>
            <div className="fs-4 fw-bold">$2450.50</div>
            <div className="text-muted">Gastos Totales</div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card app-card p-3">
            <div className="text-muted small">Acumulado</div>
            <div className="fs-4 fw-bold">$1200.00</div>
            <div className="text-muted">Ahorros</div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card app-card p-3">
            <div className="text-muted small">Puntuación</div>
            <div className="fs-4 fw-bold">750</div>
            <div className="text-muted">FinScore</div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card app-card p-3">
            <div className="text-muted small">Disponibles</div>
            <div className="fs-4 fw-bold">150</div>
            <div className="text-muted">Créditos</div>
          </div>
        </div>
      </div>
    </div>
  );
};