
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UsersRound,
  CalendarDays,
  FileText,
  Download,
  Activity,
  HeartPulse,
  Droplets,
  Wind,
  ClipboardList,
  AlertTriangle,
  X,
  Clock3,
  CheckCircle2,
  Pill,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { Pencil } from "lucide-react";

import { jsPDF } from "jspdf";
import SidebarMedico from "../components/SidebarMedico";
import "../styles/PacientesMedico.css";

const indicadores = [
  {
    key: "sistolica",
    nombre: "Presión sistólica",
    color: "#008979",
    unidad: "mmHg",
  },
  {
    key: "diastolica",
    nombre: "Presión diastólica",
    color: "#d9a13d",
    unidad: "mmHg",
  },
  {
    key: "glucosa",
    nombre: "Glucosa",
    color: "#e06b60",
    unidad: "mg/dL",
  },
  {
    key: "frecuenciaCardiaca",
    nombre: "Frec. cardíaca",
    color: "#527eb0",
    unidad: "lpm",
  },
  {
    key: "frecuenciaRespiratoria",
    nombre: "Frec. respiratoria",
    color: "#47a9bb",
    unidad: "rpm",
  },
];

function limpiarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function fechaBonita(fecha, opciones = {}) {
  if (!fecha) return "Sin fecha";

  const objeto = new Date(`${fecha.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(objeto.getTime())) return fecha;

  return objeto.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opciones,
  });
}

function mesBonito(mes) {
  if (!mes) return "";

  const fecha = new Date(`${mes}-01T12:00:00`);

  if (Number.isNaN(fecha.getTime())) return mes;

  return fecha.toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
}

function iniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/);

  return partes
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function ordenarRegistros(registros = []) {
  return [...registros].sort((a, b) =>
    String(a.fecha).localeCompare(String(b.fecha))
  );
}

function nombreArchivo(nombre) {
  return limpiarTexto(nombre)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function valorConUnidad(valor, unidad) {
  return valor === undefined || valor === null
    ? "Sin datos"
    : `${valor} ${unidad}`;
}

function TooltipClinico({ active, payload }) {
  if (!active || !payload?.length) return null;

  const registro = payload[0].payload.original;

  return (
    <div className="pm-tooltip">
      <strong>{fechaBonita(registro.fecha)}</strong>

      {indicadores.map((indicador) => (
        <div key={indicador.key}>
          <span
            className="pm-punto"
            style={{ background: indicador.color }}
          />
          {indicador.nombre}:{" "}
          <b>
            {valorConUnidad(
              registro[indicador.key],
              indicador.unidad
            )}
          </b>
        </div>
      ))}
    </div>
  );
}

function PacientesMedico({
  medico,
  pacientes = [],
  citas = [],
}) {
  const [busqueda, setBusqueda] = useState("");
  const [parametros] = useSearchParams();
  const [pacienteId, setPacienteId] = useState(() => parametros.get("paciente") || "");
  const [mes, setMes] = useState("");
  const [registroId, setRegistroId] = useState("");
  const [mostrarHistoria, setMostrarHistoria] =useState(() => parametros.get("historia") === "1");

  const pacientesAsignados = useMemo(
    () =>
      pacientes.filter(
        (paciente) => paciente.medicoId === medico.id
      ),
    [pacientes, medico.id]
  );

  const pacientesFiltrados = useMemo(() => {
    const termino = limpiarTexto(busqueda.trim());

    return pacientesAsignados.filter((paciente) => {
      const contenido = limpiarTexto(
        [
          paciente.nombre,
          ...(paciente.diagnosticos || []),
        ].join(" ")
      );

      return contenido.includes(termino);
    });
  }, [pacientesAsignados, busqueda]);

  const paciente =
    pacientesFiltrados.find(
      (item) => item.id === pacienteId
    ) ||
    pacientesFiltrados[0] ||
    null;

  const registros = useMemo(
    () => ordenarRegistros(paciente?.registros || []),
    [paciente]
  );

  const mesesDisponibles = useMemo(
    () =>
      [
        ...new Set(
          registros
            .map((item) => item.fecha?.slice(0, 7))
            .filter(Boolean)
        ),
      ].sort().reverse(),
    [registros]
  );

  const registrosFiltrados = useMemo(
    () =>
      registros.filter(
        (item) => !mes || item.fecha?.startsWith(mes)
      ),
    [registros, mes]
  );

  const ultimoRegistro = registros.at(-1) || null;

  const registroSeleccionado =
    registrosFiltrados.find(
      (item) => item.id === registroId
    ) ||
    registrosFiltrados.at(-1) ||
    null;

  const citasPaciente = citas
    .filter((cita) => cita.pacienteId === paciente?.id)
    .sort((a, b) =>
      `${a.fecha}T${a.hora}`.localeCompare(
        `${b.fecha}T${b.hora}`
      )
    );

  const hoy = new Date();
  const hoyLocal = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

  const proximaCita =
    citasPaciente.find((cita) => cita.fecha >= hoyLocal) ||
    null;

  // Todas las series se muestran en una escala relativa.
  // Esto permite comparar tendencias de unidades diferentes.
  // NO es una escala de riesgo o gravedad clínica.
  const datosGrafico = useMemo(() => {
    return registrosFiltrados.map((registro) => {
      const fila = {
        id: registro.id,
        fecha: registro.fecha,
        etiqueta: fechaBonita(registro.fecha, {
          year: undefined,
        }),
        original: registro,
      };

      indicadores.forEach((indicador) => {
        const valores = registrosFiltrados
          .map((item) => Number(item[indicador.key]))
          .filter(Number.isFinite);

        const valor = Number(registro[indicador.key]);

        if (
          !Number.isFinite(valor) ||
          valores.length === 0
        ) {
          fila[indicador.key] = null;
          return;
        }

        const minimo = Math.min(...valores);
        const maximo = Math.max(...valores);

        fila[indicador.key] =
          minimo === maximo
            ? 50
            : 15 +
              ((valor - minimo) /
                (maximo - minimo)) *
                70;
      });

      return fila;
    });
  }, [registrosFiltrados]);

  useEffect(() => {
    if (!mostrarHistoria) return;

    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") {
        setMostrarHistoria(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () =>
      window.removeEventListener(
        "keydown",
        cerrarConEscape
      );
  }, [mostrarHistoria]);

  function seleccionarPaciente(id) {
    setPacienteId(id);
    setMes("");
    setRegistroId("");
    setMostrarHistoria(false);
  }

  function exportarCSV() {
    if (!paciente || !registrosFiltrados.length) return;

    const columnas = [
      "Fecha",
      "Sistolica",
      "Diastolica",
      "Glucosa",
      "Frecuencia cardiaca",
      "Frecuencia respiratoria",
      "Comentarios",
    ];

    const filas = registrosFiltrados.map((item) => [
      item.fecha,
      item.sistolica,
      item.diastolica,
      item.glucosa,
      item.frecuenciaCardiaca,
      item.frecuenciaRespiratoria,
      item.comentarios || "",
    ]);

    const celdaCSV = (valor) => {
      let texto = String(valor ?? "");

      // Evita interpretar fórmulas al abrir el CSV
      // en aplicaciones de hojas de cálculo.
      if (/^[\s]*[=+\-@]/.test(texto)) {
        texto = "'" + texto;
      }

      return `"${texto.replace(/"/g, '""')}"`;
    };

    const contenido = [columnas, ...filas]
      .map((fila) => fila.map(celdaCSV).join(";"))
      .join("\r\n");

    const archivo = new Blob(
      ["\uFEFF" + contenido],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download =
      `registros_${nombreArchivo(paciente.nombre)}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
  }

  function exportarPDF() {
    if (!paciente) return;

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    let y = 19;

    function escribir(texto, opciones = {}) {
      const {
        tamano = 10,
        negrita = false,
        espacio = 7,
      } = opciones;

      pdf.setFont(
        "helvetica",
        negrita ? "bold" : "normal"
      );
      pdf.setFontSize(tamano);

      const lineas = pdf.splitTextToSize(
        String(texto),
        174
      );

      const alto = lineas.length * (tamano * 0.45);

      if (y + alto > 280) {
        pdf.addPage();
        y = 19;
      }

      pdf.text(lineas, 18, y);
      y += alto + espacio;
    }

    pdf.setTextColor(0, 120, 110);
    escribir("PrevenClin - Reporte de seguimiento", {
      tamano: 17,
      negrita: true,
      espacio: 10,
    });

    pdf.setTextColor(30, 55, 65);

    escribir(`Paciente: ${paciente.nombre}`, {
      negrita: true,
    });

    escribir(
      `Edad: ${paciente.edad} años | Médico: ${medico.nombre}`
    );

    escribir(
      `Diagnósticos registrados: ${
        paciente.diagnosticos?.join(", ") ||
        "Sin información"
      }`
    );

    escribir(
      `Tratamiento registrado: ${
        paciente.medicamentos?.length
          ? paciente.medicamentos
              .map(
                (m) => `${m.nombre} ${m.dosis}`
              )
              .join(", ")
          : "Sin información"
      }`
    );

    escribir(
      `Período: ${
        mes ? mesBonito(mes) : "Todos los registros"
      }`,
      { espacio: 10 }
    );

    escribir("REGISTROS DIARIOS", {
      negrita: true,
      tamano: 12,
    });

    if (registrosFiltrados.length === 0) {
      escribir("No existen registros para este período.");
    }

    registrosFiltrados.forEach((registro) => {
      escribir(
        `${fechaBonita(registro.fecha)} | ` +
          `PA ${registro.sistolica}/${registro.diastolica} mmHg | ` +
          `Glucosa ${registro.glucosa} mg/dL`
      );

      escribir(
        `FC ${registro.frecuenciaCardiaca} lpm | ` +
          `FR ${registro.frecuenciaRespiratoria} rpm`,
        { espacio: 5 }
      );

      if (registro.comentarios) {
        escribir(
          `Comentario: ${registro.comentarios}`,
          { espacio: 8 }
        );
      }
    });

    escribir(
      "Documento generado con datos de demostración. " +
        "No constituye un informe médico validado.",
      { tamano: 9 }
    );

    pdf.save(
      `prevenclin_${nombreArchivo(paciente.nombre)}.pdf`
    );
  }

  const metricas = ultimoRegistro
    ? [
        {
          nombre: "Presión arterial",
          valor: `${ultimoRegistro.sistolica}/${ultimoRegistro.diastolica}`,
          unidad: "mmHg",
          Icono: Activity,
          clase: "naranja",
        },
        {
          nombre: "Glucosa",
          valor: ultimoRegistro.glucosa,
          unidad: "mg/dL",
          Icono: Droplets,
          clase: "naranja",
        },
        {
          nombre: "Frecuencia cardíaca",
          valor: ultimoRegistro.frecuenciaCardiaca,
          unidad: "lpm",
          Icono: HeartPulse,
          clase: "verde",
        },
        {
          nombre: "Frecuencia respiratoria",
          valor: ultimoRegistro.frecuenciaRespiratoria,
          unidad: "rpm",
          Icono: Wind,
          clase: "azul",
        },
      ]
    : [];

  return (
    <div className="medico-app">
      <SidebarMedico nombreMedico={medico.nombre} />

      <main className="medico-contenido pm-pagina">
        <div className="medico-migas">
          Centro clínico
          <span>›</span>
          <strong>Pacientes</strong>
        </div>

        <header className="pm-encabezado">
          <h1>Pacientes</h1>
          <p>
            Revisa el estado clínico y los registros
            diarios de tus pacientes.
          </p>
        </header>

        <div className="pm-parte-superior">
          {/* BUSCADOR */}
          <section className="pm-panel pm-listado">
            <div className="pm-busqueda">
              <Search size={17} />

              <input
                type="search"
                placeholder="Buscar por nombre o diagnóstico"
                aria-label="Buscar pacientes"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />

              <span>{pacientesFiltrados.length}</span>
            </div>

            <div className="pm-lista-pacientes">
              {pacientesFiltrados.length === 0 && (
                <div className="pm-sin-resultados">
                  <UsersRound size={23} />
                  <p>No se encontraron pacientes.</p>
                </div>
              )}

              {pacientesFiltrados.map((item) => {
                const activo =
                  paciente?.id === item.id;

                const ultimo = ordenarRegistros(
                  item.registros || []
                ).at(-1);

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      "pm-paciente-item " +
                      (activo ? "activo" : "")
                    }
                    onClick={() =>
                      seleccionarPaciente(item.id)
                    }
                  >
                    <span className="pm-avatar">
                      {iniciales(item.nombre)}
                    </span>

                    <span className="pm-paciente-textos">
                      <strong>{item.nombre}</strong>
                      <small>
                        {item.edad} años ·{" "}
                        {item.diagnosticos?.join(" · ")}
                      </small>
                    </span>

                    <span className="pm-paciente-fecha">
                      <i />
                      {ultimo
                        ? fechaBonita(ultimo.fecha, {
                            year: undefined,
                          })
                        : "Sin datos"}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="pm-asignacion">
              Mostrando pacientes asignados a{" "}
              {medico.nombre}.
            </p>
          </section>

          {/* RESUMEN DEL PACIENTE */}
          <section className="pm-panel pm-resumen">
            {!paciente ? (
              <div className="pm-sin-seleccion">
                Selecciona un paciente de la lista
                para consultar sus datos.
              </div>
            ) : (
              <>
                <div className="pm-resumen-cabecera">
                  <div className="pm-identidad">
                    <span className="pm-avatar grande">
                      {iniciales(paciente.nombre)}
                    </span>

                    <div>
                      <div className="pm-nombre">
                        <h2>{paciente.nombre}</h2>
                        <span className="pm-etiqueta">
                          {paciente.estado}
                        </span>
                      </div>

                      <p>
                        {paciente.edad} años ·{" "}
                        {paciente.sexo || "Sin especificar"}
                        {" · "}
                        Último registro:{" "}
                        {fechaBonita(
                          ultimoRegistro?.fecha
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="pm-boton-historia"
                    onClick={() =>
                      setMostrarHistoria(true)
                    }
                  >
                    <FileText size={16} />
                    Ver historia clínica
                  </button>

                    <Link
                        className="pm-boton-editar"
                        to={`/medico/pacientes/${paciente.id}/editar?registro=${
                        ultimoRegistro?.id || ""}`}>
                        <Pencil size={16} />
                        Editar expediente
                    </Link>
                </div>

                <div className="pm-metricas">
                  {metricas.map((metrica) => {
                    const Icono = metrica.Icono;

                    return (
                      <div
                        className="pm-metrica"
                        key={metrica.nombre}
                      >
                        <div className="pm-metrica-titulo">
                          <Icono
                            size={15}
                            className={metrica.clase}
                          />
                          <span>{metrica.nombre}</span>
                        </div>

                        <strong>
                          {metrica.valor}
                          <small> {metrica.unidad}</small>
                        </strong>

                        <span className="pm-ultimo-valor">
                          Último valor
                        </span>
                      </div>
                    );
                  })}

                  {!ultimoRegistro && (
                    <p>No hay mediciones registradas.</p>
                  )}
                </div>

                <div className="pm-datos-adicionales">
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
                              (m) =>
                                `${m.nombre} ${m.dosis}`
                            )
                            .join(" · ")
                        : "Sin medicamentos registrados"}
                    </strong>
                  </div>
                </div>

                <div className="pm-aviso">
                  <AlertTriangle size={16} />

                  <span>
                    {paciente.resultadosNuevos
                      ? "Este paciente tiene resultados de demostración marcados para revisión."
                      : "Registros disponibles para consulta y seguimiento."}
                  </span>

                  {proximaCita && (
                    <span className="pm-fecha-cita">
                      Cita:{" "}
                      {fechaBonita(proximaCita.fecha)}
                    </span>
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        {/* EVOLUCIÓN DE REGISTROS */}
        {paciente && (
          <section className="pm-panel pm-seguimiento">
            <div className="pm-seguimiento-encabezado">
              <div>
                <h2>
                  <Activity size={19} />
                  Evolución de registros diarios
                </h2>

                <p>
                  {mes
                    ? mesBonito(mes)
                    : "Historial disponible"}
                </p>
              </div>

              <div className="pm-herramientas">
                <label className="pm-select-mes">
                  <CalendarDays size={15} />

                  <select
                    value={mes}
                    aria-label="Filtrar por mes"
                    onChange={(e) => {
                      setMes(e.target.value);
                      setRegistroId("");
                    }}
                  >
                    <option value="">
                      Todos los meses
                    </option>

                    {mesesDisponibles.map((valor) => (
                      <option
                        value={valor}
                        key={valor}
                      >
                        {mesBonito(valor)}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="pm-boton-exportar"
                  type="button"
                  onClick={exportarCSV}
                  disabled={!registrosFiltrados.length}
                >
                  <Download size={15} />
                  CSV
                </button>

                <button
                  className="pm-boton-exportar"
                  type="button"
                  onClick={exportarPDF}
                >
                  <FileText size={15} />
                  PDF
                </button>
              </div>
            </div>

            {registrosFiltrados.length > 0 ? (
              <>
                <div className="pm-leyenda">
                  {indicadores.map((indicador) => (
                    <div key={indicador.key}>
                      <span
                        className="pm-punto"
                        style={{
                          background: indicador.color,
                        }}
                      />
                      <span>{indicador.nombre}</span>

                      <strong>
                        {valorConUnidad(
                          registroSeleccionado?.[
                            indicador.key
                          ],
                          indicador.unidad
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="pm-zona-grafico">
                  <div className="pm-grafico-contenedor">
                    <div className="pm-grafico">
                      <ResponsiveContainer
                        width="100%"
                        height={325}
                      >
                        <LineChart
                          data={datosGrafico}
                          margin={{
                            top: 20,
                            right: 15,
                            bottom: 10,
                            left: -20,
                          }}
                          onClick={(evento) => {
                            const registro =
                              evento?.activePayload?.[0]
                                ?.payload?.original;

                            if (registro) {
                              setRegistroId(registro.id);
                            }
                          }}
                        >
                          <CartesianGrid
                            stroke="#e8eeee"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="etiqueta"
                            tick={{
                              fill: "#93a5a7",
                              fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            domain={[0, 100]}
                            ticks={[15, 50, 85]}
                            tickFormatter={(valor) =>
                              valor === 15
                                ? "Mín."
                                : valor === 50
                                  ? "Med."
                                  : "Máx."
                            }
                            tick={{
                              fill: "#93a5a7",
                              fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            content={<TooltipClinico />}
                          />

                          {indicadores.map((indicador) => (
                            <Line
                              key={indicador.key}
                              dataKey={indicador.key}
                              stroke={indicador.color}
                              strokeWidth={2.5}
                              type="monotone"
                              connectNulls={false}
                              dot={{
                                r: 3,
                                strokeWidth: 1,
                              }}
                              activeDot={{ r: 6 }}
                              isAnimationActive={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="pm-aclaracion">
                      Gráfico de tendencias relativas:
                      cada indicador utiliza su propio
                      mínimo y máximo del período.
                      La altura de las líneas no
                      representa gravedad clínica.
                      Selecciona un punto para consultar
                      sus valores originales.
                    </p>
                  </div>

                  <aside className="pm-detalle-registro">
                    <div className="pm-detalle-cabecera">
                      <div>
                        <h3>
                          {fechaBonita(
                            registroSeleccionado?.fecha
                          )}
                        </h3>
                        <p>Registro del paciente</p>
                      </div>

                      <span className="pm-etiqueta">
                        Completo
                      </span>
                    </div>

                    <label className="pm-elegir-registro">
                      Ver registro
                      <select
                        value={registroSeleccionado?.id || ""}
                        onChange={(e) =>
                          setRegistroId(e.target.value)
                        }
                      >
                        {registrosFiltrados.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {fechaBonita(item.fecha)}
                          </option>
                        ))}
                      </select>
                    </label>

                    {indicadores.map((indicador) => (
                      <div
                        className="pm-detalle-fila"
                        key={indicador.key}
                      >
                        <span>{indicador.nombre}</span>
                        <strong>
                          {valorConUnidad(
                            registroSeleccionado?.[
                              indicador.key
                            ],
                            indicador.unidad
                          )}
                        </strong>
                      </div>
                    ))}

                    <div className="pm-comentarios">
                      <h4>
                        <ClipboardList size={15} />
                        COMENTARIOS
                      </h4>

                      <p>
                        {registroSeleccionado?.comentarios ||
                          "El paciente no agregó comentarios en este registro."}
                      </p>
                    </div>

                    {proximaCita && (
                      <div className="pm-cita-detalle">
                        <Clock3 size={15} />
                        <span>
                          Próxima cita:
                          <strong>
                            {" "}
                            {fechaBonita(
                              proximaCita.fecha
                            )}{" "}
                            a las {proximaCita.hora}
                          </strong>
                        </span>
                      </div>
                    )}
                  </aside>
                </div>
              </>
            ) : (
              <div className="pm-grafico-vacio">
                No existen registros para el mes
                seleccionado.
              </div>
            )}
          </section>
        )}
      </main>

      {/* HISTORIA CLÍNICA DEL PACIENTE */}
      {mostrarHistoria && paciente && (
        <div
          className="pm-modal-fondo"
          onMouseDown={(evento) => {
            if (
              evento.target === evento.currentTarget
            ) {
              setMostrarHistoria(false);
            }
          }}
        >
          <section
            className="pm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-titulo-historia"
          >
            <header className="pm-modal-cabecera">
              <div>
                <h2 id="pm-titulo-historia">
                  Historia clínica
                </h2>
                <p>{paciente.nombre}</p>
              </div>

              <button
                type="button"
                aria-label="Cerrar historia clínica"
                onClick={() =>
                  setMostrarHistoria(false)
                }
              >
                <X size={20} />
              </button>
            </header>

            <div className="pm-modal-contenido">
              <div className="pm-modal-datos">
                <div>
                  <small>EDAD</small>
                  <strong>{paciente.edad} años</strong>
                </div>

                <div>
                  <small>SEXO REGISTRADO</small>
                  <strong>
                    {paciente.sexo || "Sin especificar"}
                  </strong>
                </div>

                <div>
                  <small>ESTADO</small>
                  <strong>{paciente.estado}</strong>
                </div>

                <div>
                  <small>REGISTROS</small>
                  <strong>{registros.length}</strong>
                </div>
              </div>

              <h3>
                <ClipboardList size={17} />
                Antecedentes registrados
              </h3>

              <p>
                {paciente.diagnosticos?.join(", ") ||
                  "Sin antecedentes informados."}
              </p>

              <h3>
                <Pill size={17} />
                Medicamentos registrados
              </h3>

              {paciente.medicamentos?.length ? (
                <div className="pm-modal-medicamentos">
                  {paciente.medicamentos.map(
                    (medicamento, indice) => (
                      <div key={indice}>
                        <strong>
                          {medicamento.nombre}
                        </strong>
                        <span>
                          {medicamento.dosis}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>
                  No hay medicamentos informados.
                </p>
              )}

              <h3>
                <CalendarDays size={17} />
                Citas registradas
              </h3>

              {citasPaciente.length ? (
                citasPaciente.map((cita) => (
                  <div
                    className="pm-modal-cita"
                    key={cita.id}
                  >
                    <strong>
                      {fechaBonita(cita.fecha)} ·{" "}
                      {cita.hora}
                    </strong>

                    <span>
                      {cita.motivo} · {cita.estado}
                    </span>
                  </div>
                ))
              ) : (
                <p>No hay citas registradas.</p>
              )}

              <h3>
                <CheckCircle2 size={17} />
                Evolución de mediciones
              </h3>

              <div className="pm-modal-tabla-wrap">
                <table className="pm-modal-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Presión</th>
                      <th>Glucosa</th>
                      <th>FC</th>
                      <th>FR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...registros]
                      .reverse()
                      .map((item) => (
                        <tr key={item.id}>
                          <td>
                            {fechaBonita(item.fecha)}
                          </td>
                          <td>
                            {item.sistolica}/
                            {item.diastolica}
                          </td>
                          <td>{item.glucosa}</td>
                          <td>
                            {item.frecuenciaCardiaca}
                          </td>
                          <td>
                            {item.frecuenciaRespiratoria}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <p className="pm-modal-nota">
                Historia clínica.
                La edición y el registro de cambios
                se aplican en Editar expediente.
              </p>
            </div>

            <footer className="pm-modal-pie">
              <button
                type="button"
                onClick={() =>
                  setMostrarHistoria(false)
                }
              >
                Cerrar
              </button>

              <button
                type="button"
                className="principal"
                onClick={exportarPDF}
              >
                <Download size={16} />
                Exportar PDF
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default PacientesMedico;
