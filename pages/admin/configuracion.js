import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ConfigAdmin() {
  const [config, setConfig] = useState({
    logoUrl: '',
    fondoUrl: '',
    colorPrimary: '#d4af37',
    nombreEmpresa: 'Mónaco Luxury Rent A Car'
  });
  const [guardando, setGuardando] = useState(false);

  // Cargar configuración actual al abrir la página
  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    cargarConfig();
  }, []);

  // Guardar cambios en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await setDoc(doc(db, 'config', 'general'), config, { merge: true });
      alert('¡Configuración guardada con éxito! Los cambios se reflejarán en la web.');
    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Hubo un error al guardar los cambios.');
    }
    setGuardando(false);
  };

  return (
    <div style={{ padding: '30px', color: '#fff', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#d4af37', marginBottom: '20px' }}>⚙️ Personalización del Sitio Web</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', background: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
        
        {/* Nombre de la empresa */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre de la Empresa:</label>
          <input 
            type="text" 
            value={config.nombreEmpresa} 
            onChange={(e) => setConfig({...config, nombreEmpresa: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
          />
        </div>

        {/* URL del Logo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>URL del Logo (Imagen):</label>
          <input 
            type="text" 
            value={config.logoUrl} 
            onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
            placeholder="Ej: https://tuservidor.com/logo.png"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
          />
          {config.logoUrl && <img src={config.logoUrl} alt="Vista previa logo" style={{ height: '40px', marginTop: '10px' }} />}
        </div>

        {/* URL del Fondo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>URL de la Imagen de Fondo:</label>
          <input 
            type="text" 
            value={config.fondoUrl} 
            onChange={(e) => setConfig({...config, fondoUrl: e.target.value})}
            placeholder="Ej: https://tuservidor.com/fondo.jpg"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
          />
        </div>

        {/* Color Principal */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Color Principal (Acento / Dorados):</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="color" 
              value={config.colorPrimary} 
              onChange={(e) => setConfig({...config, colorPrimary: e.target.value})}
              style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
            />
            <span style={{ fontSize: '14px', color: '#aaa' }}>{config.colorPrimary}</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={guardando}
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
          {guardando ? 'Guardando cambios...' : 'Guardar Cambios de Diseño'}
        </button>
      </form>
    </div>
  );
}
