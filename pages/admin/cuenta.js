import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { updateEmail, updatePassword, onAuthStateChanged } from 'firebase/auth';

export default function GestionCuenta() {
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Escuchar cuando el usuario ya cargó en el navegador
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        setEmail(user.email || '');
        setTelefono(user.phoneNumber || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleActualizarCuenta = async (e) => {
    e.preventDefault();
    if (!usuario) {
      setMensaje('No hay una sesión activa.');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      // Actualizar Correo si cambió
      if (email !== usuario.email) {
        await updateEmail(usuario, email);
      }

      // Actualizar Contraseña si se escribió una nueva
      if (password.trim() !== '') {
        await updatePassword(usuario, password);
      }

      setMensaje('¡Datos de cuenta actualizados correctamente!');
      setPassword(''); // Limpiar campo de contraseña
    } catch (error) {
      console.error("Error al actualizar cuenta:", error);
      setMensaje('Error: Vuelve a iniciar sesión recientemente para aplicar cambios sensibles.');
    }
    setCargando(false);
  };

  return (
    <div style={{ padding: '30px', color: '#fff', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#d4af37', marginBottom: '10px' }}>👤 Configuración de la Cuenta</h1>
      <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '14px' }}>
        Administra tus credenciales de acceso, correo electrónico y número de teléfono.
      </p>

      {mensaje && (
        <div style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #d4af37', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', maxWidth: '600px', color: '#d4af37', fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleActualizarCuenta} style={{ maxWidth: '600px', background: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Correo Electrónico:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Nueva Contraseña (opcional):</label>
          <input 
            type="password" 
            placeholder="Déjalo en blanco si no deseas cambiarla"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Número de Teléfono de Contacto:</label>
          <input 
            type="tel" 
            placeholder="Ej: +1 809 000 0000"
            value={telefono} 
            onChange={(e) => setTelefono(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={cargando}
          style={{
            background: '#d4af37',
            color: '#000',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {cargando ? 'Actualizando...' : 'Guardar Cambios de Cuenta'}
        </button>
      </form>
    </div>
  );
}
