
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  MessageCircle,
  Send,
  FileText,
  ClipboardPen,
  HeartPulse,
  Droplets,
  Activity,
  Wind,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  NotebookPen,
} from "lucide-react";

import SidebarMedico from "../components/SidebarMedico";
import "../styles/MensajesMedico.css";

function iniciales(nombre = "") {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function limpiarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatearFecha(valor) {
  if (!valor) return "";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return valor;

  return fecha.toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MensajesMedico({
  medico,
  pacientes = [],
  mensajes = [],
  onResponder,
  onMarcarLeidos,
  onAgregarAnotacion,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [mensajeSeleccionadoId, setMensajeSeleccionadoId] =
    useState("");
  const [aviso, setAviso] = useState("");

  const [mostrarAnotacion, setMostrarAnotacion] =
    useState(false);
  const [tituloNota, setTituloNota] = useState("");
  const [textoNota, setTextoNota] = useState("");

  const pacientesAsignados = pacientes.filter(
    (paciente) => paciente.medicoId === medico.id
  );

  // Ordenar por el mensaje más reciente.
  const pacientesOrdenados = useMemo(() => {
    return pacientesAsignados
      .map((paciente) => {
        const mensajesPaciente = mensajes
          .filter(
            (mensaje) =>
              mensaje.pacienteId === paciente.id
          )
          .sort((a, b) =>
            b.fecha.localeCompare(a.fecha)
          );

        return {
          ...paciente,
          ultimoMensaje: mensajesPaciente[0] || null,
          sinLeer: mensajesPaciente.filter(
            (mensaje) =>
              mensaje.remitente === "paciente" &&
              !mensaje.leido
          ).length,
        };
      })
      .sort((a, b) =>
        (b.ultimoMensaje?.fecha || "").localeCompare(
          a.ultimoMensaje?.fecha || ""
        )
      );
  }, [pacientes, medico.id, mensajes]);

  const pacientesFiltrados = pacientesOrdenados.filter(
    (paciente) =>
      limpiarTexto(
        [
          paciente.nombre,
          ...(paciente.diagnosticos || []),
        ].join(" ")
      ).includes(limpiarTexto(busqueda.trim()))
  );

  const paciente =
    pacientesFiltrados.find(
      (item) => item.id === pacienteId
    ) ||
    pacientesFiltrados[0] ||
    null;

  const mensajesPaciente = mensajes
    .filter(
      (mensaje) => mensaje.pacienteId === paciente?.id
    )
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const consultasRecibidas = mensajesPaciente
    .filter(
      (mensaje) => mensaje.remitente === "paciente"
    )
    .slice()
    .reverse();

  const ultimoRegistro = [...(paciente?.registros || [])]
    .sort((a, b) =>
      String(b.fecha).localeCompare(String(a.fecha))
    )[0];

  // Marcar como leídas las consultas al abrir el paciente.
  useEffect(() => {
    if (
      !paciente?.id ||
      !mensajesPaciente.some(
        (mensaje) =>
          mensaje.remitente === "paciente" &&
          !mensaje.leido
      )
    ) {
      return;
    }

    onMarcarLeidos?.(paciente.id);
  }, [paciente?.id, mensajes, onMarcarLeidos]);

  const indicadores = [
    {
      titulo: "Presión arterial",
      valor: ultimoRegistro
        ? `${ultimoRegistro.sistolica}/${ultimoRegistro.diastolica}`
        : "—",
      unidad: "mmHg",
      Icono: Activity,
    },
    {
      titulo: "Glucosa",
      valor: ultimoRegistro?.glucosa ?? "—",
      unidad: "mg/dL",
      Icono: Droplets,
    },
    {
      titulo: "Frecuencia cardíaca",
      valor:
        ultimoRegistro?.frecuenciaCardiaca ?? "—",
      unidad: "lpm",
      Icono: HeartPulse,
    },
    {
      titulo: "Frecuencia respiratoria",
      valor:
        ultimoRegistro?.frecuenciaRespiratoria ?? "—",
      unidad: "rpm",
      Icono: Wind,
    },
  ];

  function seleccionarPaciente(id) {
    setPacienteId(id);
    setRespuesta("");
    setMensajeSeleccionadoId("");
    setAviso("");
    setMostrarAnotacion(false);
    setTituloNota("");
    setTextoNota("");
  }

  function enviarRespuesta(evento) {
    evento.preventDefault();

    if (!paciente || !respuesta.trim()) return;

    onResponder(paciente.id, respuesta.trim());

    setRespuesta("");
    setAviso(
      "La respuesta quedó registrada en la conversación de demostración."
    );
  }

  function guardarAnotacion(evento) {
    evento.preventDefault();

    if (
      !paciente ||
      !tituloNota.trim() ||
      !textoNota.trim()
    ) {
      return;
    }

    onAgregarAnotacion({
      id: crypto.randomUUID(),
      pacienteId: paciente.id,
      citaId: null,
      titulo: tituloNota.trim(),
      texto: textoNota.trim(),
      autor: medico.nombre,
      creadoEn: new Date().toISOString(),
    });

    setTituloNota("");
    setTextoNota("");
    setMostrarAnotacion(false);

    setAviso(
      "La anotación quedó registrada en el expediente de demostración y en Agenda."
    );
  }

  return (
    <div className="medico-app">
      <SidebarMedico nombreMedico={medico.nombre} />

      <main className="medico-contenido mm-pagina">
        <div className="medico-migas">
          Centro clínico
          <span>›</span>
          <strong>Mensajes</strong>
        </div>

        <header className="mm-encabezado">
          <h1>Mensajes</h1>
          <p>
            Consulta los mensajes enviados por tus
            pacientes y responde cuando corresponda.
          </p>
        </header>

        {aviso && (
          <div className="mm-aviso" role="status">
            <CheckCircle2 size={17} />
            {aviso}
          </div>
        )}

        {/* FILA SUPERIOR */}
        <div className="mm-superior">
          <section className="mm-panel mm-listado">
            <div className="mm-buscador">
              <Search size={17} />

              <input
                type="search"
                placeholder="Buscar por nombre o diagnóstico"
                aria-label="Buscar paciente"
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
              />

              <span>
                {pacientesFiltrados.length}
              </span>
            </div>

            <div className="mm-lista-pacientes">
              {pacientesFiltrados.length === 0 && (
                <p className="mm-vacio">
                  No se encontraron pacientes.
                </p>
              )}

              {pacientesFiltrados.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    "mm-paciente " +
                    (paciente?.id === item.id
                      ? "activo"
                      : "")
                  }
                  onClick={() =>
                    seleccionarPaciente(item.id)
                  }
                >
                  <span className="mm-avatar">
                    {iniciales(item.nombre)}
                  </span>

                  <span className="mm-paciente-info">
                    <strong>{item.nombre}</strong>
                    <small>
                      {item.edad
                        ? `${item.edad} años · `
                        : ""}
                      {item.diagnosticos?.join(" · ") ||
                        "Sin diagnóstico registrado"}
                    </small>
                  </span>

                  <span className="mm-paciente-meta">
                    {item.sinLeer > 0 && (
                      <b>{item.sinLeer}</b>
                    )}

                    <small>
                      {item.ultimoMensaje
                        ? formatearFecha(
                            item.ultimoMensaje.fecha
                          )
                        : "Sin mensajes"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* FICHA CLÍNICA SUPERIOR */}
          <section className="mm-panel mm-ficha">
            {!paciente ? (
              <p className="mm-vacio">
                Selecciona un paciente para ver su
                resumen.
              </p>
            ) : (
              <>
                <div className="mm-ficha-cabecera">
                  <div className="mm-ficha-identidad">
                    <span className="mm-avatar grande">
                      {iniciales(paciente.nombre)}
                    </span>

                    <div>
                      <h2>{paciente.nombre}</h2>
                      <p>
                        {paciente.edad
                          ? `${paciente.edad} años · `
                          : ""}
                        {paciente.estado}
                      </p>
                    </div>
                  </div>

                  <Link
                    className="mm-ver-historia"
                    to={`/medico/pacientes?paciente=${encodeURIComponent(
                      paciente.id
                    )}&historia=1`}
                  >
                    <FileText size={15} />
                    Ver historia clínica
                  </Link>
                </div>

                <div className="mm-indicadores">
                  {indicadores.map((indicador) => {
                    const Icono = indicador.Icono;

                    return (
                      <div
                        className="mm-indicador"
                        key={indicador.titulo}
                      >
                        <span>
                          <Icono size={15} />
                          {indicador.titulo}
                        </span>

                        <strong>
                          {indicador.valor}
                          <small>
                            {" "}
                            {indicador.unidad}
                          </small>
                        </strong>
                      </div>
                    );
                  })}
                </div>

                <div className="mm-clinicos">
                  <div>
                    <small>
                      DIAGNÓSTICOS REGISTRADOS
                    </small>
                    <strong>
                      {paciente.diagnosticos?.join(
                        " · "
                      ) || "Sin información"}
                    </strong>
                  </div>

                  <div>
                    <small>TRATAMIENTO ACTUAL</small>
                    <strong>
                      {paciente.medicamentos?.length
                        ? paciente.medicamentos
                            .map(
                              (m) =>
                                `${m.nombre} ${m.dosis}`
                            )
                            .join(" · ")
                        : "Sin medicamentos registrados"}
                    </strong>
                  </div>
                </div>

                <div className="mm-ficha-acciones">
                  {ultimoRegistro ? (
                    <Link
                      className="mm-agregar-expediente"
                      to={`/medico/pacientes/${paciente.id}/editar?registro=${ultimoRegistro.id}`}
                    >
                      <ClipboardPen size={15} />
                      Agregar al expediente
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="mm-agregar-expediente"
                      onClick={() =>
                        setMostrarAnotacion(
                          (actual) => !actual
                        )
                      }
                    >
                      <NotebookPen size={15} />
                      Agregar anotación
                    </button>
                  )}
                </div>

                {/* Si no hay registros medibles,
                    guardamos una anotación sin
                    inventar valores clínicos. */}
                {mostrarAnotacion &&
                  !ultimoRegistro && (
                    <form
                      className="mm-form-nota"
                      onSubmit={guardarAnotacion}
                    >
                      <strong>
                        Nueva anotación del expediente
                      </strong>

                      <input
                        type="text"
                        placeholder="Título de la anotación"
                        aria-label="Título de anotación"
                        required
                        value={tituloNota}
                        onChange={(e) =>
                          setTituloNota(e.target.value)
                        }
                      />

                      <textarea
                        rows="3"
                        placeholder="Escribe una observación de demostración..."
                        aria-label="Texto de anotación"
                        required
                        value={textoNota}
                        onChange={(e) =>
                          setTextoNota(e.target.value)
                        }
                      />

                      <button type="submit">
                        Guardar anotación
                      </button>
                    </form>
                  )}
              </>
            )}
          </section>
        </div>

        {/* FILA INFERIOR */}
        <div className="mm-inferior">
          {/* LISTA DE CONSULTAS DEL PACIENTE */}
          <section className="mm-panel mm-bandeja">
            <div className="mm-titulo-panel">
              <h2>Consultas recibidas</h2>

              <span>
                {consultasRecibidas.length}
              </span>
            </div>

            <div className="mm-lista-consultas">
              {consultasRecibidas.length === 0 ? (
                <p className="mm-vacio">
                  Este paciente todavía no ha enviado
                  consultas.
                </p>
              ) : (
                consultasRecibidas.map((mensaje) => (
                  <button
                    type="button"
                    key={mensaje.id}
                    className={
                      "mm-consulta " +
                      (mensajeSeleccionadoId ===
                      mensaje.id
                        ? "activo"
                        : "")
                    }
                    onClick={() =>
                      setMensajeSeleccionadoId(
                        mensaje.id
                      )
                    }
                  >
                    <span className="mm-avatar">
                      {iniciales(paciente?.nombre)}
                    </span>

                    <span className="mm-consulta-info">
                      <strong>
                        {paciente?.nombre}
                        {!mensaje.leido &&
                          " · Sin leer"}
                      </strong>

                      <small>
                        {mensaje.texto}
                      </small>
                    </span>

                    <span className="mm-consulta-fecha">
                      {formatearFecha(mensaje.fecha)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* CONVERSACIÓN */}
          <section className="mm-panel mm-conversacion">
            <div className="mm-chat-cabecera">
              <div>
                <h2>
                  <MessageCircle size={19} />
                  Conversación
                </h2>

                <p>
                  {paciente?.nombre ||
                    "Selecciona un paciente"}
                </p>
              </div>

              {paciente && (
                <Link
                  to={`/medico/pacientes?paciente=${paciente.id}`}
                  className="mm-link-paciente"
                >
                  Ver paciente
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>

            <div className="mm-mensajes">
              {mensajesPaciente.length === 0 ? (
                <div className="mm-chat-vacio">
                  <MessageCircle size={28} />

                  <p>
                    No hay mensajes en esta
                    conversación.
                  </p>
                </div>
              ) : (
                mensajesPaciente.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={
                      "mm-burbuja " +
                      (mensaje.remitente === "medico"
                        ? "saliente"
                        : "entrante") +
                      (mensajeSeleccionadoId ===
                      mensaje.id
                        ? " resaltado"
                        : "")
                    }
                  >
                    <small>
                      {mensaje.remitente === "medico"
                        ? medico.nombre
                        : paciente?.nombre}
                      {" · "}
                      {formatearFecha(
                        mensaje.fecha
                      )}
                    </small>

                    <p>{mensaje.texto}</p>
                  </div>
                ))
              )}
            </div>

            <form
              className="mm-responder"
              onSubmit={enviarRespuesta}
            >
              <textarea
                rows="2"
                maxLength={2000}
                value={respuesta}
                disabled={!paciente}
                onChange={(evento) =>
                  setRespuesta(evento.target.value)
                }
                placeholder="Escribe una respuesta al paciente..."
                aria-label="Respuesta del médico"
              />

              <button
                type="submit"
                disabled={
                  !paciente || !respuesta.trim()
                }
              >
                <Send size={16} />
                Enviar
              </button>
            </form>

            <p className="mm-pie-chat">
              <AlertCircle size={13} />
              Mensajería de demostración. No envía
              comunicaciones clínicas reales.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default MensajesMedico;
