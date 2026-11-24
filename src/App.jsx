
import { useState } from "react";


import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import PanelPaciente from "./pages/PanelPaciente";
import RegistrarDatos from "./pages/RegistrarDatos";
import HistoriaClinica from "./pages/HistoriaClinica";
import IngresarMedicamentos from "./pages/IngresarMedicamentos";
import SeguimientoPaciente from "./pages/SeguimientoPaciente";
import MiPerfil from "./pages/MiPerfil";
import Registro from "./pages/Registro";
import AsistenteIA from "./pages/AsistenteIA";
import PanelMedico from "./pages/PanelMedico";
import SidebarMedico from "./components/SidebarMedico";

import {
  medicoDemo,
  pacientesDemo,
  citasDemo,
  mensajesDemo,
} from "./data/datosMedicoDemo";

import "./styles/Inicio.css";
import "./styles/App.css";


function App() {
  // Registros compartidos entre las páginas
  const [registros, setRegistros] = useState([]);
  const [historiaClinica, setHistoriaClinica] = useState(null);
  const [borradorRegistro, setBorradorRegistro] = useState(null);
  const [registroPendiente, setRegistroPendiente] = useState(null);
  const [datosMedico] = useState(() => ({pacientes: pacientesDemo,citas: citasDemo,mensajes: mensajesDemo,}));

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

function ModuloMedicoTemporal({ titulo, descripcion }) {
  return (
    <div className="medico-app">
      <SidebarMedico />

      <main className="medico-contenido">
        <div className="medico-migas">
          Centro clínico　›　{titulo}
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro onContinuar={setRegistroPendiente} />} />
        <Route path="/paciente/historia" element={<HistoriaClinica onGuardarHistoria={guardarHistoria}/>}/>
        <Route path="/paciente/perfil" element={<MiPerfil historiaClinica={historiaClinica} onGuardarHistoria={setHistoriaClinica} />}/>
        <Route path="/paciente/medicamentos" element={<IngresarMedicamentos />} />
        <Route path="/paciente/seguimiento" element={<SeguimientoPaciente registros={registros} historiaClinica={historiaClinica}/>}/>
        <Route path="/paciente" element={<PanelPaciente registros={registros} historiaClinica={historiaClinica} />}/>
        <Route path="/paciente/registrar" element={<RegistrarDatos onContinuar ={setBorradorRegistro} borrador={borradorRegistro}/>}/>
        <Route path="/paciente/registrar/medicamentos" element={borradorRegistro ? (<IngresarMedicamentos onGuardar={finalizarRegistro}/>):(<Navigate to="/paciente" />)}/>
        <Route path="/paciente/asistente" element={<AsistenteIA />} />


        <Route path="/medico" element={<PanelMedico medico={medicoDemo} pacientes={datosMedico.pacientes} citas={datosMedico.citas} mensajes={datosMedico.mensajes}/>}/>
        <Route path="/medico/pacientes" element={<ModuloMedicoTemporal titulo="Pacientes"descripcion="Consulta los expedientes y registros de tus pacientes."/>}/>
        <Route path="/medico/agenda" element={<ModuloMedicoTemporal titulo="Agenda"descripcion="Visualiza y gestiona tus citas médicas."/>}/>
        <Route path="/medico/mensajes" element={<ModuloMedicoTemporal titulo="Mensajes"descripcion="Revisa y responde los mensajes de tus pacientes."/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
