import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de inicio de sesión
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      
      {/* Animación de desplazamiento horizontal continuo de lado a lado */}
      <style jsx global>{`
        @keyframes marqueeHorizontal {
          0% {
            transform: translateY(-50%) translateX(100vw);
          }
          100% {
            transform: translateY(-50%) translateX(-100vw);
          }
        }

        .glow-title {
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 0 20px rgba(212, 175, 55, 0.6);
        }

        .glow-label {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* LOGO GIGANTE RECORRIENDO LA PANTALLA DE DERECHA A IZQUIERDA */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'marqueeHorizontal 18s linear infinite', // Cruza la pantalla en 18 segundos
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src="/logo.png" 
          alt="Monaco Logo Background" 
          style={{
            width: '550px',
            height: 'auto',
            opacity: 0.85, // Mantiene el rojo y blanco bien claros y nítidos
            filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 25px rgba(239, 68, 68, 0.3))'
          }}
        />
      </div>

      {/* CAJA DE LOGIN INTEGRADA EN NEGRO */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        padding: '40px 32px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
        border: '1px solid #222222',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(212, 175, 55, 0.15)'
      }}>
        <h2 className="glow-title" style={{
          marginBottom: '28px',
          fontSize: '26px',
          fontWeight: 'bold',
          color: '#ffffff',
          letterSpacing: '1px'
        }}>
          Acceso Admin
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
          <div>
            <label className="glow-label" style={{ display: 'block', fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '8px' }}>
              Correo Electrónico:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#0a0a0a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
              }}
            />
          </div>

          <div>
            <label className="glow-label" style={{ display: 'block', fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '8px' }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#0a0a0a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '12px',
              padding: '13px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#d4af37',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>

    </div>
  );
}
