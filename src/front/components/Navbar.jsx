import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/auth";

export const Navbar = () => {
  const user = getUser();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Control Financiero
        </Link>

        <div className="navbar-nav me-auto">
          <Link className="nav-link" to="/">Inicio</Link>
          <Link className="nav-link" to="/divisas">Divisas</Link>
          <Link className="nav-link" to="/gastos">Gastos</Link>
          <Link className="nav-link" to="/finscore">FinScore</Link>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline-light">
                Login
              </Link>
              <Link to="/register" className="btn btn-light">
                Registro
              </Link>
            </>
          ) : (
            <>
              <span className="text-light small">Bienvenido {user.email}</span>
              <button className="btn btn-outline-light" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};