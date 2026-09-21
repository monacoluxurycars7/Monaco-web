import React, { useState, useRef } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de inicio de sesión
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Error al reproducir audio:", err);
          alert("Asegúrate de tener el archivo musica.mp3 guardado en la carpeta public de GitHub.");
        });
      }
    }
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
      
      {/* Audio ambiental */}
      <audio ref={audioRef} src="/musica.mp3" loop preload="auto" />

      {/* Botón de música ambiental */}
      <button 
        onClick={toggleAudio}
        type="button"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid #d4af37',
          color: '#d4af37',
          padding: '10px 16px',
          borderRadius: '30px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 'bold',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
        }}
      >
        <span>{isPlaying ? '🔊 Pausar Música' : '🎵 Música Ambiental'}</span>
      </button>

      {/* Animaciones CSS */}
      <style jsx global>{`
        @keyframes marqueeLeftToRight {
          0% {
            transform: translateX(-100vw);
          }
          100% {
            transform: translateX(100vw);
          }
        }

        @keyframes marqueeRightToLeft {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100vw);
          }
        }

        .glow-title {
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 0 20px rgba(212, 175, 55, 0.6);
        }

        .glow-label {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* 1. LOGO SUPERIOR (Sale primero de Izquierda a Derecha) */}
      <div style={{
        position: 'absolute',
        top: '28%', // Alineado por encima de Acceso Admin
        left: '0',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'marqueeLeftToRight 14s linear infinite',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src="/logo.png" 
          alt="Monaco Logo Top" 
          style={{
            width: '450px',
            height: 'auto',
            opacity: 0.9
          }}
        />
      </div>

      {/* 2. LOGO INFERIOR (Sale de Derecha a Izquierda, justo donde apunta el cursor) */}
      <div style={{
        position: 'absolute',
        bottom: '18%', // Ubicado exactamente en la zona del mouse
        left: '0',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'marqueeRightToLeft 14s linear infinite',
        animationDelay: '3s', // Inicia un poco después para dar prioridad al de arriba
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src="/logo.png" 
          alt="Monaco Logo Bottom" 
          style={{
            width: '450px',
            height: 'auto',
            opacity: 0.9
          }}
        />
      </div>

      {/* CAJA DE LOGIN EN FONDO NEGRO */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
