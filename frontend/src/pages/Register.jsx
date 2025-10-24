import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { saveAuth } from "../auth";
import "./register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");

    if (!name || !email || !password) {
      setMsg("Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { name, email, password, role });
      saveAuth(res.data.token, res.data.user);
      location.href = "/courses";
    } catch (err) {
      setMsg(err?.response?.data?.message || "Error de registro");
    } finally {
      setLoading(false);
    }
  }

  const h = new Date().getHours();
  const saludo = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="register-container">
      <div className="register-grid">
        {/* Left Side - Welcome */}
        <div className="welcome-side">
          <div className="welcome-content">
            <div className="greeting">
              <span className="greeting-icon">👋</span>
              {saludo}
            </div>
            <h1 className="welcome-title">
              Crea tu cuenta y aprende <span className="highlight">offline</span>
            </h1>
            <p className="welcome-description">
              Guarda tu progreso sin conexión y sincroniza cuando vuelvas a estar en línea.
            </p>
            <div className="welcome-actions">
              <Link to="/courses" className="btn btn-outline">Ver catálogo</Link>
              <div className="login-prompt">
                ¿Ya tienes cuenta? <Link to="/login" className="login-link">Inicia sesión</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="form-side">
          <div className="form-wrapper">
            <div className="form-header">
              <h2 className="form-title">Registro</h2>
              <p className="form-subtitle">Comienza tu journey de aprendizaje</p>
            </div>

            {msg && (
              <div className="alert error-alert">
                <span className="alert-icon">⚠️</span>
                {msg}
              </div>
            )}

            <form className="register-form" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nombre</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPwd(!showPwd)}
                  >
                    {showPwd ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="password-hint">Usa al menos 6 caracteres.</div>
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol</label>
                <select
                  id="role"
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  
                  <option value="student">Estudiante</option>
                </select>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <div className="form-footer">
                <Link to="/login" className="secondary-link">Ya tengo cuenta</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}