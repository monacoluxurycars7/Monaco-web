import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ConfigAdmin() {
  const valoresIniciales = {
    logoUrl: '/logo sin fondo.png',
    fondoUrl: '/fondo admin.png',
    colorPrimary: '#d4af37',
    nombreEmpresa: 'Mónaco Luxury Rent A Car'
  };

  const [config, setConfig] = useState(valoresIniciales);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Cargar configuración guardada en Firebase
  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    cargarConfig();
  }, []);

  // Función para convertir imágenes locales a formato legible (Base64)
  const handleFileUpload = (e, campo) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, [campo]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar cambios en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');
    try {
      await setDoc(doc(db, 'config', 'general'), config, { merge: true });
      setMensaje('¡Configuración guardada y aplicada con éxito!');
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje('Hubo un error al guardar los cambios.');
    }
    setGuardando(false);
  };

  // Restablecer valores originales
  const handleRestablecer = async () => {
    if (confirm('¿Estás seguro de restablecer los valores predeterminados?')) {
      setConfig(valoresIniciales);
      try {
        await setDoc(doc(db, 'config', 'general'), valoresIniciales);
        setMensaje('¡Se ha restablecido la configuración original!');
      } catch (error) {
        console.error("Error al restablecer:", error);
      }
    }
  };

  return (
    <div style={{ padding: '30px', color: '#fff', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: config.colorPrimary, marginBottom: '10px' }}>⚙️ Personalización Avanzada del Sitio Web</h1>
      <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '14px' }}>
        Modifica la identidad visual, previsualiza los cambios al instante y guárdalos para toda la plataforma.
      </p>

      {mensaje && (
        <div style={{ background: 'rgba(212, 175, 55, 0.2)', border: `1px solid ${config.colorPrimary}`, padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', maxWidth: '700px', color: config.colorPrimary, fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        
        {/* Formulario de Edición */}
        <form onSubmit={handleSubmit} style={{ flex: '1', minWidth: '320px', background: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
          
          {/* Nombre de la empresa */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Nombre de la Empresa:</label>
            <input 
              type="text" 
              value={config.nombreEmpresa} 
              onChange={(e) => setConfig({...config, nombreEmpresa: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff' }}
            />
          </div>

          {/* Subir Logo desde archivo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Cambiar Logo (Desde tu Computadora):</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'logoUrl')}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            />
          </div>

          {/* Subir Fondo desde archivo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Cambiar Imagen de Fondo (Desde tu Computadora):</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'fondoUrl')}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            />
          </div>

          {/* Color Principal */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Color Principal (Acento / Dorados):</label>
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

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={guardando}
              style={{
                background: config.colorPrimary,
                color: '#000',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                flex: 2
              }}
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <button 
              type="button" 
              onClick={handleRestablecer}
              style={{
                background: 'transparent',
                color: '#ff4d4d',
                border: '1px solid #ff4d4d',
                padding: '12px 15px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Restablecer
            </button>
          </div>
        </form>

        {/* Vista Previa en Vivo */}
        <div style={{ flex: '1', minWidth: '320px', background: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: config.colorPrimary, marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            🔍 Vista Previa en Vivo
          </h3>

          <div style={{ 
            flex: 1, 
            backgroundImage: `url(${config.fondoUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            borderRadius: '8px', 
            padding: '20px', 
            border: `2px dashed ${config.colorPrimary}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '250px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1 }}></div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo Prev" style={{ height: '50px', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>[ Sin Logo ]</div>
              )}

              <h2 style={{ color: '#fff', fontSize: '20px', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {config.nombreEmpresa}
              </h2>

              <div style={{ 
                background: config.colorPrimary, 
                color: '#000', 
                padding: '8px 16px', 
                borderRadius: '20px', 
                fontWeight: 'bold', 
                fontSize: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                Botón de Ejemplo
              </div>
            </div>
          </div>
          <p style={{ color: '#777', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
            * Esta es una simulación visual en tiempo real de cómo lucen los elementos en tu plataforma.
          </p>
        </div>

      </div>
    </div>
  );
}
