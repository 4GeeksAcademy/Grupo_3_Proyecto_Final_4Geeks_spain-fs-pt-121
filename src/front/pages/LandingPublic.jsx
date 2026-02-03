import React from "react";
import { Link } from "react-router-dom";
import finzaLogo from "../assets/finza-logo-embedded.svg";

export const LandingPublic = () => {
  return (
    <div style={{ background: "var(--bg, #eaf7f7)", minHeight: "100vh" }}>
      {/* HERO */}
      <section className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span
              className="badge rounded-pill mb-3"
              style={{
                background: "rgba(25,179,179,.12)",
                color: "var(--brand, #19b3b3)",
                border: "1px solid rgba(25,179,179,.25)",
              }}
            >
              Nuevo - entiende y comparte tus finanzas
            </span>

            <h1 className="display-5 fw-bold mb-3" style={{ color: "#0b1b2a" }}>
              Controla tus gastos sin complicarte
            </h1>

            <p className="lead text-muted mb-4" style={{ maxWidth: 560 }}>
              Registra gastos en segundos, analiza por categorías, y divide cuentas en
              grupos con balances claros. Todo en una misma app.
            </p>

            <div className="d-flex gap-2 flex-wrap mb-4">
              <Link
                to="/register"
                className="btn btn-lg"
                style={{
                  background: "var(--brand, #19b3b3)",
                  color: "white",
                  borderRadius: 12,
                  padding: "12px 18px",
                  boxShadow: "0 10px 30px rgba(25,179,179,.25)",
                }}
              >
                Crear cuenta
              </Link>

              <Link
                to="/login"
                className="btn btn-lg btn-outline-dark"
                style={{ borderRadius: 12, padding: "12px 18px" }}
              >
                Entrar
              </Link>

              <a
                href="#features"
                className="btn btn-lg btn-outline-secondary"
                style={{ borderRadius: 12, padding: "12px 18px" }}
              >
                Ver funciones
              </a>
            </div>

            
            <div className="row g-3">
              <div className="col-6">
                <div
                  className="p-3 rounded-4"
                  style={{
                    background: "rgba(255,255,255,.75)",
                    border: "1px solid rgba(0,0,0,.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.04)",
                  }}
                >
                  <div className="text-muted small">Rápido</div>
                  <div className="fw-bold fs-5">Registro en 10s</div>
                </div>
              </div>

              <div className="col-6">
                <div
                  className="p-3 rounded-4"
                  style={{
                    background: "rgba(255,255,255,.75)",
                    border: "1px solid rgba(0,0,0,.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.04)",
                  }}
                >
                  <div className="text-muted small">Grupos</div>
                  <div className="fw-bold fs-5">Balances claros</div>
                </div>
              </div>

              <div className="col-6">
                <div
                  className="p-3 rounded-4"
                  style={{
                    background: "rgba(255,255,255,.75)",
                    border: "1px solid rgba(0,0,0,.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.04)",
                  }}
                >
                  <div className="text-muted small">Resumen</div>
                  <div className="fw-bold fs-5">Gráficos + categorías</div>
                </div>
              </div>

              <div className="col-6">
                <div
                  className="p-3 rounded-4"
                  style={{
                    background: "rgba(255,255,255,.75)",
                    border: "1px solid rgba(0,0,0,.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,.04)",
                  }}
                >
                  <div className="text-muted small">FinScore</div>
                  <div className="fw-bold fs-5">Motivación por ahorro</div>
                </div>
              </div>
            </div>
          </div>

         
          <div className="col-lg-6">
            <div
              className="p-4 p-md-5 rounded-5"
              style={{
                background: "rgba(255,255,255,.75)",
                border: "1px solid rgba(0,0,0,.06)",
                boxShadow: "0 18px 50px rgba(0,0,0,.06)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              
              <div
                style={{
                  position: "absolute",
                  inset: -120,
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(25,179,179,.25), transparent 55%), radial-gradient(circle at 80% 60%, rgba(25,179,179,.18), transparent 45%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div className="text-muted small mb-2">Finza</div>
                <h2 className="fw-bold mb-3" style={{ color: "#0b1b2a" }}>
                  Tu panel financiero personal
                </h2>
                <p className="text-muted mb-4">
                  Gastos, ahorros, divisas y grupos: todo en una misma vista.
                </p>

                
                <div className="d-flex justify-content-center">
                  <img
                    src={finzaLogo}
                    alt="Finza"
                    style={{
                      maxWidth: 360,
                      width: "100%",
                      height: "auto",
                      filter: "drop-shadow(0 12px 20px rgba(0,0,0,.10))",
                    }}
                  />
                </div>

                <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
                  <span className="badge bg-light text-dark border">Gastos</span>
                  <span className="badge bg-light text-dark border">Grupos</span>
                  <span className="badge bg-light text-dark border">Divisas</span>
                  <span className="badge bg-light text-dark border">FinScore</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <section id="features" className="container pb-5">
        <div className="d-flex align-items-end justify-content-between mb-3">
          <div>
            <div className="text-muted small">Funciones</div>
            <h3 className="fw-bold mb-0" style={{ color: "#0b1b2a" }}>
              Todo lo esencial, sin ruido
            </h3>
          </div>
          <a
            href="#cta"
            className="text-decoration-none"
            style={{ color: "var(--brand,#19b3b3)" }}
          >
            Empezar →
          </a>
        </div>

        <div className="row g-3">
          {[
            {
              title: "Gastos y categorías",
              desc: "Registra rápido, filtra por fecha/tipo y controla tu mes.",
            },
            {
              title: "Resumen con gráficos",
              desc: "Visualiza tendencias y categorías para decidir mejor.",
            },
            {
              title: "Divide cuentas en grupos",
              desc: "Crea gastos compartidos y calcula quién debe a quién.",
            },
            {
              title: "Divisas (FX)",
              desc: "Convierte y consulta tasas con cache para ir rápido.",
            },
            {
              title: "FinScore",
              desc: "Acumula créditos con ahorro y mantén motivación.",
            },
            {
              title: "Diseño limpio",
              desc: "Interfaz clara, moderna y enfocada en usabilidad.",
            },
          ].map((f) => (
            <div className="col-md-6 col-lg-4" key={f.title}>
              <div
                className="h-100 p-4 rounded-4"
                style={{
                  background: "rgba(255,255,255,.80)",
                  border: "1px solid rgba(0,0,0,.06)",
                  boxShadow: "0 12px 30px rgba(0,0,0,.04)",
                }}
              >
                <div
                  className="mb-3"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(25,179,179,.12)",
                    border: "1px solid rgba(25,179,179,.20)",
                  }}
                />
                <div className="fw-bold" style={{ color: "#0b1b2a" }}>
                  {f.title}
                </div>
                <div className="text-muted mt-2">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

     
      <section id="cta" className="container pb-5">
        <div
          className="p-4 p-md-5 rounded-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(25,179,179,.16), rgba(255,255,255,.85))",
            border: "1px solid rgba(0,0,0,.06)",
            boxShadow: "0 18px 50px rgba(0,0,0,.06)",
          }}
        >
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <h3 className="fw-bold mb-2" style={{ color: "#0b1b2a" }}>
                Empieza hoy y ordena tus finanzas en minutos
              </h3>
              <div className="text-muted">
                Crea tu cuenta y prueba el flujo completo: gastos → resumen → grupos → balances.
              </div>
            </div>
            <div className="col-lg-4 d-flex justify-content-lg-end gap-2 flex-wrap">
              <Link
                to="/register"
                className="btn btn-lg"
                style={{
                  background: "var(--brand, #19b3b3)",
                  color: "white",
                  borderRadius: 12,
                  padding: "12px 18px",
                  boxShadow: "0 10px 30px rgba(25,179,179,.25)",
                }}
              >
                Crear cuenta
              </Link>
              <Link
                to="/login"
                className="btn btn-lg btn-outline-dark"
                style={{ borderRadius: 12, padding: "12px 18px" }}
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-muted small mt-4 pb-3">
          © {new Date().getFullYear()} Finza · Hecho para controlar y decidir mejor.
        </div>
      </section>
    </div>
  );
};