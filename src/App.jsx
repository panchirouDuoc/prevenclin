import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

//GENERAL
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

//PACIENTE
import PanelPaciente from "./pages/PanelPaciente";
import RegistrarDatos from "./pages/RegistrarDatos";
import HistoriaClinica from "./pages/HistoriaClinica";
import IngresarMedicamentos from "./pages/IngresarMedicamentos";
import SeguimientoPaciente from "./pages/SeguimientoPaciente";
import MiPerfil from "./pages/MiPerfil";
import AsistenteIA from "./pages/AsistenteIA";

//MÉDICO
import PanelMedico from "./pages/PanelMedico";
import SidebarMedico from "./components/SidebarMedico";
import PacientesMedico from "./pages/PacientesMedico";
import EditarExpedienteMedico from "./pages/EditarExpedienteMedico";
import AgendaMedico from "./pages/AgendaMedico";
import MensajesMedico from "./pages/MensajesMedico";

//DATOS
import {
  medicoDemo,
  pacientesDemo,
  citasDemo,
  mensajesDemo,
  anotacionesDemo,
} from "./data/datosMedicoDemo";

//ESTILOS
import "./styles/Inicio.css";
import "./styles/App.css";

const CLAVE_DATOS_MEDICO =
  "prevenclin-medico-demo-v1";

function crearDatosMedicoIniciales() {
  return {
    pacientes: pacientesDemo,
    citas: citasDemo,
    mensajes: mensajesDemo,
    anotaciones: anotacionesDemo,
  };
}

function recuperarDatosMedico() {
  try {
    const guardados = localStorage.getItem(
      CLAVE_DATOS_MEDICO
    );

    if (!guardados) {
      return crearDatosMedicoIniciales();
    }

    const datos = JSON.parse(guardados);

    if (
      !Array.isArray(datos.pacientes) ||
      !Array.isArray(datos.citas) ||
      !Array.isArray(datos.mensajes) ||
      !Array.isArray(datos.anotaciones)
    ) {
      return crearDatosMedicoIniciales();
    }

    return datos;
  } catch (error) {
    console.error(
      "Error al recuperar los datos de demostración:",
      error
    );

    return crearDatosMedicoIniciales();
  }
}

//PÁGINAS TEMPORALES
function ModuloMedicoTemporal({ titulo, descripcion }) {
  return (
    <div className="medico-app">
      <SidebarMedico />

      <main className="medico-contenido">
        <div className="medico-migas">
          Centro clínico › {titulo}
        </div>

        <header className="medico-encabezado">
          <div>
            <h1>{titulo}</h1>
            <p>{descripcion}</p>
          </div>
        </header>

        <section className="medico-modulo-provisional">
          <h2>Preparando módulo {titulo}</h2>
          <p>
            La navegación ya está configurada.
            Esta pantalla será reemplazada por
            su versión funcional según el prototipo.
          </p>
        </section>
      </main>
    </div>
  );
}

const PACIENTE_SESION_ID = "paciente-sesion-demo";

