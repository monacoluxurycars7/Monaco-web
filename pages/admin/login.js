import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Correo o contraseña incorrectos');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico para enviarte el enlace de recuperación.');
      return;
    }

    try {
      setError('');
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      setMessage(`Se ha enviado un enlace para restablecer la contraseña a: ${email}`);
    } catch (err) {
      console.error(err);
      setError('Error al enviar el correo. Verifica que esté bien escrito.');
    }
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
      backgroundImage: 'url("/fondo admin.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
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
          bottom: '15px',
          right: '15px',
          zIndex: 100,
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid #d4af37',
          color: '#d4af37',
          padding: '8px 14px',
          borderRadius: '30px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
        }}
      >
        <span>{isPlaying ? '🔊 Pausar Música' : '🎵 Música Ambiental'}</span>
      </button>

      {/* Estilos para textos con brillo */}
      <style jsx global>{`
        .glow-title {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.9), 0 0 18px rgba(212, 175, 55, 0.6);
        }

        .glow-label {
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* CONTENEDOR DE ACCESO (SIN CAJA / TRANSPARENTE) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '320px',
        textAlign: 'center',
        padding: '0 15px'
      }}>
        <h2 className="glow-title" style={{
          marginBottom: '20px',
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#ffffff',
          letterSpacing: '1px'
        }}>
          Acceso Admin
        </h2>

        {/* 1. MUESTRA ERRORES */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid #ff4d4d',
            color: '#ff4d4d',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '14px',
            backdropFilter: 'blur(4px)'
          }}>
            {error}
          </div>
        )}

        {/* 2. MENSAJE DE ÉXITO */}
        {message && (
          <div style={{
            backgroundColor: 'rgba(0, 255, 128, 0.2)',
            border: '1px solid #00ff80',
            color: '#00ff80',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '14px',
            backdropFilter: 'blur(4px)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          <div>
            <label className="glow-label" style={{ display: 'block', fontSize: '12px', color: '#fff', fontWeight: '600', marginBottom: '6px' }}>
              Correo Electrónico:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                backgroundColor: 'rgba(10, 10, 10, 0.85)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                backdropFilter: 'blur(5px)',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
              }}
            />
          </div>

          <div>
            <label className="glow-label" style={{ display: 'block', fontSize: '12px', color: '#fff', fontWeight: '600', marginBottom: '6px' }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                backgroundColor: 'rgba(10, 10, 10, 0.85)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                backdropFilter: 'blur(5px)',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '11px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#d4af37',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.5)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* 3. BOTÓN PARA RESTABLECER CONTRASEÑA */}
        <button
          onClick={handleResetPassword}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#d4af37',
            fontSize: '12px',
            marginTop: '15px',
            cursor: 'pointer',
            textDecoration: 'underline',
            textShadow: '0 0 5px rgba(0,0,0,0.8)'
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

    </div>
  );
}
