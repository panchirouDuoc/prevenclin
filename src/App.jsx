
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// PÁGINAS GENERALES
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

// PÁGINAS DEL PACIENTE
import PanelPaciente from "./pages/PanelPaciente";
import RegistrarDatos from "./pages/RegistrarDatos";
import HistoriaClinica from "./pages/HistoriaClinica";
import IngresarMedicamentos from "./pages/IngresarMedicamentos";
import SeguimientoPaciente from "./pages/SeguimientoPaciente";
import MiPerfil from "./pages/MiPerfil";
import AsistenteIA from "./pages/AsistenteIA";

// PÁGINAS DEL MÉDICO
import PanelMedico from "./pages/PanelMedico";
import SidebarMedico from "./components/SidebarMedico";
import PacientesMedico from "./pages/PacientesMedico";
import EditarExpedienteMedico from "./pages/EditarExpedienteMedico";

// DATOS DE DEMOSTRACIÓN
import {
  medicoDemo,
  pacientesDemo,
  citasDemo,
  mensajesDemo,
} from "./data/datosMedicoDemo";

// ESTILOS
import "./styles/Inicio.css";
import "./styles/App.css";

// PÁGINAS TEMPORALES DEL MÉDICO
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

function App() {
  // ===================================
  // ESTADOS DEL PACIENTE
  // ===================================

  const [registros, setRegistros] = useState([]);

  const [historiaClinica, setHistoriaClinica] =
    useState(null);

  const [borradorRegistro, setBorradorRegistro] =
    useState(null);

  const [registroPendiente, setRegistroPendiente] =
    useState(null);

  // ===================================
  // ESTADOS DEL MÉDICO
  // ===================================

  const [datosMedico, setDatosMedico] = useState(() => ({
    pacientes: pacientesDemo,
    citas: citasDemo,
    mensajes: mensajesDemo,
  }));

  // ===================================
  // FUNCIONES DEL PACIENTE
  // ===================================

  const guardarHistoria = (datos) => {
    setHistoriaClinica((anterior) => ({
      ...anterior,
      ...datos,
      ...(registroPendiente
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

  // ===================================
  // FUNCIONES DEL MÉDICO
  // ===================================

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

        // Identificar qué campos fueron modificados
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

        // Registrar la edición
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

          // Actualizar únicamente el registro editado
          registros: paciente.registros.map((registro) =>
            registro.id === registroEditado.id
              ? { ...registro, ...registroEditado }
              : registro
          ),

          // Conservar las modificaciones anteriores
          historialEdiciones: [
            ...(paciente.historialEdiciones || []),
            evento,
          ],
        };
      }),
    }));
  };

  // ===================================
  // RUTAS DE LA APLICACIÓN
  // ===================================

  return (
    <BrowserRouter>
      <Routes>

        {/* PÁGINAS GENERALES */}
        <Route path="/" element={<Inicio />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/registro"
          element={
            <Registro
              onContinuar={setRegistroPendiente}
            />
          }
        />

        {/* MÓDULO PACIENTE */}
        <Route
          path="/paciente/historia"
          element={
            <HistoriaClinica
              onGuardarHistoria={guardarHistoria}
            />
          }
        />

        <Route
          path="/paciente/perfil"
          element={
            <MiPerfil
              historiaClinica={historiaClinica}
              onGuardarHistoria={setHistoriaClinica}
            />
          }
        />

        <Route
          path="/paciente"
          element={
            <PanelPaciente
              registros={registros}
              historiaClinica={historiaClinica}
            />
          }
        />

        <Route
          path="/paciente/registrar"
          element={
            <RegistrarDatos
              onContinuar={setBorradorRegistro}
              borrador={borradorRegistro}
            />
          }
        />

        <Route
          path="/paciente/registrar/medicamentos"
          element={
            borradorRegistro ? (
              <IngresarMedicamentos
                onGuardar={finalizarRegistro}
              />
            ) : (
              <Navigate to="/paciente" replace />
            )
          }
        />

        <Route
          path="/paciente/medicamentos"
          element={<IngresarMedicamentos />}
        />

        <Route
          path="/paciente/seguimiento"
          element={
            <SeguimientoPaciente
              registros={registros}
              historiaClinica={historiaClinica}
            />
          }
        />

        <Route
          path="/paciente/asistente"
          element={<AsistenteIA />}
        />

        {/* MÓDULO MÉDICO */}
        <Route
          path="/medico"
          element={
            <PanelMedico
              medico={medicoDemo}
              pacientes={datosMedico.pacientes}
              citas={datosMedico.citas}
              mensajes={datosMedico.mensajes}
            />
          }
        />

        <Route
          path="/medico/pacientes"
          element={
            <PacientesMedico
              medico={medicoDemo}
              pacientes={datosMedico.pacientes}
              citas={datosMedico.citas}
            />
          }
        />

        <Route
          path="/medico/pacientes/:pacienteId/editar"
          element={
            <EditarExpedienteMedico
              medico={medicoDemo}
              pacientes={datosMedico.pacientes}
              onGuardar={guardarEdicionExpediente}
            />
          }
        />

        <Route
          path="/medico/agenda"
          element={
            <ModuloMedicoTemporal
              titulo="Agenda"
              descripcion="Visualiza y gestiona tus citas médicas."
            />
          }
        />

        <Route
          path="/medico/mensajes"
          element={
            <ModuloMedicoTemporal
              titulo="Mensajes"
              descripcion="Revisa y responde los mensajes de tus pacientes."
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
