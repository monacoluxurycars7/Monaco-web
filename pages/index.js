import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import emailjs from '@emailjs/browser';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const vehiculos = [
  {
    id: 'kia-sportage-lx-2020',
    nombre: 'Kia Sportage LX 2020',
    imagen: '/kia.jpeg',
    precios: { base: 60, medio: 55, largo: 50 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 },
    disponible: true
  },
  {
    id: 'jeep-cherokee-latitude-2019',
    nombre: 'Jeep Cherokee Latitude 2019',
    imagen: '/jeep.jpg',
    precios: { base: 65, medio: 60, largo: 55 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 },
    disponible: true
  },
  {
    id: 'kia-seltos-2021',
    nombre: 'Kia Seltos 2021',
    imagen: '/kia.jpeg',
    precios: { base: 60, medio: 55, largo: 50 },
    seguroFullPrecios: { corto: 40, medio: 35, largo: 30 },
    disponible: false
  }
];

const DATOS_BANCARIOS = `
CUENTAS BANCARIAS PARA TRANSFERENCIA / RESERVA ($150 USD):
• Banco Popular Dominicano (Dólares USD): Cta. Ahorros N° 123456789
• Banreservas / BHD (Pesos DOP): Cta. Corriente N° 987654321
* Titular: Monaco Luxury Rent a Car. Enviar comprobante vía WhatsApp.
`;

const TEXTO_CONTRATO = `
CONTRATO DE ARRENDAMIENTO DE VEHÍCULO - MONACO LUXURY RENT A CAR
1. Reserva de USD $150.00 NO REEMBOLSABLE. Saldo restante contra entrega.
2. Extranjeros dejan pasaporte original. Nacionales copia de cédula y licencia.
3. Depósito de garantía: USD $400.00 (Exonerado con Seguro Full).
4. Devolución a la misma hora. Exceso mayor a 4 hrs cobra un día adicional.
5. El cliente asume total responsabilidad por multas de tránsito.
`;

