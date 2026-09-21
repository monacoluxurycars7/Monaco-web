import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
const storage = getStorage(app);

export default function NuevoVehiculo() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagenFile, setImagenFile] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    anio: '2023',
    placa: '',
    precioPorDia: 40,
    precioSeguroPorDia: 20,
    depositoGarantia: 400,
    transmision: 'Automático',
    pasajeros: 5,
    combustible: 'Gasolina',
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

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImagenFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precioPorDia) {
      alert('Por favor completa el Nombre y el Precio por día.');
      return;
    }

    setGuardando(true);

    try {
      let finalImageUrl = formData.imagenUrl;

      // Subida de imagen a Firebase Storage si seleccionó un archivo
      if (imagenFile) {
        const storageRef = ref(storage, `vehiculos/${Date.now()}_${imagenFile.name}`);
        await uploadBytes(storageRef, imagenFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'vehiculos'), {
        ...formData,
        precioPorDia: Number(formData.precioPorDia),
        precioSeguroPorDia: Number(formData.precioSeguroPorDia),
        depositoGarantia: Number(formData.depositoGarantia),
        imagenUrl: finalImageUrl,
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Nombre Comercial *</label>
            <input type="text" name="nombre" placeholder="Ej: Kia Sportage LX 2020" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Placa / Matrícula</label>
            <input type="text" name="placa" placeholder="Ej: A123456" value={formData.placa} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Precio Alquiler / Día (USD) *</label>
            <input type="number" name="precioPorDia" value={formData.precioPorDia} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Precio Seguro Full / Día (USD)</label>
            <input type="number" name="precioSeguroPorDia" value={formData.precioSeguroPorDia} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ border: '1px solid #333', padding: '15px', borderRadius: '6px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#d4af37', marginBottom: '6px', fontWeight: 'bold' }}>Fotografía del Vehículo</label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }} />
          <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>O pega un enlace de imagen externo:</p>
          <input type="url" name="imagenUrl" placeholder="https://..." value={formData.imagenUrl} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
        </div>

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
