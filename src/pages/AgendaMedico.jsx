
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock3,
  MapPin,
  Plus,
  Save,
  NotebookPen,
  UserRound,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

import { Link } from "react-router-dom";
import SidebarMedico from "../components/SidebarMedico";
import "../styles/AgendaMedico.css";

// Utilizamos fechas locales para evitar desfases
// entre la zona horaria de Chile y UTC.
function fechaISO(fecha) {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}

function convertirFecha(valor) {
  return new Date(`${valor}T12:00:00`);
}

function sumarDias(valor, cantidad) {
  const fecha = convertirFecha(valor);
  fecha.setDate(fecha.getDate() + cantidad);
  return fechaISO(fecha);
}

function inicioDeSemana(valor) {
  const fecha = convertirFecha(valor);
  const diferencia = (fecha.getDay() + 6) % 7;
  fecha.setDate(fecha.getDate() - diferencia);
  return fechaISO(fecha);
}

function mostrarFecha(valor, opciones = {}) {
  if (!valor) return "Sin fecha";

  return convertirFecha(valor).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opciones,
  });
}

function fechaCorta(valor) {
  return mostrarFecha(valor, {
    month: "short",
  });
}

function iniciales(nombre = "") {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function minutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function claseEstado(estado = "") {
  return estado.toLowerCase().replace(/\s+/g, "-");
}

function AgendaMedico({
  medico,
  pacientes = [],
  citas = [],
  anotaciones = [],
  onAgregarCita,
  onAgregarAnotacion,
}) {
  const pacientesAsignados = useMemo(
    () =>
      pacientes.filter(
        (paciente) => paciente.medicoId === medico.id
      ),
    [pacientes, medico.id]
  );

  const idsAsignados = new Set(
    pacientesAsignados.map((paciente) => paciente.id)
  );

  const citasAsignadas = useMemo(
    () =>
      citas.filter((cita) =>
        idsAsignados.has(cita.pacienteId)
      ),
    [citas, pacientesAsignados]
  );

  const hoy = fechaISO(new Date());

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(() => {
      const fechas = citas
        .filter((cita) =>
          idsAsignados.has(cita.pacienteId)
        )
        .map((cita) => cita.fecha)
        .sort();

      // Al abrir la agenda buscamos la siguiente
      // fecha con citas, para mostrar datos útiles.
      return fechas.find((fecha) => fecha >= hoy) || hoy;
    });

  const [vista, setVista] = useState("dia");
  const [filtroEstado, setFiltroEstado] =
    useState("Todos");
  const [citaId, setCitaId] = useState(null);

  const [mostrarNuevaCita, setMostrarNuevaCita] =
    useState(true);
  const [mostrarNuevaNota, setMostrarNuevaNota] =
    useState(true);

  const [aviso, setAviso] = useState("");
  const [errorCita, setErrorCita] = useState("");
  const [errorNota, setErrorNota] = useState("");

  const citaInicial = [...citasAsignadas]
    .filter(
      (cita) => cita.fecha === fechaSeleccionada
    )
    .sort((a, b) =>
      a.hora.localeCompare(b.hora)
    )[0];

  const [nuevaCita, setNuevaCita] = useState({
    pacienteId:
      citaInicial?.pacienteId ||
      pacientesAsignados[0]?.id ||
      "",
    fecha: fechaSeleccionada,
    hora: "12:00",
    duracion: "30",
    motivo: "",
    modalidad: "Presencial",
    lugar: "Consultorio 2",
    estado: "Por confirmar",
  });

  const [nuevaNota, setNuevaNota] = useState({
    pacienteId:
      citaInicial?.pacienteId ||
      pacientesAsignados[0]?.id ||
      "",
    citaId: citaInicial?.id || "",
    titulo: "",
    texto: "",
  });

  const lunes = inicioDeSemana(fechaSeleccionada);
  const domingo = sumarDias(lunes, 6);

  const citasVisibles = useMemo(() => {
    return [...citasAsignadas]
      .filter((cita) => {
        const coincideFecha =
          vista === "dia"
            ? cita.fecha === fechaSeleccionada
            : cita.fecha >= lunes &&
              cita.fecha <= domingo;

        const coincideEstado =
          filtroEstado === "Todos" ||
          cita.estado === filtroEstado;

        return coincideFecha && coincideEstado;
      })
      .sort((a, b) =>
        `${a.fecha}T${a.hora}`.localeCompare(
          `${b.fecha}T${b.hora}`
        )
      );
  }, [
    citasAsignadas,
    fechaSeleccionada,
    vista,
    filtroEstado,
    lunes,
    domingo,
  ]);

  const citaSeleccionada =
    citasVisibles.find(
      (cita) => cita.id === citaId
    ) ||
    citasVisibles[0] ||
    null;

  function obtenerPaciente(id) {
    return pacientesAsignados.find(
      (paciente) => paciente.id === id
    );
  }

  const pacienteSeleccionado = citaSeleccionada
    ? obtenerPaciente(citaSeleccionada.pacienteId)
    : null;

  const notasPaciente = anotaciones
    .filter(
      (nota) =>
        nota.pacienteId === pacienteSeleccionado?.id
    )
    .sort((a, b) =>
      b.creadoEn.localeCompare(a.creadoEn)
    );

  const citasDelPaciente = citasAsignadas
    .filter(
      (cita) => cita.pacienteId === nuevaNota.pacienteId
    )
    .sort((a, b) =>
      `${a.fecha}T${a.hora}`.localeCompare(
        `${b.fecha}T${b.hora}`
      )
    );

  const textoPeriodo =
    vista === "dia"
      ? mostrarFecha(fechaSeleccionada, {
          weekday: "long",
        })
      : `${fechaCorta(lunes)} al ${fechaCorta(domingo)}`;

  function cambiarFecha(cantidad) {
    const siguiente = sumarDias(
      fechaSeleccionada,
      cantidad
    );

    setFechaSeleccionada(siguiente);
    setCitaId(null);
    setNuevaCita((actual) => ({
      ...actual,
      fecha: siguiente,
    }));
    setAviso("");
  }

  function irAHoy() {
    setFechaSeleccionada(hoy);
    setCitaId(null);
    setNuevaCita((actual) => ({
      ...actual,
      fecha: hoy,
    }));
    setAviso("");
  }

  function seleccionarCita(cita) {
    setCitaId(cita.id);

    // Preparar la anotación para el paciente
    // de la cita seleccionada.
    setNuevaNota((actual) => ({
      ...actual,
      pacienteId: cita.pacienteId,
      citaId: cita.id,
    }));
  }

  function modificarCita(campo, valor) {
    setNuevaCita((actual) => ({
      ...actual,
      [campo]: valor,
    }));
    setErrorCita("");
  }

  function guardarCita(evento) {
    evento.preventDefault();
    setErrorCita("");
    setAviso("");

    const duracion = Number(nuevaCita.duracion);

    if (
      !idsAsignados.has(nuevaCita.pacienteId) ||
      !nuevaCita.fecha ||
      !nuevaCita.hora ||
      !nuevaCita.motivo.trim() ||
      !Number.isInteger(duracion) ||
      duracion < 15 ||
      duracion > 180
    ) {
      setErrorCita(
        "Completa los campos obligatorios con datos válidos."
      );
      return;
    }

    const inicioNuevo = minutos(nuevaCita.hora);
    const finNuevo = inicioNuevo + duracion;

    if (finNuevo > 1440) {
      setErrorCita(
        "La cita debe finalizar antes de la medianoche."
      );
      return;
    }

    // Evitar dos citas del médico en el mismo horario.
    const conflicto = citasAsignadas.some((cita) => {
      if (
        cita.fecha !== nuevaCita.fecha ||
        cita.estado === "Cancelada"
      ) {
        return false;
      }

      const inicioExistente = minutos(cita.hora);
      const finExistente =
        inicioExistente + Number(cita.duracion || 30);

      return (
        inicioNuevo < finExistente &&
        finNuevo > inicioExistente
      );
    });

    if (conflicto) {
      setErrorCita(
        "Ya existe una cita asignada durante ese horario. Selecciona otra hora."
      );
      return;
    }

    const citaCreada = {
      id: crypto.randomUUID(),
      pacienteId: nuevaCita.pacienteId,
      fecha: nuevaCita.fecha,
      hora: nuevaCita.hora,
      duracion,
      motivo: nuevaCita.motivo.trim(),
      modalidad: nuevaCita.modalidad,
      lugar: nuevaCita.lugar.trim(),
      estado: nuevaCita.estado,
    };

    onAgregarCita(citaCreada);

    setFechaSeleccionada(citaCreada.fecha);
    setVista("dia");
    setFiltroEstado("Todos");
    setCitaId(citaCreada.id);

    setNuevaNota((actual) => ({
      ...actual,
      pacienteId: citaCreada.pacienteId,
      citaId: citaCreada.id,
    }));

    setNuevaCita((actual) => ({
      ...actual,
      motivo: "",
    }));

    setAviso(
      "La cita fue agregada correctamente a la agenda de demostración."
    );
  }

  function modificarNota(campo, valor) {
    setNuevaNota((actual) => ({
      ...actual,
      [campo]: valor,
      ...(campo === "pacienteId"
        ? { citaId: "" }
        : {}),
    }));
    setErrorNota("");
  }

  function guardarNota(evento) {
    evento.preventDefault();
    setErrorNota("");
    setAviso("");

    if (
      !idsAsignados.has(nuevaNota.pacienteId) ||
      !nuevaNota.titulo.trim() ||
      !nuevaNota.texto.trim()
    ) {
      setErrorNota(
        "Selecciona un paciente y completa el título y la anotación."
      );
      return;
    }

    if (
      nuevaNota.citaId &&
      !citasAsignadas.some(
        (cita) =>
          cita.id === nuevaNota.citaId &&
          cita.pacienteId === nuevaNota.pacienteId
      )
    ) {
      setErrorNota(
        "La cita seleccionada no corresponde al paciente."
      );
      return;
    }

    onAgregarAnotacion({
      id: crypto.randomUUID(),
      pacienteId: nuevaNota.pacienteId,
      citaId: nuevaNota.citaId || null,
      titulo: nuevaNota.titulo.trim(),
      texto: nuevaNota.texto.trim(),
      autor: medico.nombre,
      creadoEn: new Date().toISOString(),
    });

    setNuevaNota((actual) => ({
      ...actual,
      titulo: "",
      texto: "",
    }));

    setAviso(
      "La anotación se agregó correctamente al paciente."
    );
  }

  return (
    <div className="medico-app">
      <SidebarMedico nombreMedico={medico.nombre} />

      <main className="medico-contenido ag-pagina">
        <div className="medico-migas">
          Centro clínico <span>›</span>
          <strong>Agenda</strong>
        </div>

        <header className="ag-encabezado">
          <div>
            <h1>Agenda</h1>
            <p>
              Organiza tus citas y registra las
              anotaciones de cada paciente.
            </p>
          </div>

          <div className="ag-fecha-actual">
            <CalendarDays size={17} />
            {mostrarFecha(hoy, {
              weekday: "long",
            })}
          </div>
        </header>

        {aviso && (
          <div className="ag-aviso-exito" role="status">
            <CheckCircle2 size={17} />
            {aviso}
          </div>
        )}

        <div className="ag-columnas">
          {/* COLUMNA IZQUIERDA: CITAS */}
          <section className="ag-tarjeta ag-citas">
            <div className="ag-tarjeta-cabecera">
              <div className="ag-titulo-conteo">
                <h2>
                  Citas {vista === "dia"
                    ? "del día"
                    : "de la semana"}
                </h2>

                <span>
                  {citasVisibles.length} citas
                </span>
              </div>

              <div className="ag-selector-vista">
                <button
                  type="button"
                  className={
                    vista === "dia" ? "activo" : ""
                  }
                  onClick={() => {
                    setVista("dia");
                    setCitaId(null);
                  }}
                >
                  Día
                </button>

                <button
                  type="button"
                  className={
                    vista === "semana" ? "activo" : ""
                  }
                  onClick={() => {
                    setVista("semana");
                    setCitaId(null);
                  }}
                >
                  Semana
                </button>
              </div>
            </div>

            <div className="ag-navegacion-fecha">
              <div className="ag-controles-fecha">
                <button
                  type="button"
                  aria-label="Fecha anterior"
                  onClick={() =>
                    cambiarFecha(
                      vista === "dia" ? -1 : -7
                    )
                  }
                >
                  <ChevronLeft size={18} />
                </button>

                <strong>{textoPeriodo}</strong>

                <button
                  type="button"
                  aria-label="Fecha siguiente"
                  onClick={() =>
                    cambiarFecha(
                      vista === "dia" ? 1 : 7
                    )
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="ag-opciones-fecha">
                <button
                  type="button"
                  className="ag-boton-hoy"
                  onClick={irAHoy}
                >
                  Hoy
                </button>

                <select
                  aria-label="Filtrar citas por estado"
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setCitaId(null);
                  }}
                >
                  <option value="Todos">
                    Todos los estados
                  </option>
                  <option value="Confirmada">
                    Confirmadas
                  </option>
                  <option value="Por confirmar">
                    Por confirmar
                  </option>
                  <option value="Atendida">
                    Atendidas
                  </option>
                </select>
              </div>
            </div>

            <div className="ag-lista-citas">
              {citasVisibles.length === 0 ? (
                <div className="ag-vacio">
                  <CalendarDays size={27} />
                  <h3>No hay citas para este período</h3>
                  <p>
                    Puedes cambiar la fecha o crear
                    una nueva cita con el formulario
                    inferior.
                  </p>
                </div>
              ) : (
                citasVisibles.map((cita, indice) => {
                  const paciente = obtenerPaciente(
                    cita.pacienteId
                  );

                  const activa =
                    citaSeleccionada?.id === cita.id;

                  const empiezaDia =
                    indice === 0 ||
                    citasVisibles[indice - 1].fecha !==
                      cita.fecha;

                  return (
                    <div
                      key={cita.id}
                      className="ag-grupo-cita"
                    >
                      {vista === "semana" &&
                        empiezaDia && (
                          <div className="ag-separador-dia">
                            {mostrarFecha(cita.fecha, {
                              weekday: "long",
                            })}
                          </div>
                        )}

                      <button
                        type="button"
                        className={
                          "ag-cita " +
                          (activa ? "activa" : "")
                        }
                        onClick={() =>
                          seleccionarCita(cita)
                        }
                      >
                        <div className="ag-cita-hora">
                          <strong>{cita.hora}</strong>
                          <small>
                            {cita.duracion} min
                          </small>
                        </div>

                        <span className="ag-avatar">
                          {iniciales(
                            paciente?.nombre || "P"
                          )}
                        </span>

                        <div className="ag-cita-datos">
                          <strong>
                            {paciente?.nombre ||
                              "Paciente"}
                          </strong>

                          <small>
                            {cita.motivo}
                          </small>

                          <span>
                            {paciente?.diagnosticos
                              ?.join(" · ") ||
                              "Sin diagnóstico registrado"}
                          </span>
                        </div>

                        <span
                          className={
                            "ag-estado " +
                            claseEstado(cita.estado)
                          }
                        >
                          {cita.estado}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="ag-pie-citas">
              <span>
                {
                  citasVisibles.filter(
                    (c) => c.estado === "Atendida"
                  ).length
                }{" "}
                atendidas ·{" "}
                {
                  citasVisibles.filter(
                    (c) => c.estado === "Confirmada"
                  ).length
                }{" "}
                confirmadas ·{" "}
                {
                  citasVisibles.filter(
                    (c) =>
                      c.estado === "Por confirmar"
                  ).length
                }{" "}
                por confirmar
              </span>

              <small>Agenda de demostración</small>
            </div>
          </section>

          {/* COLUMNA DERECHA: DETALLE */}
          <section className="ag-tarjeta ag-detalle">
            <div className="ag-tarjeta-cabecera">
              <span className="ag-subtitulo">
                CITA SELECCIONADA
              </span>

              {citaSeleccionada && (
                <span
                  className={
                    "ag-estado " +
                    claseEstado(
                      citaSeleccionada.estado
                    )
                  }
                >
                  {citaSeleccionada.estado}
                </span>
              )}
            </div>

            {!citaSeleccionada ? (
              <div className="ag-vacio">
                <UserRound size={26} />
                <p>
                  Selecciona una cita para ver su
                  información y anotaciones.
                </p>
              </div>
            ) : (
              <>
                <div className="ag-paciente-seleccionado">
                  <span className="ag-avatar grande">
                    {iniciales(
                      pacienteSeleccionado?.nombre
                    )}
                  </span>

                  <div>
                    <h3>
                      {pacienteSeleccionado?.nombre}
                    </h3>

                    <p>
                      {pacienteSeleccionado?.edad} años ·{" "}
                      {pacienteSeleccionado
                        ?.diagnosticos?.join(" · ")}
                    </p>
                  </div>

                  <Link
                    to={`/medico/pacientes?paciente=${citaSeleccionada.pacienteId}`}
                    className="ag-enlace-paciente"
                  >
                    <FileText size={15} />
                    Ver paciente
                  </Link>
                </div>

                <div className="ag-detalle-cita">
                  <div>
                    <CalendarDays size={16} />
                    <strong>
                      {mostrarFecha(
                        citaSeleccionada.fecha
                      )}{" "}
                      · {citaSeleccionada.hora}
                    </strong>
                    <span>
                      ({citaSeleccionada.duracion} min)
                    </span>
                  </div>

                  <div>
                    <MapPin size={16} />
                    <span>
                      {citaSeleccionada.modalidad} ·{" "}
                      {citaSeleccionada.lugar}
                    </span>
                  </div>

                  <p>
                    {citaSeleccionada.motivo}
                  </p>
                </div>

                <div className="ag-anotaciones-cabecera">
                  <h3>
                    Anotaciones del paciente
                  </h3>
                  <small>
                    {notasPaciente.length} registradas
                  </small>
                </div>

                <div className="ag-lista-anotaciones">
                  {notasPaciente.length === 0 ? (
                    <p className="ag-sin-anotaciones">
                      Todavía no hay anotaciones
                      registradas para este paciente.
                    </p>
                  ) : (
                    notasPaciente.map((nota) => (
                      <article
                        className="ag-anotacion"
                        key={nota.id}
                      >
                        <div>
                          <span>
                            {new Date(
                              nota.creadoEn
                            ).toLocaleString("es-CL")}
                          </span>
                          <small>{nota.autor}</small>
                        </div>

                        <strong>{nota.titulo}</strong>
                        <p>{nota.texto}</p>
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        {/* FORMULARIOS INFERIORES */}
        <div className="ag-columnas ag-formularios">
          {/* NUEVA CITA */}
          <section className="ag-tarjeta">
            <button
              type="button"
              className="ag-desplegable"
              aria-expanded={mostrarNuevaCita}
              onClick={() =>
                setMostrarNuevaCita((actual) => !actual)
              }
            >
              <span className="ag-desplegable-icono">
                <Plus size={19} />
              </span>
              <span>Nueva cita</span>
              <ChevronDown
                size={18}
                className={
                  mostrarNuevaCita ? "girado" : ""
                }
              />
            </button>

            {mostrarNuevaCita && (
              <form
                className="ag-formulario"
                onSubmit={guardarCita}
              >
                <div className="ag-campo ancho">
                  <label htmlFor="ag-paciente-cita">
                    Paciente *
                  </label>
                  <select
                    id="ag-paciente-cita"
                    required
                    value={nuevaCita.pacienteId}
                    onChange={(e) =>
                      modificarCita(
                        "pacienteId",
                        e.target.value
                      )
                    }
                  >
                    {pacientesAsignados.map(
                      (paciente) => (
                        <option
                          key={paciente.id}
                          value={paciente.id}
                        >
                          {paciente.nombre}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="ag-form-grid">
                  <div className="ag-campo">
                    <label htmlFor="ag-fecha-nueva">
                      Fecha *
                    </label>
                    <input
                      id="ag-fecha-nueva"
                      type="date"
                      required
                      value={nuevaCita.fecha}
                      onChange={(e) =>
                        modificarCita(
                          "fecha",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="ag-campo">
                    <label htmlFor="ag-hora-nueva">
                      Hora *
                    </label>
                    <input
                      id="ag-hora-nueva"
                      type="time"
                      required
                      value={nuevaCita.hora}
                      onChange={(e) =>
                        modificarCita(
                          "hora",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="ag-campo">
                    <label htmlFor="ag-duracion">
                      Duración *
                    </label>
                    <select
                      id="ag-duracion"
                      value={nuevaCita.duracion}
                      onChange={(e) =>
                        modificarCita(
                          "duracion",
                          e.target.value
                        )
                      }
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>

                  <div className="ag-campo">
                    <label htmlFor="ag-motivo">
                      Motivo de la cita *
                    </label>
                    <input
                      id="ag-motivo"
                      type="text"
                      required
                      value={nuevaCita.motivo}
                      onChange={(e) =>
                        modificarCita(
                          "motivo",
                          e.target.value
                        )
                      }
                      placeholder="Control de seguimiento"
                    />
                  </div>

                  <div className="ag-campo">
                    <label htmlFor="ag-modalidad">
                      Modalidad
                    </label>
                    <select
                      id="ag-modalidad"
                      value={nuevaCita.modalidad}
                      onChange={(e) =>
                        modificarCita(
                          "modalidad",
                          e.target.value
                        )
                      }
                    >
                      <option>Presencial</option>
                      <option>Telemedicina</option>
                    </select>
                  </div>

                  <div className="ag-campo">
                    <label htmlFor="ag-estado-nuevo">
                      Estado inicial
                    </label>
                    <select
                      id="ag-estado-nuevo"
                      value={nuevaCita.estado}
                      onChange={(e) =>
                        modificarCita(
                          "estado",
                          e.target.value
                        )
                      }
                    >
                      <option>Por confirmar</option>
                      <option>Confirmada</option>
                    </select>
                  </div>

                  <div className="ag-campo ancho">
                    <label htmlFor="ag-lugar">
                      Lugar o medio de atención
                    </label>
                    <input
                      id="ag-lugar"
                      type="text"
                      value={nuevaCita.lugar}
                      onChange={(e) =>
                        modificarCita(
                          "lugar",
                          e.target.value
                        )
                      }
                      placeholder="Consultorio 2"
                    />
                  </div>
                </div>

                {errorCita && (
                  <p className="ag-error" role="alert">
                    <AlertCircle size={15} />
                    {errorCita}
                  </p>
                )}

                <div className="ag-acciones">
                  <small>* Campos obligatorios</small>

                  <button
                    type="submit"
                    className="ag-guardar"
                  >
                    <Save size={15} />
                    Guardar cita
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* NUEVA ANOTACIÓN */}
          <section className="ag-tarjeta">
            <button
              type="button"
              className="ag-desplegable"
              aria-expanded={mostrarNuevaNota}
              onClick={() =>
                setMostrarNuevaNota((actual) => !actual)
              }
            >
              <span className="ag-desplegable-icono">
                <NotebookPen size={19} />
              </span>
              <span>Nueva anotación</span>
              <ChevronDown
                size={18}
                className={
                  mostrarNuevaNota ? "girado" : ""
                }
              />
            </button>

            {mostrarNuevaNota && (
              <form
                className="ag-formulario"
                onSubmit={guardarNota}
              >
                <div className="ag-form-grid">
                  <div className="ag-campo">
                    <label htmlFor="ag-paciente-nota">
                      Paciente *
                    </label>

                    <select
                      id="ag-paciente-nota"
                      required
                      value={nuevaNota.pacienteId}
                      onChange={(e) =>
                        modificarNota(
                          "pacienteId",
                          e.target.value
                        )
                      }
                    >
                      {pacientesAsignados.map(
                        (paciente) => (
                          <option
                            key={paciente.id}
                            value={paciente.id}
                          >
                            {paciente.nombre}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="ag-campo">
                    <label htmlFor="ag-cita-nota">
                      Cita asociada
                    </label>

                    <select
                      id="ag-cita-nota"
                      value={nuevaNota.citaId}
                      onChange={(e) =>
                        modificarNota(
                          "citaId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Sin cita asociada
                      </option>

                      {citasDelPaciente.map(
                        (cita) => (
                          <option
                            key={cita.id}
                            value={cita.id}
                          >
                            {fechaCorta(cita.fecha)} ·{" "}
                            {cita.hora}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="ag-campo ancho">
                    <label htmlFor="ag-titulo-nota">
                      Título *
                    </label>

                    <input
                      id="ag-titulo-nota"
                      type="text"
                      required
                      value={nuevaNota.titulo}
                      onChange={(e) =>
                        modificarNota(
                          "titulo",
                          e.target.value
                        )
                      }
                      placeholder="Aspectos a revisar en consulta"
                    />
                  </div>

                  <div className="ag-campo ancho">
                    <label htmlFor="ag-texto-nota">
                      Anotación *
                    </label>

                    <textarea
                      id="ag-texto-nota"
                      rows="6"
                      required
                      value={nuevaNota.texto}
                      onChange={(e) =>
                        modificarNota(
                          "texto",
                          e.target.value
                        )
                      }
                      placeholder="Escribe aquí las observaciones para el expediente del paciente..."
                    />
                  </div>
                </div>

                <div className="ag-confidencialidad">
                  <FileText size={15} />
                  Registro de demostración visible en
                  esta sesión. Todavía no existe
                  almacenamiento clínico permanente.
                </div>

                {errorNota && (
                  <p className="ag-error" role="alert">
                    <AlertCircle size={15} />
                    {errorNota}
                  </p>
                )}

                <div className="ag-acciones">
                  <small>* Campos obligatorios</small>

                  <button
                    type="submit"
                    className="ag-guardar"
                  >
                    <Save size={15} />
                    Guardar anotación
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AgendaMedico;
