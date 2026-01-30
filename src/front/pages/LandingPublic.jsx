import React from "react";
import { Link } from "react-router-dom";

import heroImg from "../assets/Finzat.png";
import featureDashboard from "../assets/Finzat.png";
import featureSplit from "../assets/Finzat.png";
import featureSearch from "../assets/finza-logo-embedded.svg";

export const LandingPublic = () => {
  return (
    <div className="container py-5">
      <div className="row align-items-center g-4 mb-5">
        <div className="col-12 col-lg-6">
          <span className="badge text-bg-success mb-3 px-3 py-2">
            Nuevo • Gratis para empezar
          </span>

          <h1 className="fw-bold mb-3">Controla tus gastos sin complicarte</h1>

          <p className="text-secondary mb-4">
            Registra gastos en segundos, mira tus categorías y divide cuentas con amigos.
          </p>

          <div className="d-grid gap-2 mb-4">
            <div className="d-flex gap-3 align-items-start">
              <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                <span className="fw-bold">1</span>
              </div>
              <div>
                <div className="fw-semibold">Crea tu cuenta</div>
                <div className="text-secondary small">Te toma menos de 1 minuto.</div>
              </div>
            </div>

            <div className="d-flex gap-3 align-items-start">
              <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                <span className="fw-bold">2</span>
              </div>
              <div>
                <div className="fw-semibold">Registra tus gastos</div>
                <div className="text-secondary small">Categorías, notas y filtros.</div>
              </div>
            </div>

            <div className="d-flex gap-3 align-items-start">
              <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                <span className="fw-bold">3</span>
              </div>
              <div>
                <div className="fw-semibold">Mira tu resumen</div>
                <div className="text-secondary small">Dashboard mensual con gráficos.</div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/register" className="btn btn-success px-4">Registrarme</Link>
            <Link to="/login" className="btn btn-outline-dark px-4">Entrar</Link>
          </div>

          <div className="mt-4">
            <ul className="text-secondary mb-0">
              <li>Gastos + categorías</li>
              <li>Resumen mensual automático</li>
              <li>Split de cuentas</li>
              <li>Filtros por fecha / categoría / importe</li>
            </ul>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <img src={heroImg} alt="Vista previa de la app" className="img-fluid rounded-4 shadow-sm" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm rounded-4 border-0">
            <img src={featureDashboard} className="card-img-top rounded-top-4" alt="Dashboard" />
            <div className="card-body">
              <h5 className="card-title fw-bold">Tu resumen en una vista</h5>
              <p className="card-text text-secondary mb-0">
                Totales del mes, gráficos y categorías para entender en qué se te va el dinero.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm rounded-4 border-0">
            <img src={featureSplit} className="card-img-top rounded-top-4" alt="Split" />
            <div className="card-body">
              <h5 className="card-title fw-bold">Divide cuentas</h5>
              <p className="card-text text-secondary mb-0">
                Añade participantes y calcula cuánto debe cada uno (piso, viajes, cenas).
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm rounded-4 border-0">
            <img src={featureSearch} className="card-img-top rounded-top-4" alt="Filtros" />
            <div className="card-body">
              <h5 className="card-title fw-bold">Busca y filtra rápido</h5>
              <p className="card-text text-secondary mb-0">
                Filtra por fecha/categoría/importe y encuentra cualquier gasto en segundos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-4 bg-light border">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h4 className="fw-bold mb-1">Empieza hoy</h4>
            <p className="text-secondary mb-0">Crea tu cuenta y prueba la app en minutos.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/register" className="btn btn-success px-4">Crear cuenta</Link>
            <Link to="/login" className="btn btn-outline-dark px-4">Ya tengo cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
};