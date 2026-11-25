
export const medicoDemo = {
  id: "medico-demo-01",
  nombre: "Dr. Médico",
  especialidad: "Medicina general",
};

// Función auxiliar para las mediciones de demostración.
const crearRegistro = (
  id,
  fecha,
  sistolica,
  diastolica,
  glucosa,
  frecuenciaCardiaca,
  frecuenciaRespiratoria,
  comentarios = ""
) => ({
  id,
  fecha,
  sistolica,
  diastolica,
  glucosa,
  frecuenciaCardiaca,
  frecuenciaRespiratoria,
  comentarios,
});

export const pacientesDemo = [
  {
    id: "paciente-ana",
    medicoId: "medico-demo-01",
    nombre: "Ana Martínez López",
    edad: 67,
    sexo: "Femenino",
    diagnosticos: [
      "Diabetes tipo 2",
      "Hipertensión arterial",
    ],
    estado: "En seguimiento",
    resultadosNuevos: true,
    datosActualizados: true,
    medicamentos: [
      {
        nombre: "Metformina",
        dosis: "850 mg",
      },
      {
        nombre: "Losartán",
        dosis: "50 mg",
      },
    ],
    registros: [
      crearRegistro(
        "ana-1", "2026-11-16",
        132, 84, 120, 78, 16
      ),
      crearRegistro(
        "ana-2", "2026-11-19",
        135, 85, 123, 80, 16
      ),
      crearRegistro(
        "ana-3", "2026-11-23",
        138, 86, 126, 82, 16,
        "Ligero dolor de cabeza al despertar."
      ),

      crearRegistro(
        "ana-demo-01", "2026-11-03",
        125, 80, 112, 76, 16
      ),
      crearRegistro(
        "ana-demo-02", "2026-11-06",
        130, 82, 115, 79, 17
      ),
      crearRegistro(
        "ana-demo-03", "2026-11-09",
        127, 81, 118, 77, 16
      ),
      crearRegistro(
        "ana-demo-04", "2026-11-12",
        134, 84, 121, 81, 17
      ),
      crearRegistro(
        "ana-demo-05", "2026-11-14",
        129, 83, 119, 80, 16
      ),

    ],
  },
  {
    id: "paciente-jorge",
    medicoId: "medico-demo-01",
    nombre: "Jorge González",
    edad: 58,
    sexo: "Masculino",
    diagnosticos: ["Hipertensión arterial"],
    estado: "En seguimiento",
    resultadosNuevos: false,
    datosActualizados: true,
    medicamentos: [
      { nombre: "Enalapril", dosis: "10 mg" },
    ],
    registros: [
      crearRegistro(
        "jorge-1", "2026-11-18",
        128, 82, 97, 73, 16
      ),
      crearRegistro(
        "jorge-2", "2026-11-23",
        130, 83, 99, 75, 17
      ),
    ],
  },
  {
    id: "paciente-claudia",
    medicoId: "medico-demo-01",
    nombre: "Claudia Ramírez",
    edad: 72,
    sexo: "Femenino",
    diagnosticos: ["Riesgo renal"],
    estado: "En seguimiento",
    resultadosNuevos: true,
    datosActualizados: true,
    medicamentos: [],
    registros: [
      crearRegistro(
        "claudia-1", "2026-11-17",
        126, 80, 101, 76, 17
      ),
      crearRegistro(
        "claudia-2", "2026-11-22",
        129, 82, 103, 78, 17
      ),
    ],
  },
  {
    id: "paciente-miguel",
    medicoId: "medico-demo-01",
    nombre: "Miguel Sánchez",
    edad: 49,
    sexo: "Masculino",
    diagnosticos: ["Prediabetes"],
    estado: "En seguimiento",
    resultadosNuevos: true,
    datosActualizados: false,
    medicamentos: [],
    registros: [
      crearRegistro(
        "miguel-1", "2026-11-18",
        118, 78, 108, 71, 15
      ),
      crearRegistro(
        "miguel-2", "2026-11-21",
        120, 80, 111, 73, 16
      ),
    ],
  },
];

export const citasDemo = [
  {
    id: "cita-1",
    pacienteId: "paciente-jorge",
    fecha: "2026-11-26",
    hora: "08:30",
    duracion: 30,
    motivo: "Control de hipertensión",
    modalidad: "Presencial",
    lugar: "Consultorio 2",
    estado: "Confirmada",
  },
  {
    id: "cita-2",
    pacienteId: "paciente-ana",
    fecha: "2026-11-26",
    hora: "09:30",
    duracion: 30,
    motivo: "Seguimiento de diabetes e hipertensión",
    modalidad: "Presencial",
    lugar: "Consultorio 2",
    estado: "Confirmada",
  },
  {
    id: "cita-3",
    pacienteId: "paciente-claudia",
    fecha: "2026-11-26",
    hora: "10:30",
    duracion: 30,
    motivo: "Evaluación de riesgo renal",
    modalidad: "Presencial",
    lugar: "Consultorio 2",
    estado: "Confirmada",
  },
  {
    id: "cita-4",
    pacienteId: "paciente-miguel",
    fecha: "2026-11-26",
    hora: "11:30",
    duracion: 30,
    motivo: "Control de prediabetes",
    modalidad: "Presencial",
    lugar: "Consultorio 2",
    estado: "Por confirmar",
  },
];

export const mensajesDemo = [
  {
    id: "mensaje-1",
    pacienteId: "paciente-ana",
    remitente: "paciente",
    texto:
      "Buenos días, doctor. Quisiera consultar una duda antes de mi próxima cita.",
    fecha: "2026-11-24T09:15:00",
    leido: false,
  },
  {
    id: "mensaje-2",
    pacienteId: "paciente-ana",
    remitente: "medico",
    texto:
      "Buenos días. Puede dejar su consulta y la revisaremos.",
    fecha: "2026-11-24T10:00:00",
    leido: true,
  },
  {
    id: "mensaje-3",
    pacienteId: "paciente-jorge",
    remitente: "paciente",
    texto:
      "Hola, ¿debo llevar mis registros impresos a la consulta?",
    fecha: "2026-11-24T11:30:00",
    leido: false,
  },
  {
    id: "mensaje-4",
    pacienteId: "paciente-claudia",
    remitente: "paciente",
    texto:
      "Buenas tardes. He actualizado mis mediciones en la plataforma.",
    fecha: "2026-11-23T16:20:00",
    leido: true,
  },
];

export const anotacionesDemo = [
  {
    id: "nota-demo-1",
    pacienteId: "paciente-ana",
    citaId: "cita-2",
    titulo: "Preparación de la consulta",
    texto:
      "Revisar la evolución de los registros de presión arterial y glucosa durante el próximo control.",
    autor: "Dr. Médico",
    creadoEn: "2026-11-24T09:45:00",
  },
  {
    id: "nota-demo-2",
    pacienteId: "paciente-ana",
    citaId: null,
    titulo: "Seguimiento de registros",
    texto:
      "Continuar revisando los registros domiciliarios informados por la paciente.",
    autor: "Dr. Médico",
    creadoEn: "2026-11-20T10:00:00",
  },
  {
    id: "nota-demo-3",
    pacienteId: "paciente-jorge",
    citaId: "cita-1",
    titulo: "Control programado",
    texto:
      "Revisar los registros recientes durante el control de seguimiento.",
    autor: "Dr. Médico",
    creadoEn: "2026-11-23T08:30:00",
  },
];
