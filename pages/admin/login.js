import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí tu lógica de inicio de sesión
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: '#fff'
    }}>
      
      {/* CSS para las animaciones */}
      <style jsx global>{`
        /* Animación para deslizar horizontalmente de extremo a extremo */
        @keyframes floatHorizontal {
          0% {
            transform: translateX(-60vw) rotate(0deg);
            opacity: 0.05;
          }
          50% {
            opacity: 0.15;
          }
          100% {
            transform: translateX(60vw) rotate(360deg);
            opacity: 0.05;
          }
        }
      `}</style>

      {/* LOGO ANIMADO DE FONDO */}
      <div style={{
        position: 'absolute',
        top: '25%',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'floatHorizontal 18s linear infinite alternate'
      }}>
        <img 
          src="/logo.png" // Asegúrate de cambiar la ruta si tu logo se llama diferente (ej: /images/logo.png)
          alt="Monaco Logo Background" 
          style={{
            width: '320px',
            height: 'auto',
            filter: 'grayscale(30%) brightness(1.2)'
          }}
        />
      </div>

      {/* CAJA DE LOGIN */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#121212',
        padding: '40px 30px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(212, 175, 55, 0.2)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        border: '1px solid #222'
      }}>
        <h2 style={{
          marginBottom: '24px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ffffff',
          letterSpacing: '0.5px'
        }}>
          Acceso Admin
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#ccc', marginBottom: '6px' }}>
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
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#ccc', marginBottom: '6px' }}>
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
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#d4af37',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>

    </div>
  );
}
