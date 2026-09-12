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
    precios: { base: 50, medio: 45, largo: 40 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 },
    disponible: true
  },
  {
    id: 'jeep-cherokee-latitude-2019',
    nombre: 'Jeep Cherokee Latitude 2019',
    imagen: '/jeep.jpg',
    precios: { base: 55, medio: 50, largo: 45 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 },
    disponible: true
  },
  {
    id: 'kia-seltos-2021',
    nombre: 'Kia Seltos 2021',
    imagen: '/kia.jpeg',
    precios: { base: 55, medio: 50, largo: 45 },
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
3. Depósito de garantía: USD $400.00 (Reembolsable si se entrega en las mismas condiciones. Exonerado con Seguro Full).
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
  const depositoGarantia = 400; 
  const costoTotal = costoRenta + costoSeguro + depositoGarantia;

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
        console.error('Error detallado de EmailJS:', emailError);
        alert('Error de correo: ' + JSON.stringify(emailError));
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
    <div style={{ backgroundColor: '#000000', color: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Head><title>Monaco Luxury Rent a Car</title></Head>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#0a0a0a', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Monaco Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1.25rem', color: '#ff0000', margin: 0 }}>MONACO LUXURY RENT A CAR</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Logo de Instagram SVG limpio */}
          <a href="https://instagram.com/monacoluxurycars" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          {/* Logo de WhatsApp SVG limpio */}
          <button onClick={() => setMostrarModalWS(true)} style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            WhatsApp
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h3 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '2rem' }}>Nuestra Flota</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {vehiculos.map((v) => {
            const ocupado = reservasExistentes.some((r) => r.vehiculoId === v.id && new Date() <= new Date(r.fin));
            const estaDisponibilidadReal = v.disponible && !ocupado;

            return (
              <div key={v.id} style={{ backgroundColor: '#111', borderRadius: '12px', padding: '1.5rem', border: '1px solid #222' }}>
                <img src={v.imagen} alt={v.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>{v.nombre}</h4>
                
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem', backgroundColor: '#000', padding: '0.75rem', borderRadius: '6px', border: '1px solid #222' }}>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#ff0000', fontWeight: 'bold' }}>Tarifas por Día (Mínimo 3 Días):</p>
                  <p style={{ margin: '0 0 0.15rem 0' }}>• 3-5 Días: USD ${v.precios.base}/día</p>
                  <p style={{ margin: '0 0 0.15rem 0' }}>• 6-10 Días: USD ${v.precios.medio}/día</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>• 11+ Días: USD ${v.precios.largo}/día</p>
                </div>

                {estaDisponibilidadReal ? (
                  <button onClick={() => setVehiculoSeleccionado(v)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Reservar este Auto</button>
                ) : (
                  <button disabled style={{ width: '100%', padding: '0.75rem', backgroundColor: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold' }}>No Disponible / Ocupado</button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {vehiculoSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ff0000', margin: 0 }}>Reservar {vehiculoSeleccionado.nombre}</h3>
              <button onClick={() => setVehiculoSeleccionado(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Fecha Inicio:</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Fecha Entrega:</label>
                <input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '6px' }} />
              </div>

              {fechaInicio && fechaFin && dias > 0 && dias < 3 && (
                <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ⚠️ El alquiler mínimo es de 3 días. Por favor selecciona un periodo mayor.
                </div>
              )}

              {estaReservado() && (
                <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ❌ Las fechas seleccionadas ya se encuentran ocupadas para este vehículo. Elige otras fechas.
                </div>
              )}

              <div style={{ backgroundColor: '#000', padding: '0.75rem', borderRadius: '6px', border: '1px solid #333' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                  <input type="checkbox" checked={seguroFull} onChange={(e) => setSeguroFull(e.target.checked)} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Agregar Seguro Full (${precioSeguroPorDia} USD / día)</span>
                </label>
              </div>

              {dias >= 3 && !estaReservado() && (
                <div style={{ backgroundColor: '#000', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0 }}>Duración: <strong>{dias} días</strong></p>
                  <p style={{ margin: 0 }}>Subtotal Renta: <strong>${costoRenta} USD</strong></p>
                  {seguroFull && <p style={{ margin: 0 }}>Seguro Full: <strong>${costoSeguro} USD</strong></p>}
                  <p style={{ margin: 0, color: '#38bdf8' }}>Depósito de Garantía (Reembolsable): <strong>${depositoGarantia} USD</strong></p>
                  <p style={{ margin: 0, color: '#ff0000', fontWeight: 'bold', fontSize: '1.1rem' }}>Total Estimado: ${costoTotal} USD</p>
                  
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #333' }}>
                    <pre style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '0.8rem' }}>{DATOS_BANCARIOS}</pre>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Nombre Completo:</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Teléfono:</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Correo Electrónico:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#ff0000', fontWeight: 'bold' }}>Términos del Contrato:</label>
                <div style={{ backgroundColor: '#000', border: '1px solid #333', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {TEXTO_CONTRATO}
                </div>
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

              <button type="submit" disabled={enviando || dias < 3 || estaReservado()} style={{ padding: '0.75rem', backgroundColor: (dias < 3 || estaReservado()) ? '#475569' : '#ff0000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (dias < 3 || estaReservado()) ? 'not-allowed' : 'pointer' }}>
                {enviando ? 'Procesando Reserva...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mostrarModalWS && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #333' }}>
            <h3 style={{ color: '#25D366', marginTop: 0 }}>Atención por WhatsApp</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Comunícate directamente con nuestros asesores en Santo Domingo:</p>
            <a href="https://wa.me/18090000001" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: '#25D366', color: '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '0.75rem' }}>📱 WhatsApp Línea 1</a>
            <a href="https://wa.me/18090000002" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: '#25D366', color: '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '1.5rem' }}>📱 WhatsApp Línea 2</a>
            <button onClick={() => setMostrarModalWS(false)} style={{ background: 'none', border: '1px solid #666', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
