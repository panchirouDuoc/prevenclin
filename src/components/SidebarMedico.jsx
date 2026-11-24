
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  UsersRound,
  CalendarDays,
  MessageCircle,
  ExternalLink,
  Stethoscope,
  LifeBuoy,
  Calculator,
  Cross,
} from "lucide-react";

import "../styles/Medico.css";

const opciones = [
  {
    ruta: "/medico",
    nombre: "Resumen",
    icono: LayoutDashboard,
    exacta: true,
  },
  {
    ruta: "/medico/pacientes",
    nombre: "Pacientes",
    icono: UsersRound,
  },
  {
    ruta: "/medico/agenda",
    nombre: "Agenda",
    icono: CalendarDays,
  },
  {
    ruta: "/medico/mensajes",
    nombre: "Mensajes",
    icono: MessageCircle,
  },
];

function SidebarMedico({ nombreMedico = "Dr. Médico" }) {
  return (
    <aside className="medico-sidebar">
      <div className="medico-sidebar-marca">
        <div className="medico-logo-icono">
          <Cross size={20} />
        </div>

        <div>
          <strong>PrevenClin</strong>
          <small>CENTRO CLÍNICO</small>
        </div>
      </div>

      <nav
        className="medico-menu"
        aria-label="Navegación médica"
      >
        {opciones.map((opcion) => {
          const Icono = opcion.icono;

          return (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              end={opcion.exacta}
              className={({ isActive }) =>
                `medico-menu-enlace ${
                  isActive ? "activo" : ""
                }`
              }
            >
              <Icono size={18} />
              <span>{opcion.nombre}</span>
              <span className="medico-menu-punto" />
            </NavLink>
          );
        })}
      </nav>

      <div className="medico-sidebar-inferior">
        <a
          className="medico-sidebar-bloque"
          href="https://www.mdcalc.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Calculator size={19} />
          <span>MDCalc</span>
          <ExternalLink size={13} />
        </a>

        <div className="medico-sidebar-bloque">
          <div className="medico-avatar">
            <Stethoscope size={17} />
          </div>

          <div className="medico-identidad">
            <strong>{nombreMedico}</strong>
            <small>Médico tratante</small>
          </div>
        </div>

        <div className="medico-sidebar-bloque">
          <LifeBuoy size={18} />
          <span>Centro de ayuda</span>
        </div>
      </div>
    </aside>
  );
}

export default SidebarMedico;
