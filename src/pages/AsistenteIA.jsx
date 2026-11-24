import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AsistenteIA.css";

function AsistenteIA() {
  const [mensaje, setMensaje] = useState("");

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      tipo: "bot",
      texto:
        "Hola, ¿en qué puedo ayudarte hoy? Puedes preguntar sobre horarios, recordatorios, orientación general o ayuda para coordinar tu atención.",
    },
  ]);

  const citaProxima = {
    existe: true,
    fecha: "28 de noviembre de 2026",
    hora: "10:30",
    especialidad: "Control de seguimiento",
  };

  const sugerencias = [
    "¿Cómo subir documentos?",
    "¿Cómo ingresar mis registros?",
    "¿Tengo una cita próxima?",
    "¿Qué puedo consultar aquí?",
  ];

  const obtenerRespuesta = (textoUsuario) => {
    const texto = textoUsuario.toLowerCase().trim();

    if (
      texto.includes("subir documentos") ||
      texto.includes("adjuntar documentos") ||
      texto.includes("documentos")
    ) {
      return "Para subir documentos, entra a 'Registro diario' o al formulario correspondiente, busca el apartado 'Archivos adjuntos' y presiona 'Selecciona un archivo'. Puedes adjuntar archivos PNG, JPG, JPEG o PDF.";
    }

    if (
      texto.includes("ingresar mis registros") ||
      texto.includes("ingresar registros") ||
      texto.includes("registro diario") ||
      texto.includes("mis registros")
    ) {
      return "Para ingresar tus registros, entra al apartado 'Registro diario' en el menú lateral. Luego completa presión arterial, glucosa, frecuencia cardíaca, frecuencia respiratoria, fecha y comentarios. Después podrás continuar al apartado de medicamentos.";
    }

    if (
      texto.includes("cita") ||
      texto.includes("citas") ||
      texto.includes("recordatorio")
    ) {
      if (citaProxima.existe) {
        return `Sí, tienes una cita próxima: ${citaProxima.especialidad}, el día ${citaProxima.fecha} a las ${citaProxima.hora}. Recuerda llegar con anticipación.`;
      }

      return "Por el momento no tienes una cita próxima registrada.";
    }

    if (
      texto.includes("qué puedo consultar") ||
      texto.includes("que puedo consultar") ||
      texto.includes("ayuda") ||
      texto.includes("puedo preguntar")
    ) {
      return "Puedes consultarme sobre cómo usar la plataforma, cómo registrar mediciones, cómo adjuntar documentos y si tienes una cita próxima. Este asistente ofrece orientación general y no reemplaza a un profesional de salud.";
    }

    return "Por ahora solo puedo responder preguntas generales sobre uso de la plataforma, registros, documentos y recordatorios de citas.";
  };

  const enviarMensaje = (textoManual = null) => {
    const contenido = (textoManual ?? mensaje).trim();

    if (!contenido) return;

    const nuevoMensajeUsuario = {
      id: Date.now(),
      tipo: "usuario",
      texto: contenido,
    };

    const respuestaBot = {
      id: Date.now() + 1,
      tipo: "bot",
      texto: obtenerRespuesta(contenido),
    };

    setMensajes((prev) => [
      ...prev,
      nuevoMensajeUsuario,
      respuestaBot,
    ]);

    setMensaje("");
  };

  const manejarSubmit = (e) => {
    e.preventDefault();
    enviarMensaje();
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="asistente-pagina">
        <div className="asistente-ruta">
          <span>
            Asistente de IA <strong>›</strong>
          </span>

          <div className="asistente-superior-derecha">
            <button className="asistente-mini-btn">🔔</button>
            <button className="asistente-ayuda-btn">
              ⓘ Ayuda
            </button>
          </div>
        </div>

        <header className="asistente-header">
          <h1>Asistente de IA</h1>
          <p>
            Un espacio para orientarte con preguntas
            generales, recordatorios y ayuda para
            coordinar tu atención.
          </p>
        </header>

        <section className="asistente-card">
          <div className="asistente-card-top">
            <div className="asistente-brand">
              <div className="asistente-avatar">IA</div>

              <div>
                <h2>Asistente de PrevenClin</h2>
                <p>Disponible para orientación 24/7</p>
              </div>
            </div>

            <span className="asistente-badge">
              General
            </span>
          </div>

          <p className="asistente-descripcion">
            Puedes preguntar sobre horarios,
            recordatorios, orientación general y ayuda
            para coordinar tu atención. Si necesitas
            atención médica, siempre comunícate con tu
            equipo clínico.
          </p>

          <div className="asistente-alerta">
            <strong>IMPORTANTE</strong>
            <p>
              Este asistente no reemplaza a un médico ni
              a sus funciones. Solo ofrece ayuda general,
              orientación y recordatorios. No te brindará
              diagnósticos, prescripciones ni consejo
              clínico personalizado.
            </p>
          </div>

          <div className="asistente-chat">
            {mensajes.map((item) => (
              <div
                key={item.id}
                className={
                  item.tipo === "bot"
                    ? "burbuja bot"
                    : "burbuja usuario"
                }
              >
                {item.tipo === "bot" && (
                  <small>ASISTENTE DE IA</small>
                )}
                {item.tipo === "usuario" && (
                  <small>TÚ</small>
                )}
                <p>{item.texto}</p>
              </div>
            ))}
          </div>

          <div className="asistente-sugerencias">
            <span>PUEDES PREGUNTAR POR</span>

            <div className="asistente-botones-sugeridos">
              {sugerencias.map((pregunta) => (
                <button
                  key={pregunta}
                  type="button"
                  onClick={() => enviarMensaje(pregunta)}
                >
                  {pregunta}
                </button>
              ))}
            </div>
          </div>

          <form
            className="asistente-form"
            onSubmit={manejarSubmit}
          >
            <label htmlFor="mensajeAsistente">
              ESCRIBE TU MENSAJE
            </label>

            <div className="asistente-input-group">
              <input
                id="mensajeAsistente"
                type="text"
                placeholder="Escribe una pregunta o pide ayuda..."
                value={mensaje}
                onChange={(e) =>
                  setMensaje(e.target.value)
                }
              />

              <button type="submit">Enviar ✈</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AsistenteIA;