
import { useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
  ClipboardCheck,
  CalendarDays,
  FileText,
  ShieldCheck,
  History,
  CheckCircle2,
  Circle,
  AlertCircle,
  NotebookPen,
} from "lucide-react";

import SidebarMedico from "../components/SidebarMedico";
import "../styles/EditarExpedienteMedico.css";

const camposNumericos = [
  "sistolica",
  "diastolica",
  "glucosa",
  "frecuenciaCardiaca",
  "frecuenciaRespiratoria",
];

function crearFormulario(registro) {
  return {
    fecha: registro?.fecha || "",
    sistolica: String(registro?.sistolica ?? ""),
    diastolica: String(registro?.diastolica ?? ""),
    glucosa: String(registro?.glucosa ?? ""),
    frecuenciaCardiaca: String(
      registro?.frecuenciaCardiaca ?? ""
    ),
    frecuenciaRespiratoria: String(
      registro?.frecuenciaRespiratoria ?? ""
    ),
    comentarios: registro?.comentarios || "",
  };
}

function EditarExpedienteMedico({
  medico,
  pacientes = [],
  anotaciones = [],
  onGuardar,
}) {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  const [parametros] = useSearchParams();

  const paciente = pacientes.find(
    (item) =>
      item.id === pacienteId &&
      item.medicoId === medico.id
  );

  const registros = useMemo(
    () =>
      [...(paciente?.registros || [])].sort(
        (a, b) => b.fecha.localeCompare(a.fecha)
      ),
    [paciente]
  );

  const idSolicitado = parametros.get("registro");

  const registroInicial =
    registros.find((item) => item.id === idSolicitado) ||
    registros[0] ||
    null;

  const [registroId, setRegistroId] = useState(
    registroInicial?.id || ""
  );

  const [formulario, setFormulario] = useState(() =>
    crearFormulario(registroInicial)
  );

  const [anotacion, setAnotacion] = useState("");
  const [archivoNombre, setArchivoNombre] = useState("");
  const [error, setError] = useState("");

  const registroOriginal = registros.find(
    (registro) => registro.id === registroId
  );

  const anotacionesPaciente = anotaciones
  .filter((nota) => nota.pacienteId === pacienteId)
  .sort((a, b) =>
    b.creadoEn.localeCompare(a.creadoEn)
  );

  const camposResumen = [
    {
      nombre: "Presión arterial",
      completo:
        formulario.sistolica !== "" &&
        formulario.diastolica !== "",
    },
    {
      nombre: "Glucosa",
      completo: formulario.glucosa !== "",
    },
    {
      nombre: "Frecuencia cardíaca",
      completo: formulario.frecuenciaCardiaca !== "",
    },
    {
      nombre: "Frecuencia respiratoria",
      completo: formulario.frecuenciaRespiratoria !== "",
    },
    {
      nombre: "Fecha de registro",
      completo: formulario.fecha !== "",
    },
    {
      nombre: "Comentarios",
      completo: formulario.comentarios.trim() !== "",
      opcional: true,
    },
    {
      nombre: "Anotación médica",
      completo: anotacion.trim() !== "",
      opcional: true,
    },
  ];

  const camposModificados = registroOriginal
    ? Object.entries(formulario).filter(
        ([campo, valor]) =>
          String(valor) !==
          String(registroOriginal[campo] ?? "")
      )
    : [];

  const hayCambios =
    camposModificados.length > 0 ||
    anotacion.trim().length > 0;

  const historial = (
    paciente?.historialEdiciones || []
  )
    .filter((evento) => evento.registroId === registroId)
    .slice()
    .reverse();

  function actualizarCampo(nombre, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [nombre]: valor,
    }));
    setError("");
  }

  function cambiarRegistro(id) {
    const seleccionado = registros.find(
      (item) => item.id === id
    );

    if (!seleccionado) return;

    setRegistroId(id);
    setFormulario(crearFormulario(seleccionado));
    setAnotacion("");
    setArchivoNombre("");
    setError("");
  }

  function guardarCambios(evento) {
    evento.preventDefault();

    if (!paciente || !registroOriginal) {
      setError("No se encontró el registro seleccionado.");
      return;
    }

    const numeros = {};

    for (const campo of camposNumericos) {
      const valor = Number(formulario[campo]);

      if (
        formulario[campo].trim() === "" ||
        !Number.isFinite(valor) ||
        !Number.isInteger(valor) ||
        valor <= 0
      ) {
        setError(
          "Completa las mediciones con números enteros positivos."
        );
        return;
      }

      numeros[campo] = valor;
    }

    if (
      !formulario.fecha ||
      Number.isNaN(
        new Date(`${formulario.fecha}T12:00:00`).getTime()
      )
    ) {
      setError("Selecciona una fecha de registro válida.");
      return;
    }

    if (!hayCambios) {
      setError(
        "Modifica algún dato o agrega una anotación médica."
      );
      return;
    }

    const registroEditado = {
      ...registroOriginal,
      ...numeros,
      fecha: formulario.fecha,
      comentarios: formulario.comentarios.trim(),
    };

    onGuardar(
      paciente.id,
      registroEditado,
      anotacion.trim()
    );

    navigate(
      `/medico/pacientes?paciente=${encodeURIComponent(
        paciente.id
      )}`
    );
  }

  if (!paciente || !registroInicial) {
    return (
      <div className="medico-app">
        <SidebarMedico nombreMedico={medico.nombre} />

        <main className="medico-contenido">
          <h1>Expediente no disponible</h1>

          <p>
            No se encontró un paciente asignado al
            médico con registros para editar.
          </p>

          <button
            type="button"
            onClick={() => navigate("/medico/pacientes")}
          >
            Volver a Pacientes
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="medico-app">
      <SidebarMedico nombreMedico={medico.nombre} />

      <main className="medico-contenido em-pagina">
        <div className="medico-migas">
          Centro clínico
          <span>›</span>
          Pacientes
          <span>›</span>
          <strong>Editar expediente</strong>
        </div>

        <div className="em-encabezado">
          <div>
            <h1>Editar Expediente</h1>
            <p>
              Actualiza un registro de demostración del
              paciente seleccionado.
            </p>
          </div>

          <button
            className="em-volver"
            type="button"
            onClick={() =>
              navigate(
                `/medico/pacientes?paciente=${paciente.id}`
              )
            }
          >
            <ArrowLeft size={16} />
            Volver a Pacientes
          </button>
        </div>

        {/* INFORMACIÓN DEL PACIENTE */}
        <section className="em-tarjeta em-paciente">
          <div className="em-identidad">
            <span className="em-avatar">
              {paciente.nombre
                .split(" ")
                .slice(0, 2)
                .map((parte) => parte[0])
                .join("")
                .toUpperCase()}
            </span>

            <div>
              <h2>{paciente.nombre}</h2>
              <p>
                {paciente.edad} años ·{" "}
                {paciente.estado}
              </p>
            </div>
          </div>

          <div className="em-cuadros-datos">
            <div>
              <small>DIAGNÓSTICOS REGISTRADOS</small>
              <strong>
                {paciente.diagnosticos?.join(" · ") ||
                  "Sin información"}
              </strong>
            </div>

            <div>
              <small>TRATAMIENTO ACTUAL</small>
              <strong>
                {paciente.medicamentos?.length
                  ? paciente.medicamentos
                      .map(
                        (med) =>
                          `${med.nombre} ${med.dosis}`
                      )
                      .join(" · ")
                  : "Sin medicamentos registrados"}
              </strong>
            </div>
          </div>
        </section>

        <div className="em-columnas">
          {/* FORMULARIO DE EDICIÓN */}
          <section className="em-tarjeta em-formulario">
            <form onSubmit={guardarCambios}>
              <h2>
                <ClipboardCheck size={19} />
                Datos ingresados
              </h2>

              <div className="em-selector-registro">
                <label htmlFor="em-registro">
                  Registro que deseas modificar
                </label>

                <select
                  id="em-registro"
                  value={registroId}
                  onChange={(evento) =>
                    cambiarRegistro(evento.target.value)
                  }
                >
                  {registros.map((registro) => (
                    <option
                      key={registro.id}
                      value={registro.id}
                    >
                      {registro.fecha} —{" "}
                      {registro.sistolica}/
                      {registro.diastolica} mmHg
                    </option>
                  ))}
                </select>
              </div>

              <div className="em-campos">
                <div className="em-campo em-presion">
                  <label>
                    Presión arterial *
                  </label>

                  <div className="em-presion-valores">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      aria-label="Presión sistólica"
                      value={formulario.sistolica}
                      onChange={(e) =>
                        actualizarCampo(
                          "sistolica",
                          e.target.value
                        )
                      }
                      required
                    />

                    <span>/</span>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      aria-label="Presión diastólica"
                      value={formulario.diastolica}
                      onChange={(e) =>
                        actualizarCampo(
                          "diastolica",
                          e.target.value
                        )
                      }
                      required
                    />

                    <small>mmHg</small>
                  </div>
                </div>

                <div className="em-campo">
                  <label htmlFor="em-glucosa">
                    Glucosa *
                  </label>

                  <div className="em-input-unidad">
                    <input
                      id="em-glucosa"
                      type="number"
                      min="1"
                      step="1"
                      value={formulario.glucosa}
                      onChange={(e) =>
                        actualizarCampo(
                          "glucosa",
                          e.target.value
                        )
                      }
                      required
                    />
                    <small>mg/dL</small>
                  </div>
                </div>

                <div className="em-campo">
                  <label htmlFor="em-cardiaca">
                    Frecuencia cardíaca *
                  </label>

                  <div className="em-input-unidad">
                    <input
                      id="em-cardiaca"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formulario.frecuenciaCardiaca
                      }
                      onChange={(e) =>
                        actualizarCampo(
                          "frecuenciaCardiaca",
                          e.target.value
                        )
                      }
                      required
                    />
                    <small>LPM</small>
                  </div>
                </div>

                <div className="em-campo">
                  <label htmlFor="em-respiratoria">
                    Frecuencia respiratoria *
                  </label>

                  <div className="em-input-unidad">
                    <input
                      id="em-respiratoria"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formulario.frecuenciaRespiratoria
                      }
                      onChange={(e) =>
                        actualizarCampo(
                          "frecuenciaRespiratoria",
                          e.target.value
                        )
                      }
                      required
                    />
                    <small>RPM</small>
                  </div>
                </div>

                <div className="em-campo">
                  <label htmlFor="em-fecha">
                    Fecha de registro *
                  </label>

                  <div className="em-input-unidad">
                    <CalendarDays size={15} />

                    <input
                      id="em-fecha"
                      type="date"
                      value={formulario.fecha}
                      onChange={(e) =>
                        actualizarCampo(
                          "fecha",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="em-campo em-completo">
                <label htmlFor="em-comentarios">
                  Comentarios del registro
                </label>

                <textarea
                  id="em-comentarios"
                  rows="3"
                  value={formulario.comentarios}
                  onChange={(e) =>
                    actualizarCampo(
                      "comentarios",
                      e.target.value
                    )
                  }
                  placeholder="Comentarios originales del registro..."
                />
              </div>

              <div className="em-campo em-completo">
                <label htmlFor="em-anotacion">
                  Nueva anotación del médico
                </label>

                <textarea
                  id="em-anotacion"
                  rows="4"
                  value={anotacion}
                  onChange={(e) =>
                    setAnotacion(e.target.value)
                  }
                  placeholder="Agrega una observación o información obtenida durante la consulta..."
                />

                <small className="em-ayuda">
                  Esta anotación se agregará al historial
                  de ediciones sin reemplazar los
                  comentarios originales del paciente.
                </small>
              </div>

              {/* ADJUNTOS: SOLO DEMOSTRACIÓN */}
              <div className="em-campo em-completo">
                <label htmlFor="em-archivo">
                  Archivos adjuntos
                </label>

                <input
                  id="em-archivo"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(evento) =>
                    setArchivoNombre(
                      evento.target.files?.[0]?.name ||
                        ""
                    )
                  }
                />

                <small className="em-ayuda">
                  {archivoNombre
                    ? `Seleccionado: ${archivoNombre}. `
                    : ""}
                  Los archivos todavía no se almacenan
                  ni se envían: esta opción es una
                  demostración visual.
                </small>
              </div>

              <div className="em-nota-seguridad">
                <ShieldCheck size={17} />

                <span>
                  Las modificaciones conservan sus
                  valores anteriores y una anotación
                  de demostración dentro de la sesión.
                </span>
              </div>

              {error && (
                <p className="em-error" role="alert">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}

              <div className="em-acciones">
                <button
                  type="button"
                  className="em-cancelar"
                  onClick={() =>
                    navigate(
                      `/medico/pacientes?paciente=${paciente.id}`
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="em-guardar"
                  disabled={!hayCambios}
                >
                  <Save size={16} />
                  Terminar edición
                </button>
              </div>
            </form>
          </section>

          {/* RESUMEN DEL FORMULARIO */}
          <aside className="em-tarjeta em-resumen">
            <div className="em-resumen-icono">
              <FileText size={23} />
            </div>

            <h2>Resumen de tu registro</h2>

            <p>
              Revisa los avances antes de actualizar el
              expediente.
            </p>

            <div className="em-lista-resumen">
              {camposResumen.map((campo) => (
                <div
                  className="em-resumen-item"
                  key={campo.nombre}
                >
                  {campo.completo ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Circle size={20} />
                  )}

                  <div>
                    <strong>{campo.nombre}</strong>

                    <small>
                      {campo.completo
                        ? "Completado"
                        : campo.opcional
                          ? "Opcional"
                          : "Pendiente"}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <div className="em-cambios">
              <strong>
                Campos modificados:{" "}
                {camposModificados.length}
              </strong>

              <small>
                {anotacion.trim()
                  ? "Incluye una nueva anotación médica."
                  : "Sin nueva anotación médica."}
              </small>
            </div>

            <div className="em-historial">
              <h3>
                <History size={16} />
                Historial de ediciones
              </h3>

              {historial.length === 0 ? (
                <p>
                  Este registro todavía no tiene
                  modificaciones realizadas por el médico.
                </p>
              ) : (
                historial.map((evento) => (
                  <div
                    className="em-evento"
                    key={evento.id}
                  >
                    <strong>{evento.autor}</strong>

                    <small>
                      {new Date(
                        evento.fechaEdicion
                      ).toLocaleString("es-CL")}
                    </small>

                    {evento.cambios.map((cambio) => (
                      <p key={cambio.campo}>
                        {cambio.campo}:{" "}
                        {String(
                          cambio.anterior ?? "Vacío"
                        )}{" "}
                        → {String(cambio.nuevo)}
                      </p>
                    ))}

                    {evento.nota && (
                      <p>
                        Anotación: {evento.nota}
                      </p>
                    )}
                  </div>
                ))
              )}

            </div>


            <div className="em-historial">
                <h3>
                    <NotebookPen size={16} />
                    Anotaciones de Agenda
                </h3>

                {anotacionesPaciente.length === 0 ? (
                    <p>
                    No hay anotaciones registradas desde Agenda.
                    </p>
                ) : (
                   anotacionesPaciente.map((nota) => (
                    <div className="em-evento" key={nota.id}>
                        <strong>{nota.titulo}</strong>

                        <small>
                            {nota.autor} ·{" "}
                            {new Date(nota.creadoEn).toLocaleString(
                             "es-CL"
                            )}
                        </small>

                        <p>{nota.texto}</p>
                    </div>
                   ))
                )}
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}

export default EditarExpedienteMedico;