function App() {

  //ESTADOS DEL PACIENTE


  const [registros, setRegistros] = useState([]);

  const [historiaClinica, setHistoriaClinica] =
    useState(null);

  const [borradorRegistro, setBorradorRegistro] =
    useState(null);

  const [registroPendiente, setRegistroPendiente] =
    useState(null);

  //ESTADOS DEL MÉDICO
  const [datosMedico, setDatosMedico] = useState((recuperarDatosMedico));
// Guardar los cambios de demostración en el navegador.
useEffect(() => {
  try {
    const contenido = JSON.stringify(datosMedico);

    if (
      localStorage.getItem(CLAVE_DATOS_MEDICO) !==
      contenido
    ) {
      localStorage.setItem(
        CLAVE_DATOS_MEDICO,
        contenido
      );
    }
  } catch (error) {
    console.error(
      "No fue posible guardar los datos:",
      error
    );
  }
}, [datosMedico]);

// Sincronizar cambios entre pestañas del mismo navegador.
useEffect(() => {
  const sincronizarDatos = (evento) => {
    if (
      evento.key !== CLAVE_DATOS_MEDICO ||
      !evento.newValue
    ) {
      return;
    }

    try {
      const nuevosDatos = JSON.parse(
        evento.newValue
      );

      if (
        Array.isArray(nuevosDatos.pacientes) &&
        Array.isArray(nuevosDatos.citas) &&
        Array.isArray(nuevosDatos.mensajes) &&
        Array.isArray(nuevosDatos.anotaciones)
      ) {
        setDatosMedico(nuevosDatos);
      }
    } catch (error) {
      console.error(
        "Error al sincronizar datos:",
        error
      );
    }
  };

  window.addEventListener(
    "storage",
    sincronizarDatos
  );

  return () => {
    window.removeEventListener(
      "storage",
      sincronizarDatos
    );
  };
}, []);





  //FUNCIONES DEL PACIENTE


  
const guardarHistoria = (datos) => {
  const esCuentaNueva = Boolean(
    registroPendiente?.correo
  );

  if (esCuentaNueva) {
    // Una nueva cuenta comienza sin mediciones anteriores.
    setRegistros([]);
    setBorradorRegistro(null);

    // Limpiar únicamente los datos del paciente
    // de sesión anterior, conservando los pacientes demo.
    setDatosMedico((anterior) => ({
      ...anterior,

      pacientes: anterior.pacientes.filter(
        (paciente) =>
          paciente.id !== "paciente-sesion-demo"
      ),

      mensajes: anterior.mensajes.filter(
        (mensaje) =>
          mensaje.pacienteId !== "paciente-sesion-demo"
      ),

      citas: anterior.citas.filter(
        (cita) =>
          cita.pacienteId !== "paciente-sesion-demo"
      ),

      anotaciones: (
        anterior.anotaciones || []
      ).filter(
        (nota) =>
          nota.pacienteId !== "paciente-sesion-demo"
      ),
    }));
  }

  setHistoriaClinica((anterior) => ({
    ...(esCuentaNueva ? {} : anterior),
    ...datos,
    ...(esCuentaNueva
      ? { correo: registroPendiente.correo }
      : {}),
  }));

  setRegistroPendiente(null);
};


  const agregarRegistro = (nuevoRegistro) => {
    setRegistros((anteriores) => [
      ...anteriores,
      nuevoRegistro,
    ]);
  };

  const finalizarRegistro = (datosMedicamentos) => {
    if (!borradorRegistro) return;

    const registroCompleto = {
      ...borradorRegistro,
      ...datosMedicamentos,
      id: crypto.randomUUID(),
    };

    agregarRegistro(registroCompleto);
    setBorradorRegistro(null);
  };


  //FUNCIONES DEL MÉDICO


  const guardarEdicionExpediente = (
    pacienteId,
    registroEditado,
    nota
  ) => {
    const camposAuditados = [
      "fecha",
      "sistolica",
      "diastolica",
      "glucosa",
      "frecuenciaCardiaca",
      "frecuenciaRespiratoria",
      "comentarios",
    ];

    const eventoId = crypto.randomUUID();
    const fechaEdicion = new Date().toISOString();

    setDatosMedico((anterior) => ({
      ...anterior,

      pacientes: anterior.pacientes.map((paciente) => {
        if (
          paciente.id !== pacienteId ||
          paciente.medicoId !== medicoDemo.id
        ) {
          return paciente;
        }

        const registroAnterior = paciente.registros.find(
          (registro) => registro.id === registroEditado.id
        );

        if (!registroAnterior) {
          return paciente;
        }


        const cambios = camposAuditados
          .filter(
            (campo) =>
              String(registroAnterior[campo] ?? "") !==
              String(registroEditado[campo] ?? "")
          )
          .map((campo) => ({
            campo,
            anterior: registroAnterior[campo],
            nuevo: registroEditado[campo],
          }));

        if (!cambios.length && !nota.trim()) {
          return paciente;
        }


        const evento = {
          id: eventoId,
          registroId: registroEditado.id,
          fechaEdicion,
          autor: medicoDemo.nombre,
          cambios,
          nota: nota.trim(),
        };

        return {
          ...paciente,


          registros: paciente.registros.map((registro) =>
            registro.id === registroEditado.id
              ? { ...registro, ...registroEditado }
              : registro
          ),


          historialEdiciones: [
            ...(paciente.historialEdiciones || []),
            evento,
          ],
        };
      }),
    }));
  };

  const agregarCitaMedica = (nuevaCita) => {
    setDatosMedico((anterior) => ({
      ...anterior,
      citas: [
        ...anterior.citas,
        nuevaCita,
      ],
    }));
 };
 const agregarAnotacionMedica = (nuevaAnotacion) => {
    setDatosMedico((anterior) => ({
      ...anterior,
      anotaciones: [
        ...(anterior.anotaciones || []),
        nuevaAnotacion,
     ],
    }));
  };



// MENSAJERÍA DE DEMOSTRACIÓN
const obtenerRegistrosMedicos = () => {
  const numero = (valor) => {
    if (
      valor === undefined ||
      valor === null ||
      valor === ""
    ) {
      return null;
    }

    const convertido = Number(valor);

    return Number.isFinite(convertido)
      ? convertido
      : null;
  };

  return registros
    .map((registro) => {
      const sistolica = numero(
        registro.sistolica ??
        registro.presionSistolica
      );

      const diastolica = numero(
        registro.diastolica ??
        registro.presionDiastolica
      );

      const glucosa = numero(registro.glucosa);

      const frecuenciaCardiaca = numero(
        registro.frecuenciaCardiaca ??
        registro.pulso
      );

      const frecuenciaRespiratoria = numero(
        registro.frecuenciaRespiratoria ??
        registro.respiracion
      );

      const fecha = String(
        registro.fecha ?? registro.fechaRegistro ?? ""
      ).slice(0, 10);

      const valores = [
        sistolica,
        diastolica,
        glucosa,
        frecuenciaCardiaca,
        frecuenciaRespiratoria,
      ];

      if (
        valores.some((valor) => valor === null) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ) {
        return null;
      }

      return {
        id: registro.id || crypto.randomUUID(),
        fecha,
        sistolica,
        diastolica,
        glucosa,
        frecuenciaCardiaca,
        frecuenciaRespiratoria,
        comentarios: registro.comentarios || "",
      };
    })
    .filter(Boolean);
};

// Obtener un paciente ficticio a partir de
// la historia clínica creada en la sesión.
const obtenerPacienteSesion = () => {
  const nombres = String(
    historiaClinica?.nombres ??
    historiaClinica?.nombre ??
    ""
  ).trim();

  const apellidos = String(
    historiaClinica?.apellidos ??
    historiaClinica?.apellido ??
    ""
  ).trim();

  const nombreCompleto =
    `${nombres} ${apellidos}`.trim() ||
    "Paciente de demostración";

  const edadIngresada = Number(
    historiaClinica?.edad
  );

  const edad =
    Number.isInteger(edadIngresada) &&
    edadIngresada > 0 &&
    edadIngresada < 125
      ? edadIngresada
      : null;

  return {
    id: PACIENTE_SESION_ID,
    medicoId: medicoDemo.id,
    nombre: nombreCompleto,
    edad,
    sexo:
      historiaClinica?.sexo ||
      "No especificado",
    diagnosticos: [],
    estado: "En seguimiento",
    resultadosNuevos: false,
    datosActualizados: false,
    medicamentos: [],
    registros: obtenerRegistrosMedicos(),
    historialEdiciones: [],
  };
};

// Paciente -> Médico
const enviarConsultaAlMedico = (texto) => {
  const contenido = texto.trim();

  if (!contenido) return;

  const mensajeNuevo = {
    id: crypto.randomUUID(),
    pacienteId: PACIENTE_SESION_ID,
    remitente: "paciente",
    texto: contenido,
    fecha: new Date().toISOString(),
    leido: false,
  };

  const pacienteSesion = obtenerPacienteSesion();

  setDatosMedico((anterior) => {
    const existe = anterior.pacientes.some(
      (paciente) =>
        paciente.id === PACIENTE_SESION_ID
    );

    return {
      ...anterior,

      pacientes: existe
        ? anterior.pacientes
        : [
            ...anterior.pacientes,
            pacienteSesion,
          ],

      mensajes: [
        ...anterior.mensajes,
        mensajeNuevo,
      ],
    };
  });
};

// Médico -> Paciente
const responderMensajeMedico = (
  pacienteId,
  texto
) => {
  const contenido = texto.trim();

  if (!contenido) return;

  const respuestaNueva = {
    id: crypto.randomUUID(),
    pacienteId,
    remitente: "medico",
    texto: contenido,
    fecha: new Date().toISOString(),
    leido: true,
  };

  setDatosMedico((anterior) => {
    const asignado = anterior.pacientes.some(
      (paciente) =>
        paciente.id === pacienteId &&
        paciente.medicoId === medicoDemo.id
    );

    if (!asignado) return anterior;

    return {
      ...anterior,
      mensajes: [
        ...anterior.mensajes,
        respuestaNueva,
      ],
    };
  });
};

// Marcar las consultas como leídas
const marcarMensajesLeidos = (pacienteId) => {
  setDatosMedico((anterior) => {
    const haySinLeer = anterior.mensajes.some(
      (mensaje) =>
        mensaje.pacienteId === pacienteId &&
        mensaje.remitente === "paciente" &&
        !mensaje.leido
    );

    if (!haySinLeer) return anterior;

    return {
      ...anterior,

      mensajes: anterior.mensajes.map(
        (mensaje) =>
          mensaje.pacienteId === pacienteId &&
          mensaje.remitente === "paciente"
            ? { ...mensaje, leido: true }
            : mensaje
      ),
    };
  });
};


  return (
    <BrowserRouter>
      <Routes>

        {/* PÁGINAS GENERALES */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro onContinuar={setRegistroPendiente}/>}/>

        {/* MÓDULO PACIENTE */}
        <Route path="/paciente/historia" element={<HistoriaClinica onGuardarHistoria={guardarHistoria}/>}/>
        <Route path="/paciente/perfil" element={<MiPerfil historiaClinica={historiaClinica} onGuardarHistoria={setHistoriaClinica}/>}/>
        <Route path="/paciente" element={<PanelPaciente registros={registros} historiaClinica={historiaClinica}/>}/>
        <Route path="/paciente/registrar" element={<RegistrarDatos onContinuar={setBorradorRegistro} borrador={borradorRegistro}/>}/>
        <Route path="/paciente/registrar/medicamentos" element={borradorRegistro ? (<IngresarMedicamentos onGuardar={finalizarRegistro} />) : (<Navigate to="/paciente" replace />)}/>
        <Route path="/paciente/medicamentos" element={<IngresarMedicamentos />}/>
        <Route path="/paciente/seguimiento" element={<SeguimientoPaciente registros={registros} historiaClinica={historiaClinica}/>}/>
        <Route path="/paciente/asistente"element={<AsistenteIA onEnviarMensajeMedico={enviarConsultaAlMedico}mensajesMedicos={datosMedico.mensajes.filter((mensaje) => mensaje.pacienteId === PACIENTE_SESION_ID)}/>}/>

        {/* MÓDULO MÉDICO */}
        <Route path="/medico" element={<PanelMedico medico={medicoDemo} pacientes={datosMedico.pacientes} citas={datosMedico.citas} mensajes={datosMedico.mensajes}/>}/>
        <Route path="/medico/pacientes" element={<PacientesMedico medico={medicoDemo} pacientes={datosMedico.pacientes} citas={datosMedico.citas}/>}/>
        <Route path="/medico/pacientes/:pacienteId/editar" element={<EditarExpedienteMedico medico={medicoDemo} pacientes={datosMedico.pacientes} anotaciones={datosMedico.anotaciones} onGuardar={guardarEdicionExpediente}/>}/>
        <Route path="/medico/agenda" element={<AgendaMedico medico={medicoDemo} pacientes={datosMedico.pacientes} citas={datosMedico.citas} 
           anotaciones={datosMedico.anotaciones} onAgregarCita={agregarCitaMedica} onAgregarAnotacion={agregarAnotacionMedica}/>}/>
        <Route path="/medico/mensajes"   element={<MensajesMedico medico={medicoDemo} pacientes={datosMedico.pacientes} mensajes={datosMedico.mensajes}
         onResponder={responderMensajeMedico} onMarcarLeidos={marcarMensajesLeidos} onAgregarAnotacion={agregarAnotacionMedica}/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
