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
          alert("Asegúrate de tener el archivo musica.mp3 guardado en la carpeta public.");
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

      {/* Animaciones CSS continuas y rápidas */}
      <style jsx global>{`
        @keyframes moveLeftToRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }

        @keyframes moveRightToLeft {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .glow-title {
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 0 20px rgba(212, 175, 55, 0.6);
        }

        .glow-label {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* CARRIL SUPERIOR: Mueve de Izquierda a Derecha por arriba del formulario */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '0',
        width: '100vw',
        height: '140px',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {/* Logo 1 - Sale de inmediato */}
        <img 
          src="/logo.png" 
          alt="Monaco Logo Top 1" 
          style={{
            position: 'absolute',
            width: '380px',
            height: 'auto',
            opacity: 0.9,
            animation: 'moveLeftToRight 8s linear infinite'
          }}
        />
        {/* Logo 2 - Sigue al primero para que no quede vacío */}
        <img 
          src="/logo.png" 
          alt="Monaco Logo Top 2" 
          style={{
            position: 'absolute',
            width: '380px',
            height: 'auto',
            opacity: 0.9,
            animation: 'moveLeftToRight 8s linear infinite',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* CARRIL INFERIOR: Mueve de Derecha a Izquierda por debajo del formulario */}
      <div style={{
        position: 'absolute',
        bottom: '6%',
        left: '0',
        width: '100vw',
        height: '140px',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {/* Logo 1 */}
        <img 
          src="/logo.png" 
          alt="Monaco Logo Bottom 1" 
          style={{
            position: 'absolute',
            width: '380px',
            height: 'auto',
            opacity: 0.9,
            animation: 'moveRightToLeft 8s linear infinite',
            animationDelay: '1.5s'
          }}
        />
        {/* Logo 2 - Sigue continuo */}
        <img 
          src="/logo.png" 
          alt="Monaco Logo Bottom 2" 
          style={{
            position: 'absolute',
            width: '380px',
            height: 'auto',
            opacity: 0.9,
            animation: 'moveRightToLeft 8s linear infinite',
            animationDelay: '5.5s'
          }}
        />
      </div>

      {/* CAJA DE LOGIN EN EL CENTRO (SIN QUE LOS LOGOS PASEN POR DETRÁS) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#000000',
        padding: '40px 32px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
        border: '1px solid #222222',
        boxShadow: '0 0 30px rgba(0, 0, 0, 1), 0 0 15px rgba(212, 175, 55, 0.2)'
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
