import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ConfiguracionSecciones() {
  const [fondos, setFondos] = useState({
    login: '/fondo admin.png',
    reserva: '',
    metricas: '',
    clientes: '',
    flotas: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarFondos = async () => {
      try {
        const docRef = doc(db, 'config', 'fondosSecciones');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFondos(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error al cargar fondos:", error);
      }
    };
    cargarFondos();
  }, []);

  const handleFileUpload = (e, seccion) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFondos(prev => ({ ...prev, [seccion]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');
    try {
      await setDoc(doc(db, 'config', 'fondosSecciones'), fondos, { merge: true });
      setMensaje('¡Fondos actualizados con éxito en todas las pantallas!');
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje('Hubo un error al guardar los cambios.');
    }
    setGuardando(false);
  };

  const secciones = [
    { key: 'login', label: 'Pantalla de Login' },
    { key: 'reserva', label: 'Pantalla de Nueva Reserva' },
    { key: 'metricas', label: 'Pantalla de Métricas / Dashboard' },
    { key: 'clientes', label: 'Pantalla de Clientes' },
    { key: 'flotas', label: 'Pantalla de Flotas / Vehículos' }
  ];

  return (
    <div style={{ padding: '30px', color: '#fff', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#d4af37', marginBottom: '10px' }}>⚙️ Configuración de Fondos por Pantalla</h1>
      <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '14px' }}>
        Personaliza la imagen de fondo de cada sección de tu aplicación de forma independiente.
      </p>

      {mensaje && (
        <div style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #d4af37', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', maxWidth: '700px', color: '#d4af37', fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleGuardar} style={{ maxWidth: '700px', background: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
        
        {secciones.map((sec) => (
          <div key={sec.key} style={{ marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', fontWeight: 'bold', color: '#d4af37' }}>
              Fondo para: {sec.label}
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, sec.key)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#fff', fontSize: '13px', cursor: 'pointer', marginBottom: '10px' }}
            />
            {fondos[sec.key] && (
              <div style={{ marginTop: '5px' }}>
                <img src={fondos[sec.key]} alt={`Vista previa ${sec.label}`} style={{ height: '60px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #444' }} />
              </div>
            )}
          </div>
        ))}

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
            width: '100%',
            marginTop: '10px'
          }}
        >
          {guardando ? 'Guardando cambios...' : 'Guardar Todos los Fondos'}
        </button>
      </form>
    </div>
  );
}
