
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AsistenteIA.css";

const preguntasSugeridas = [
  "¿Cómo subir documentos?",
  "¿Cómo ingresar mis registros?",
  "¿Tengo una cita próxima?",
  "¿Qué puedo consultar aquí?",
  "Comunicarme con un médico",
];

function crearMensaje(tipo, texto) {
  return {
    id: crypto.randomUUID(),
    tipo,
    texto,
  };
}

function AsistenteIA({
  onEnviarMensajeMedico,
  mensajesMedicos = [],
}) {
  const [mensaje, setMensaje] = useState("");
  const [modoContacto, setModoContacto] = useState(false);

  const [mensajes, setMensajes] = useState([
    crearMensaje(
      "bot",
      "Hola, ¿en qué puedo ayudarte hoy? Puedes preguntar sobre horarios, recordatorios, orientación general o ayuda para coordinar tu atención."
    ),
  ]);

  // Solo para el prototipo.
  // Posteriormente vendrá desde la agenda del paciente.
  const citaProxima = {
    existe: true,
    fecha: "28 de noviembre de 2026",
    hora: "10:30",
    especialidad: "Control de seguimiento",
  };

  const historialContacto = [...mensajesMedicos].sort(
    (a, b) => a.fecha.localeCompare(b.fecha)
  );

  function agregarMensajes(...nuevos) {
    setMensajes((anteriores) => [
      ...anteriores,
      ...nuevos,
    ]);
  }

  function iniciarContacto() {
    setModoContacto(true);
    setMensaje("");

    agregarMensajes(
      crearMensaje(
        "usuario",
        "Comunicarme con un médico"
      ),
      crearMensaje(
        "bot",
        "Has seleccionado contactar a tu médico. Escribe tu consulta en el campo inferior y presiona «Enviar al médico». El tiempo orientativo de respuesta es de 1 a 4 días hábiles. Este canal no está destinado a urgencias. Puedes cancelar antes de enviarla con la X o escribiendo «cancelar»."
      )
    );
  }

  function cancelarContacto() {
    setModoContacto(false);
    setMensaje("");

    agregarMensajes(
      crearMensaje(
        "bot",
        "Se canceló la redacción de tu consulta. No se envió ningún mensaje al médico."
      )
    );
  }

  function obtenerRespuesta(textoOriginal) {
    const texto = textoOriginal.toLowerCase();

    if (
      texto.includes("documento") ||
      texto.includes("adjuntar") ||
      texto.includes("archivo")
    ) {
      return "Para adjuntar documentos, entra a «Registro diario», completa tus mediciones y busca el apartado de archivos adjuntos. Puedes seleccionar documentos PDF o imágenes compatibles con el formulario.";
    }

    if (
      texto.includes("registro") ||
      texto.includes("medicion")
    ) {
      return "Para ingresar tus mediciones, selecciona «Registro diario» en el menú lateral. Completa los datos de presión arterial, glucosa, frecuencia cardíaca y respiratoria. Después podrás continuar al formulario de medicamentos.";
    }

    if (
      texto.includes("cita") ||
      texto.includes("recordatorio") ||
      texto.includes("horario")
    ) {
      if (!citaProxima.existe) {
        return "No hay citas próximas registradas en esta demostración.";
      }

      return `Según la agenda ficticia del asistente, tienes un ${citaProxima.especialidad.toLowerCase()} el ${citaProxima.fecha} a las ${citaProxima.hora}. Esta información es solo de demostración.`;
    }

    if (
      texto.includes("consultar") ||
      texto.includes("preguntar") ||
      texto.includes("ayuda")
    ) {
      return "Puedo orientarte para registrar mediciones, adjuntar archivos, consultar recordatorios ficticios y enviar una consulta a tu médico. No realizo diagnósticos ni recomendaciones clínicas personalizadas.";
    }

    return "Por ahora puedo responder preguntas sobre el funcionamiento de PrevenClin. También puedes seleccionar «Comunicarme con un médico» para escribir una consulta de demostración.";
  }

  function enviarMensaje(textoManual = null) {
    const contenido = (textoManual ?? mensaje).trim();

    if (!contenido) return;

    const textoNormalizado = contenido.toLowerCase();

    // Primero verificamos si el paciente desea cancelar.
    if (
      modoContacto &&
      (textoNormalizado === "cancelar" ||
        textoNormalizado === "cancelar mensaje" ||
        textoNormalizado === "cancelar consulta")
    ) {
      cancelarContacto();
      return;
    }

    // Cuando está activo el modo de contacto,
    // el contenido se envía a la bandeja médica.
    if (modoContacto) {
      if (typeof onEnviarMensajeMedico !== "function") {
        agregarMensajes(
          crearMensaje(
            "bot",
            "No se pudo registrar la consulta en esta sesión."
          )
        );
        return;
      }

      onEnviarMensajeMedico(contenido);

      setModoContacto(false);
      setMensaje("");

      agregarMensajes(
        crearMensaje(
          "bot",
          "Tu consulta quedó registrada en la bandeja del médico de demostración. El tiempo orientativo de respuesta es de 1 a 4 días hábiles. Podrás revisar aquí su respuesta cuando esté disponible en esta misma sesión."
        )
      );

      return;
    }

    // Se puede activar el contacto mediante el botón
    // sugerido o escribiendo la frase.
    if (
      textoNormalizado.includes(
        "comunicarme con un médico"
      ) ||
      textoNormalizado.includes(
        "comunicarme con un medico"
      ) ||
      textoNormalizado.includes(
        "contactar al medico"
      )
    ) {
      iniciarContacto();
      return;
    }

    agregarMensajes(
      crearMensaje("usuario", contenido),
      crearMensaje(
        "bot",
        obtenerRespuesta(contenido)
      )
    );

    setMensaje("");
  }

  function manejarSubmit(evento) {
    evento.preventDefault();
    enviarMensaje();
  }

  return (
    <div className="app-container">
      <Sidebar />

      <main className="asistente-pagina">
        <div className="asistente-ruta">
          <span>
            Asistente de IA <strong>›</strong>
          </span>
        </div>

        <header className="asistente-header">
          <h1>Asistente de IA</h1>

          <p>
            Orientación general, recordatorios y
            comunicación con tu médico.
          </p>
        </header>

        <section className="asistente-card">
          <div className="asistente-card-top">
            <div className="asistente-brand">
              <div className="asistente-avatar">
                IA
              </div>

              <div>
                <h2>Asistente de PrevenClin</h2>
                <p>Orientación de demostración</p>
              </div>
            </div>

            <span className="asistente-badge">
              General
            </span>
          </div>

          <p className="asistente-descripcion">
            Puedes preguntar sobre el funcionamiento
            de PrevenClin, recordatorios o cómo
            contactar a tu médico.
          </p>

          <div className="asistente-alerta">
            <strong>IMPORTANTE</strong>
            <p>
              Este asistente no reemplaza la atención
              médica. No realiza diagnósticos,
              prescripciones ni recomendaciones clínicas
              personalizadas. Los mensajes de esta
              versión no se envían a médicos reales.
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
                <small>
                  {item.tipo === "bot"
                    ? "ASISTENTE DE IA"
                    : "TÚ"}
                </small>

                <p>{item.texto}</p>
              </div>
            ))}

            {/* Mensajes que guarda el estado compartido.
                Permanecen al cambiar de página,
                mientras no se recargue el navegador. */}
            {historialContacto.map((item) => (
              <div
                key={item.id}
                className={
                  item.remitente === "medico"
                    ? "burbuja medico"
                    : "burbuja usuario"
                }
              >
                <small>
                  {item.remitente === "medico"
                    ? "RESPUESTA DEL MÉDICO"
                    : "CONSULTA ENVIADA"}
                </small>

                <p>{item.texto}</p>
              </div>
            ))}
          </div>

          {modoContacto && (
            <div
              className="asistente-modo-contacto"
              role="status"
            >
              <div>
                <strong>
                  Redactando consulta al médico
                </strong>

                <p>
                  El siguiente mensaje se registrará
                  en su bandeja de demostración.
                  Puedes cancelar antes del envío.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelarContacto}
                aria-label="Cancelar consulta al médico"
                title="Cancelar consulta"
              >
                ×
              </button>
            </div>
          )}

          {!modoContacto && (
            <div className="asistente-sugerencias">
              <span>PUEDES PREGUNTAR POR</span>

              <div className="asistente-botones-sugeridos">
                {preguntasSugeridas.map((pregunta) => (
                  <button
                    type="button"
                    key={pregunta}
                    onClick={() =>
                      enviarMensaje(pregunta)
                    }
                  >
                    {pregunta}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="asistente-form"
            onSubmit={manejarSubmit}
          >
            <label htmlFor="mensajeAsistente">
              {modoContacto
                ? "ESCRIBE TU CONSULTA AL MÉDICO"
                : "ESCRIBE TU MENSAJE"}
            </label>

            <div className="asistente-input-group">
              <input
                id="mensajeAsistente"
                type="text"
                maxLength={2000}
                placeholder={
                  modoContacto
                    ? "Escribe tu consulta o «cancelar»..."
                    : "Escribe una pregunta o pide ayuda..."
                }
                value={mensaje}
                onChange={(evento) =>
                  setMensaje(evento.target.value)
                }
              />

              {modoContacto && (
                <button
                  type="button"
                  className="asistente-cancelar-input"
                  onClick={cancelarContacto}
                  title="Cancelar consulta"
                  aria-label="Cancelar consulta"
                >
                  ×
                </button>
              )}

              <button type="submit">
                {modoContacto
                  ? "Enviar al médico"
                  : "Enviar"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AsistenteIA;
