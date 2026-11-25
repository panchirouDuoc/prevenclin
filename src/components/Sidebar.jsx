
import { NavLink, Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

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

      {/* CENTRO DE AYUDA */}
      <div className="sidebar-footer">
        <Link
          to="/paciente/asistente"
          className="sidebar-help-card"
          title="Ir al asistente de ayuda"
        >
          <LifeBuoy size={19} />

          <span>Centro de ayuda</span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
