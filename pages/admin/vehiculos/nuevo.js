import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function NuevoVehiculo() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    placa: '',
    anio: '2023',
    combustible: 'Gasolina',
    pasajeros: '5',
    transmision: 'Automático',
    precio3a5Dias: 50,
    precio6a10Dias: 45,
    precio11MasDias: 40,
    seguro3a5Dias: 20,
    seguro6a10Dias: 18,
    seguro11MasDias: 15,
    depositoGarantia: 400,
    estado: 'disponible',
    imagenUrl: ''
  });

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/admin/login');
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Subir imagen desde la computadora cargándola como Base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        alert('La imagen es demasiado pesada. Por favor selecciona una imagen menor a 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagenUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      alert('Por favor ingresa el nombre del vehículo.');
      return;
    }

    setGuardando(true);

    try {
      await addDoc(collection(db, 'vehiculos'), {
        ...formData,
        precio3a5Dias: Number(formData.precio3a5Dias),
        precio6a10Dias: Number(formData.precio6a10Dias),
        precio11MasDias: Number(formData.precio11MasDias),
        seguro3a5Dias: Number(formData.seguro3a5Dias),
        seguro6a10Dias: Number(formData.seguro6a10Dias),
        seguro11MasDias: Number(formData.seguro11MasDias),
        precioPorDia: Number(formData.precio11MasDias),
        depositoGarantia: Number(formData.depositoGarantia),
        fechaCreacion: new Date().toISOString()
      });

      alert('Vehículo agregado con éxito');
      router.push('/admin/vehiculos');
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      alert('Ocurrió un error al guardar el vehículo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loadingAuth) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando...</p>;

  return (
    <div style={{ padding: '20px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: '#d4af37' }}>Agregar Nuevo Vehículo</h1>
        <button onClick={() => router.push('/admin/vehiculos')} style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          ← Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Información Básica */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Información Básica</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Nombre Comercial *</label>
              <input type="text" name="nombre" placeholder="Ej: Kia Sportage LX 2020" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Placa / Matrícula</label>
              <input type="text" name="placa" placeholder="Ej: A123456" value={formData.placa} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Año</label>
              <input type="text" name="anio" placeholder="Ej: 2020" value={formData.anio} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Combustible</label>
              <input type="text" name="combustible" placeholder="Ej: Gasolina" value={formData.combustible} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Pasajeros</label>
              <input type="text" name="pasajeros" placeholder="Ej: 5 Pasajeros" value={formData.pasajeros} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Transmisión</label>
              <input type="text" name="transmision" placeholder="Ej: Automática" value={formData.transmision} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
        </fieldset>

        {/* Tarifas de Alquiler por Días */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Tarifas de Alquiler por Días (USD)</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>3 - 5 Días ($/día)</label>
              <input type="number" name="precio3a5Dias" value={formData.precio3a5Dias} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>6 - 10 Días ($/día)</label>
              <input type="number" name="precio6a10Dias" value={formData.precio6a10Dias} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>11+ Días ($/día)</label>
              <input type="number" name="precio11MasDias" value={formData.precio11MasDias} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
        </fieldset>

        {/* Seguro Full por Días */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Seguro Full por Días (USD)</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>3 - 5 Días ($/día)</label>
              <input type="number" name="seguro3a5Dias" value={formData.seguro3a5Dias} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>6 - 10 Días ($/día)</label>
              <input type="number" name="seguro6a10Dias" value={formData.seguro6a10Dias} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>11+ Días ($/día)</label>
              <input type="number" name="seguro11MasDias" value={formData.seguro11MasDias} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Depósito de Garantía (USD)</label>
            <input type="number" name="depositoGarantia" value={formData.depositoGarantia} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
        </fieldset>

        {/* Carga de Imagen */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Fotografía del Vehículo</legend>
          
          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>1. Subir archivo desde la computadora:</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ color: '#aaa', fontSize: '12px', marginBottom: '12px' }} />

          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>2. O pega una URL de imagen (ImgBB / Imgur):</label>
          <input type="url" name="imagenUrl" placeholder="https://..." value={formData.imagenUrl} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />

          {formData.imagenUrl && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '11px', color: '#888', margin: '0 0 5px 0' }}>Vista previa:</p>
              <img src={formData.imagenUrl} alt="Vista previa" style={{ height: '100px', borderRadius: '4px', border: '1px solid #444', objectFit: 'cover' }} />
            </div>
          )}
        </fieldset>

        <button 
          type="submit" 
          disabled={guardando}
          style={{ padding: '12px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}
        >
          {guardando ? 'Guardando Vehículo...' : 'Guardar Vehículo en la Flota'}
        </button>
      </form>
    </div>
  );
}
