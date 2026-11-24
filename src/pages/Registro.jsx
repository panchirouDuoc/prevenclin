
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Registro.css";

function Registro({ onContinuar }) {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");

  const continuarRegistro = (e) => {
    e.preventDefault();
    setError("");

    const correoNormalizado = correo.trim().toLowerCase();

    if (!correoNormalizado) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (contrasena.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Prototipo: conservamos únicamente el correo.
    // La contraseña no se almacena ni se envía.
    onContinuar({
      correo: correoNormalizado,
    });

    navigate("/paciente/historia");
  };

  return (
    <div className="registro-cuenta-pagina">
      <header className="registro-cuenta-header">
        <Link to="/" className="registro-cuenta-logo">
          <span>✚</span>
          PrevenClin
        </Link>

        <Link to="/login" className="registro-cuenta-login">
          Iniciar sesión
        </Link>
      </header>

      <main className="registro-cuenta-contenido">
        <section className="registro-cuenta-tarjeta">
          <div className="registro-cuenta-encabezado">
            <span className="registro-cuenta-icono">
              ♙
            </span>

            <h1>Crear cuenta</h1>

            <p>
              Comienza a cuidar tu salud con PrevenClin.
              Completa tus datos de acceso para continuar.
            </p>
          </div>

          <form onSubmit={continuarRegistro}>
            <div className="registro-cuenta-campo">
              <label htmlFor="registroCorreo">
                Correo electrónico *
              </label>

              <input
                id="registroCorreo"
                type="email"
                placeholder="correo@ejemplo.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="registro-cuenta-campo">
              <label htmlFor="registroClave">
                Contraseña *
              </label>

              <input
                id="registroClave"
                type={
                  mostrarClave ? "text" : "password"
                }
                placeholder="Mínimo 8 caracteres"
                value={contrasena}
                onChange={(e) =>
                  setContrasena(e.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="registro-cuenta-campo">
              <label htmlFor="registroConfirmar">
                Confirmar contraseña *
              </label>

              <input
                id="registroConfirmar"
                type={
                  mostrarClave ? "text" : "password"
                }
                placeholder="Repite tu contraseña"
                value={confirmar}
                onChange={(e) =>
                  setConfirmar(e.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <label className="registro-cuenta-mostrar">
              <input
                type="checkbox"
                checked={mostrarClave}
                onChange={(e) =>
                  setMostrarClave(e.target.checked)
                }
              />
              Mostrar contraseñas
            </label>

            {error && (
              <p className="registro-cuenta-error" role="alert">
                {error}
              </p>
            )}

            <div className="registro-cuenta-aviso">
              Versión demostrativa: utiliza datos
              ficticios. La creación segura de cuentas
              se implementará con el backend.
            </div>

            <button
              type="submit"
              className="registro-cuenta-boton"
            >
              Continuar a Historia Clínica →
            </button>
          </form>

          <div className="registro-cuenta-pie">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login">Inicia sesión</Link>
          </div>
        </section>

        <aside className="registro-cuenta-informacion">
          <div className="registro-cuenta-distintivo">
            PLATAFORMA DE SALUD DIGITAL
          </div>

          <h2>
            Tu salud comienza con la prevención.
          </h2>

          <p>
            PrevenClin te acompaña en el
            automonitoreo y seguimiento de tu salud
            renal y metabólica.
          </p>

          <div className="registro-cuenta-beneficios">
            <div>
              <span>✓</span>
              Registro de indicadores de salud
            </div>

            <div>
              <span>✓</span>
              Seguimiento de mediciones
            </div>

            <div>
              <span>✓</span>
              Historial clínico organizado
            </div>

            <div>
              <span>✓</span>
              Información educativa y preventiva
            </div>
          </div>

          <p className="registro-cuenta-advertencia">
            PrevenClin es una herramienta de apoyo
            y no reemplaza el diagnóstico ni
            la atención médica profesional.
          </p>
        </aside>
      </main>
    </div>
  );
}

export default Registro;
