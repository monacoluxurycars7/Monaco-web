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

export default function NuevaReservaManual() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  // Campos del formulario
  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    clienteEmail: '',
    tipoCliente: 'residente',
    documentoCliente: '',
    vehiculoNombre: 'Kia Picanto 2023',
    precioPorDia: 40,
    inicio: '',
    fin: '',
    seguroFull: false,
    precioSeguroPorDia: 20, // <--- AQUÍ: asegúrate de que tenga esta línea
    lugarEntrega: 'Oficina Monaco Luxury ($0 USD)',
    costoEntrega: 0,
    clienteDireccionRD: '',
    notas: 'Registro manual por administración (Contrato físico firmado)'
  });

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Cálculo automático de días y totales
  const calcularDias = () => {
    if (!formData.inicio || !formData.fin) return 1;
    try {
      const f1 = new Date(formData.inicio);
      const f2 = new Date(formData.fin);
      const diffTime = Math.abs(f2 - f1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays === 0 ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const totalDias = calcularDias();
  const subtotalAlquiler = totalDias * Number(formData.precioPorDia);
  const subtotalSeguro = formData.seguroFull ? totalDias * Number(formData.precioSeguroPorDia) : 0;
  const costoEntregaVal = Number(formData.costoEntrega);
  const depositoGarantiaVal = formData.seguroFull ? 0 : 400;
  const costoTotalFinal = subtotalAlquiler + subtotalSeguro + costoEntregaVal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clienteNombre || !formData.inicio || !formData.fin) {
      alert('Por favor completa al menos el Nombre del Cliente y las Fechas de Renta.');
      return;
    }

    setGuardando(true);

    try {
      const nuevaReserva = {
        ...formData,
        diasTotales: totalDias,
        depositoGarantia: depositoGarantiaVal,
        costoTotal: costoTotalFinal,
        fechaCreacion: new Date().toISOString(),
        registroManual: true,
        firmaUrl: null // Indica que fue contrato físico
      };

      await addDoc(collection(db, 'reservas'), nuevaReserva);
      alert('Reserva creada exitosamente');
      router.push('/admin');
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      alert('Ocurrió un error al guardar la reserva.');
    } finally {
      setGuardando(false);
    }
  };

  if (loadingAuth) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Verificando acceso...</p>;

  return (
    <div style={{ padding: '20px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '20px', margin: 0, color: '#d4af37' }}>Registrar Nueva Renta Manual</h1>
        <button 
          onClick={() => router.push('/admin')}
          style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Volver al Panel
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Información del Cliente */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Datos del Cliente</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Nombre Completo *</label>
              <input type="text" name="clienteNombre" value={formData.clienteNombre} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Teléfono</label>
              <input type="text" name="clienteTelefono" value={formData.clienteTelefono} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Correo Electrónico</label>
              <input type="email" name="clienteEmail" value={formData.clienteEmail} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Tipo Cliente</label>
              <select name="tipoCliente" value={formData.tipoCliente} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                <option value="residente">Residente RD</option>
                <option value="turista">Turista / Extranjero</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Cédula / Pasaporte</label>
              <input type="text" name="documentoCliente" value={formData.documentoCliente} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
        </fieldset>

        {/* Detalles del Vehículo y Fechas */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Vehículo y Alquiler</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Vehículo</label>
              <input type="text" name="vehiculoNombre" value={formData.vehiculoNombre} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Precio Alquiler / Día (USD)</label>
              <input type="number" name="precioPorDia" value={formData.precioPorDia} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Fecha Inicio *</label>
              <input type="date" name="inicio" value={formData.inicio} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Fecha Fin *</label>
              <input type="date" name="fin" value={formData.fin} onChange={handleChange} required style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
        </fieldset>

        {/* Opciones Adicionales */}
        <fieldset style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
          <legend style={{ color: '#d4af37', padding: '0 8px', fontWeight: 'bold' }}>Seguro y Servicios Extra</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" name="seguroFull" checked={formData.seguroFull} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
              <span>Incluir Seguro Full (Exonera Depósito)</span>
            </label>

            {formData.seguroFull && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Precio Seguro Full / Día (USD)</label>
                <input type="number" name="precioSeguroPorDia" value={formData.precioSeguroPorDia} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            )}
          </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Lugar de Entrega</label>
                <input type="text" name="lugarEntrega" value={formData.lugarEntrega} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Costo Entrega / Movilización (USD)</label>
                <input type="number" name="costoEntrega" value={formData.costoEntrega} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Dirección Residencia RD</label>
              <input type="text" name="clienteDireccionRD" value={formData.clienteDireccionRD} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#181818', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
        </fieldset>

        {/* Resumen Automático */}
        <div style={{ backgroundColor: '#181818', padding: '15px', borderRadius: '8px', border: '1px solid #d4af37' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d4af37', fontSize: '14px' }}>Resumen Calculado:</h3>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Días Totales:</strong> {totalDias} día(s)</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Alquiler:</strong> USD ${subtotalAlquiler}</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Seguro Full:</strong> USD ${subtotalSeguro}</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Entrega:</strong> USD ${costoEntregaVal}</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Depósito Garantía:</strong> USD ${depositoGarantiaVal} {formData.seguroFull ? '(Exonerado)' : ''}</p>
          <hr style={{ borderColor: '#333', margin: '10px 0' }} />
          <p style={{ margin: 0, fontSize: '16px', color: '#4caf50', fontWeight: 'bold' }}>Total Estimado: USD ${costoTotalFinal}</p>
        </div>

        <button 
          type="submit" 
          disabled={guardando}
          style={{ padding: '12px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}
        >
          {guardando ? 'Guardando Reserva...' : 'Guardar Reserva en el Sistema'}
        </button>

      </form>
    </div>
  );
}
