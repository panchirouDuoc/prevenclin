
import { Link } from "react-router-dom";

import {
  UsersRound,
  FlaskConical,
  MessageCircle,
  CheckCircle2,
  ClipboardCheck,
  ChevronRight,
  CalendarDays,
  Clock3,
} from "lucide-react";

import SidebarMedico from "../components/SidebarMedico";
import "../styles/Medico.css";

function PanelMedico({
  medico,
  pacientes = [],
  citas = [],
  mensajes = [],
}) {
  const pacientesAsignados = pacientes.filter(
    (paciente) => paciente.medicoId === medico.id
  );

  const idsAsignados = new Set(
    pacientesAsignados.map((paciente) => paciente.id)
  );

  const resultadosNuevos = pacientesAsignados.filter(
    (paciente) => paciente.resultadosNuevos
  );

  const pacientesActualizados = pacientesAsignados.filter(
    (paciente) => paciente.datosActualizados
  );

  const mensajesAsignados = mensajes.filter(
    (mensaje) => idsAsignados.has(mensaje.pacienteId)
  );

  const mensajesSinLeer = mensajesAsignados.filter(
    (mensaje) =>
      mensaje.remitente === "paciente" &&
      !mensaje.leido
  );

  const citasAsignadas = citas.filter(
    (cita) => idsAsignados.has(cita.pacienteId)
  );

  const obtenerPaciente = (id) =>
    pacientesAsignados.find(
      (paciente) => paciente.id === id
    );

  const hora = new Date().getHours();

  const saludo =
    hora < 12
      ? "Buenos días"
      : hora < 20
        ? "Buenas tardes"
        : "Buenas noches";

  // Actividades derivadas de los datos de demostración
  const actividades = [
    ...resultadosNuevos.slice(0, 1).map(
      (paciente) => ({
        id: "resultado-" + paciente.id,
        titulo: "Resultados disponibles",
        detalle: `Paciente: ${paciente.nombre}`,
        icono: FlaskConical,
        tipo: "resultado",
        ruta: "/medico/pacientes",
      })
    ),

    ...pacientesActualizados.slice(0, 1).map(
      (paciente) => ({
        id: "actualizacion-" + paciente.id,
        titulo: "Datos actualizados",
        detalle: `Paciente: ${paciente.nombre}`,
        icono: ClipboardCheck,
        tipo: "actualizacion",
        ruta: "/medico/pacientes",
      })
    ),

    ...mensajesSinLeer.slice(0, 1).map(
      (mensaje) => ({
        id: "mensaje-" + mensaje.id,
        titulo: "Nuevo mensaje",
        detalle:
          `Paciente: ${
            obtenerPaciente(mensaje.pacienteId)
              ?.nombre || "Paciente"
          }`,
        icono: MessageCircle,
        tipo: "mensaje",
        ruta: "/medico/mensajes",
      })
    ),
  ];

  return (
    <div className="medico-app">
      <SidebarMedico nombreMedico={medico.nombre} />

      <main className="medico-contenido">
        <div className="medico-migas">
          Centro clínico
          <span>›</span>
          <strong>Resumen</strong>
        </div>

        <header className="medico-encabezado">
          <div>
            <h1>{saludo}, {medico.nombre}</h1>
            <p>
              Este es el resumen de tu actividad clínica.
            </p>
          </div>

          <span className="medico-demo-indicador">
            Datos de demostración
          </span>
        </header>

        {/* TARJETAS ESTADÍSTICAS */}
        <section className="medico-estadisticas">
          <Link
            to="/medico/pacientes"
            className="medico-estadistica"
          >
            <div className="medico-estadistica-icono azul">
              <UsersRound size={21} />
            </div>

            <div>
              <span>Pacientes</span>
              <strong>{pacientesAsignados.length}</strong>
              <small>Asignados al médico</small>
            </div>
          </Link>

          <Link
            to="/medico/pacientes"
            className="medico-estadistica"
          >
            <div className="medico-estadistica-icono naranja">
              <FlaskConical size={21} />
            </div>

            <div>
              <span>Resultados nuevos</span>
              <strong>{resultadosNuevos.length}</strong>
              <small>Marcados para revisión</small>
            </div>
          </Link>

          <Link
            to="/medico/mensajes"
            className="medico-estadistica"
          >
            <div className="medico-estadistica-icono morado">
              <MessageCircle size={21} />
            </div>

            <div>
              <span>Mensajes</span>
              <strong>{mensajesAsignados.length}</strong>
              <small>
                {mensajesSinLeer.length} sin leer
              </small>
            </div>
          </Link>
        </section>

        {/* ACTIVIDAD Y PENDIENTES */}
        <div className="medico-columnas">
          <section className="medico-tarjeta medico-actividad">
            <div className="medico-tarjeta-titulo">
              <h2>Actividad reciente</h2>

              <Link to="/medico/pacientes">
                Ver pacientes
                <ChevronRight size={15} />
              </Link>
            </div>

            <div className="medico-lista-actividad">
              {actividades.length === 0 ? (
                <p className="medico-texto-vacio">
                  No hay actividad nueva registrada.
                </p>
              ) : (
                actividades.map((actividad) => {
                  const Icono = actividad.icono;

                  return (
                    <Link
                      key={actividad.id}
                      to={actividad.ruta}
                      className="medico-actividad-item"
                    >
                      <div
                        className={
                          "medico-actividad-icono " +
                          actividad.tipo
                        }
                      >
                        <Icono size={17} />
                      </div>

                      <div>
                        <strong>
                          {actividad.titulo}
                        </strong>
                        <small>
                          {actividad.detalle}
                        </small>
                      </div>

                      <ChevronRight
                        className="medico-item-flecha"
                        size={15}
                      />
                    </Link>
                  );
                })
              )}
            </div>

            <div className="medico-estado-general">
              <CheckCircle2 size={16} />

              <span>
                Resumen de actividad de demostración
              </span>

              <small>
                Sin evaluación clínica automática
              </small>
            </div>
          </section>

          <section className="medico-tarjeta medico-pendientes">
            <div className="medico-tarjeta-titulo">
              <h2>Pendientes</h2>

              <span className="medico-contador">
                {pacientesActualizados.length +
                  mensajesSinLeer.length}
              </span>
            </div>

            <Link
              to="/medico/pacientes"
              className="medico-pendiente-item"
            >
              <span className="medico-pendiente-punto naranja" />
              <span>
                {pacientesActualizados.length} pacientes
                actualizaron sus datos
              </span>
              <ChevronRight size={15} />
            </Link>

            <Link
              to="/medico/mensajes"
              className="medico-pendiente-item"
            >
              <span className="medico-pendiente-punto verde" />
              <span>
                {mensajesSinLeer.length} mensajes
                sin leer
              </span>
              <ChevronRight size={15} />
            </Link>

            <Link
              to="/medico/agenda"
              className="medico-pendiente-item"
            >
              <CalendarDays size={16} />
              <span>
                {citasAsignadas.length} citas
                de demostración
              </span>
              <ChevronRight size={15} />
            </Link>
          </section>
        </div>

        {/* RESUMEN DE AGENDA */}
        <section className="medico-tarjeta medico-proximas-citas">
          <div className="medico-tarjeta-titulo">
            <h2>
              <CalendarDays size={18} />
              Próximas citas registradas
            </h2>

            <Link to="/medico/agenda">
              Ver agenda
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="medico-citas-resumen">
            {[...citasAsignadas]
              .sort((a, b) =>
                `${a.fecha}T${a.hora}`.localeCompare(
                  `${b.fecha}T${b.hora}`
                )
              )
              .slice(0, 3)
              .map((cita) => {
                const paciente = obtenerPaciente(
                  cita.pacienteId
                );

                return (
                  <Link
                    key={cita.id}
                    to="/medico/agenda"
                    className="medico-cita-resumen"
                  >
                    <div className="medico-cita-hora">
                      <Clock3 size={15} />
                      {cita.hora}
                    </div>

                    <div>
                      <strong>
                        {paciente?.nombre ||
                          "Paciente"}
                      </strong>
                      <small>{cita.motivo}</small>
                    </div>

                    <span className="medico-cita-estado">
                      {cita.estado}
                    </span>
                  </Link>
                );
              })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PanelMedico;
