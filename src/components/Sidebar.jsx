
import { NavLink, Link } from "react-router-dom";
import { LifeBuoy, LogOut } from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>PrevenClin</h2>
        <p>Salud y prevención</p>
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/paciente"
          end
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Inicio
        </NavLink>

        <NavLink
          to="/paciente/registrar"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Registrar datos
        </NavLink>

        <NavLink
          to="/paciente/perfil"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Mi Perfil
        </NavLink>

        <NavLink
          to="/paciente/seguimiento"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Mi seguimiento
        </NavLink>

        <NavLink
          to="/paciente/asistente"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Asistente de IA
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <Link
          to="/paciente/asistente"
          className="sidebar-help-card"
        >
          <LifeBuoy size={19} />
          <span>Centro de ayuda</span>
        </Link>

        <button
          type="button"
          className="sidebar-logout-card"
          onClick={() => window.location.replace("/")}
        >
          <LogOut size={19} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
