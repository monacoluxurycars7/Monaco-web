import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí va tu lógica de inicio de sesión de Firebase
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#000000', // Negro puro para coincidir con el logo
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: '#fff'
    }}>
      
      {/* Animación CSS para desplazamiento horizontal */}
      <style jsx global>{`
        @keyframes moverHorizontal {
          0% {
            transform: translateX(-100vw);
          }
          100% {
            transform: translateX(100vw);
          }
        }
      `}</style>

      {/* LOGO ANIMADO DE FONDO (Más grande, más brillante y movimiento horizontal) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        animation: 'moverHorizontal 14s linear infinite'
      }}>
        <img 
          src="/logo.png" 
          alt="Monaco Logo Background" 
          style={{
            width: '650px', // Tamaño más grande
            maxWidth: '90vw',
            height: 'auto',
            filter: 'brightness(1.6) drop-shadow(0 0 25px rgba(212, 175, 55, 0.4))', // Más brillo y resplandor dorado
            mixBlendMode: 'screen' // Elimina bordes o diferencias de negro
          }}
        />
      </div>

      {/* CAJA DE LOGIN (Superpuesta en el centro) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(15, 15, 15, 0.85)', // Fondo semitransparente con diseño elegante
        backdropFilter: 'blur(8px)',
        padding: '40px 30px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(212, 175, 55, 0.3)',
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
                backgroundColor: '#000000',
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
                backgroundColor: '#000000',
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
              cursor: 'pointer'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>

    </div>
  );
}
