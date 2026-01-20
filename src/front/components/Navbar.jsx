import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container d-flex justify-content-between align-items-center">
        
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="navbar-brand mb-0 h1 text-decoration-none">
            React Boilerplate
          </Link>

          {/* Links simples tipo menú */}
          <Link to="/" className="text-decoration-none">
            Inicio
          </Link>

          <Link to="/divisas" className="text-decoration-none">
            Divisas
          </Link>

          <Link to="/demo" className="text-decoration-none">
            Demo
          </Link>
        </div>

        <div className="ml-auto d-flex gap-2">
          <Link to="/divisas">
            <button className="btn btn-outline-primary">Divisas</button>
          </Link>

          <Link to="/demo">
            <button className="btn btn-primary">Check the Context in action</button>
          </Link>
        </div>
      </div>
    </nav>
  );
};