export default function Home() {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarModalWS, setMostrarModalWS] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reservasExistentes, setReservasExistentes] = useState([]);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoCliente, setTipoCliente] = useState('extranjero');
  const [seguroFull, setSeguroFull] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaContrato, setAceptaContrato] = useState(false);

  const canvasRef = useRef(null);
  const [dibujando, setDibujando] = useState(false);
  const [tieneFirma, setTieneFirma] = useState(false);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'reservas'), (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      setReservasExistentes(docs);
    });
    return () => unsubscribe();
  }, []);

  const obtenerPosicion = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const iniciarDibujo = (e) => {
    const { x, y } = obtenerPosicion(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDibujando(true);
  };

  const dibujar = (e) => {
    if (!dibujando) return;
    e.preventDefault();
    const { x, y } = obtenerPosicion(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    setTieneFirma(true);
  };

  const detenerDibujo = () => setDibujando(false);

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setTieneFirma(false);
    }
  };

  const calcularDias = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const diffTime = new Date(fechaFin) - new Date(fechaInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const dias = calcularDias();

  const estaReservado = () => {
    if (!vehiculoSeleccionado || !fechaInicio || !fechaFin) return false;
    const inicioSel = new Date(fechaInicio);
    const finSel = new Date(fechaFin);
    return reservasExistentes.some((r) => {
      if (r.vehiculoId !== vehiculoSeleccionado.id) return false;
      return inicioSel <= new Date(r.fin) && finSel >= new Date(r.inicio);
    });
  };

  const precioPorDia = vehiculoSeleccionado ? (dias >= 11 ? vehiculoSeleccionado.precios.largo : dias >= 5 ? vehiculoSeleccionado.precios.medio : vehiculoSeleccionado.precios.base) : 0;
  const precioSeguroPorDia = vehiculoSeleccionado && seguroFull ? (dias >= 11 ? vehiculoSeleccionado.seguroFullPrecios.largo : dias >= 5 ? vehiculoSeleccionado.seguroFullPrecios.medio : vehiculoSeleccionado.seguroFullPrecios.corto) : 0;
  const costoRenta = dias * precioPorDia;
  const costoSeguro = dias * precioSeguroPorDia;
  const costoTotal = costoRenta + costoSeguro;

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    if (dias < 3) { alert('El alquiler mínimo es de 3 días.'); return; }
    if (estaReservado()) { alert('El vehículo ya se encuentra reservado en esas fechas.'); return; }
    if (!aceptaContrato) { alert('Debes aceptar el contrato.'); return; }
    if (!tieneFirma) { alert('Debes firmar digitalmente.'); return; }

    setEnviando(true);

    try {
      const firmaUrl = canvasRef.current.toDataURL('image/png');

      await addDoc(collection(db, 'reservas'), {
        vehiculoId: vehiculoSeleccionado.id,
        vehiculoNombre: vehiculoSeleccionado.nombre,
        inicio: fechaInicio,
        fin: fechaFin,
        clienteNombre: nombre,
        clienteEmail: email,
        clienteTelefono: telefono,
        costoTotal: costoTotal,
        firmaUrl: firmaUrl,
        fechaCreacion: new Date().toISOString()
      });

      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
          {
            to_email: email,
            cliente_email: email,
            cliente_nombre: nombre,
            cliente_telefono: telefono,
            tipo_cliente: tipoCliente,
            vehiculo: vehiculoSeleccionado.nombre,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            dias_totales: dias,
            precio_por_dia: precioPorDia,
            seguro_full: seguroFull ? `SI ($${precioSeguroPorDia}/día)` : 'NO',
            costo_total: costoTotal,
            monto_reserva: 150,
            cuentas_bancarias: DATOS_BANCARIOS,
            contrato_texto: TEXTO_CONTRATO,
            firma_url: firmaUrl
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
        );
        alert('¡Reserva registrada con éxito! Se envió la confirmación a tu correo.');
      } catch (emailError) {
        console.error('Error de EmailJS:', emailError);
        alert('Reserva guardada en Firebase, pero falló el envío de correo. Revisa tus IDs en Vercel.');
      }

      setVehiculoSeleccionado(null);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la reserva: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Head><title>Monaco Luxury Rent a Car</title></Head>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '1.25rem', color: '#f59e0b', margin: 0 }}>MONACO LUXURY RENT A CAR</h1>
        <button onClick={() => setMostrarModalWS(true)} style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>WhatsApp</button>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h3 style={{ color: '#f59e0b', textAlign: 'center', marginBottom: '2rem' }}>Nuestra Flota</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {vehiculos.map((v) => (
            <div key={v.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
              <img src={v.imagen} alt={v.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
              <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>{v.nombre}</h4>
              
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem', backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 0.25rem 0', color: '#f59e0b', fontWeight: 'bold' }}>Tarifas por Día (Mínimo 3 Días):</p>
                <p style={{ margin: '0 0 0.15rem 0' }}>• 3-5 Días: USD ${v.precios.base}/día</p>
                <p style={{ margin: '0 0 0.15rem 0' }}>• 6-10 Días: USD ${v.precios.medio}/día</p>
                <p style={{ margin: '0 0 0.5rem 0' }}>• 11+ Días: USD ${v.precios.largo}/día</p>
              </div>

              {v.disponible ? (
                <button onClick={() => setVehiculoSeleccionado(v)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Reservar este Auto</button>
              ) : (
                <button disabled style={{ width: '100%', padding: '0.75rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed' }}>No Disponible</button>
              )}
            </div>
          ))}
        </div>
      </main>

      {vehiculoSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#f59e0b', margin: 0 }}>Reservar {vehiculoSeleccionado.nombre}</h3>
              <button onClick={() => setVehiculoSeleccionado(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Fecha Inicio:</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Fecha Entrega:</label>
                <input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }} />
              </div>

              {dias > 0 && (
                <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                  <p style={{ margin: '0 0 0.25rem 0' }}>Duración: <strong>{dias} días</strong></p>
                  <p style={{ margin: '0 0 0.25rem 0' }}>Subtotal Renta: <strong>${costoRenta} USD</strong></p>
                  {seguroFull && <p style={{ margin: '0 0 0.25rem 0' }}>Seguro Full: <strong>${costoSeguro} USD</strong></p>}
                  <p style={{ margin: 0, color: '#f59e0b', fontWeight: 'bold' }}>Total Estimado: ${costoTotal} USD</p>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Nombre Completo:</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Teléfono:</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Correo Electrónico:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Firma Digital:</label>
                <canvas ref={canvasRef} width={400} height={150} onMouseDown={iniciarDibujo} onMouseMove={dibujar} onMouseUp={detenerDibujo} onTouchStart={iniciarDibujo} onTouchMove={dibujar} onTouchEnd={detenerDibujo} style={{ backgroundColor: '#fff', borderRadius: '6px', width: '100%', touchAction: 'none' }} />
                <button type="button" onClick={limpiarFirma} style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Limpiar Firma</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id="contrato" checked={aceptaContrato} onChange={(e) => setAceptaContrato(e.target.checked)} required />
                <label htmlFor="contrato" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>Acepto los términos y condiciones del contrato</label>
              </div>

              <button type="submit" disabled={enviando} style={{ padding: '0.75rem', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {enviando ? 'Procesando Reserva...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mostrarModalWS && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #334155' }}>
            <h3 style={{ color: '#25D366', marginTop: 0 }}>Atención por WhatsApp</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Comunícate directamente con nuestro equipo de atención al cliente en Santo Domingo.</p>
            <a href="https://wa.me/18090000000" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: '#25D366', color: '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '1rem' }}>Abrir Chat de WhatsApp</a>
            <button onClick={() => setMostrarModalWS(false)} style={{ background: 'none', border: '1px solid #64748b', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
