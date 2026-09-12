import React, { useState } from 'react';
import Head from 'next/head';
import emailjs from '@emailjs/browser';

const vehiculos = [
  {
    id: 'kia-sportage-lx-2020',
    nombre: 'Kia Sportage LX 2020',
    imagen: '/kia.jpeg',
    precios: { base: 50, medio: 45, largo: 40 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 } // 3-5 días: $30, 5-10 días: $25, 11+ días: $20
  },
  {
    id: 'jeep-cherokee-latitude-2019',
    nombre: 'Jeep Cherokee Latitude 2019',
    imagen: '/jeep.jpg',
    precios: { base: 55, medio: 50, largo: 45 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 } // 3-5 días: $30, 5-10 días: $25, 11+ días: $20
  },
  {
    id: 'kia-seltos-2021',
    nombre: 'Kia Seltos 2021',
    imagen: '/kia.jpeg',
    precios: { base: 55, medio: 50, largo: 45 },
    seguroFullPrecios: { corto: 40, medio: 35, largo: 30 } // 3-5 días: $40, 5-10 días: $35, 11+ días: $30
  }
];

// SIMULACIÓN DE RESERVAS (Sustituir por lectura de Base de Datos / Supabase)
const reservasExistentes = [
  { vehiculoId: 'kia-sportage-lx-2020', inicio: '2026-10-01', fin: '2026-10-05' }
];

const DATOS_BANCARIOS = `
CUENTAS BANCARIAS PARA TRANSFERENCIA / RESERVA ($150 USD):

• Banco Popular Dominicano (Pesos DOP)
  Cuenta de Ahorros/Corriente: [Ingresar Número de Cuenta USD]
  Titular: Monaco Luxury Rent a Car

• Banco BHD / Banreservas (Pesos DOP)
  Cuenta: [Ingresar Número de Cuenta DOP]
  Titular: Monaco Luxury Rent a Car

* Nota: Enviar comprobante de pago vía WhatsApp (+1 849-847-1138 / +1 829-679-2686) para validar la reserva.
`;

const TEXTO_CONTRATO = `
CONTRATO DE ARRENDAMIENTO DE VEHÍCULO - MONACO LUXURY RENT A CAR
1. RESERVA Y PAGOS: Reserva de USD $150.00 NO REEMBOLSABLE. Saldo restante contra entrega.
2. DOCUMENTACIÓN: Extranjeros dejan pasaporte original. Nacionales/Residentes entregan copia de cédula y licencia.
3. DEPÓSITO Y SEGURO: Seguro básico no cubre daños físicos. Depósito de garantía: USD $400.00. Con Seguro Full se exonera depósito y solo se paga deducible.
4. HORARIOS: Devolución a la misma hora de entrega. Tolerancia excedida (>4 hrs) aplica recargo de 1 día adicional.
5. MULTAS: El cliente asume total responsabilidad por infracciones y multas de tránsito.
6. CONDICIONES: Vehículo se entrega y devuelve en óptimas condiciones y con mismo nivel de combustible. Prohibido subarrendar o actividades ilícitas.
7. ACEPTACIÓN DIGITAL: Al confirmar, el cliente acepta íntegramente este contrato.
`;

export default function Home() {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarModalWS, setMostrarModalWS] = useState(false);
  const [mostrarModalContrato, setMostrarModalContrato] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Formulario
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoCliente, setTipoCliente] = useState('extranjero');
  const [seguroFull, setSeguroFull] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaContrato, setAceptaContrato] = useState(false);

  // Cálculo de días
  const calcularDias = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const dias = calcularDias();

  // Validación de solapamiento de fechas reservadas
  const estaReservado = () => {
    if (!vehiculoSeleccionado || !fechaInicio || !fechaFin) return false;
    const inicioSel = new Date(fechaInicio);
    const finSel = new Date(fechaFin);

    return reservasExistentes.some((r) => {
      if (r.vehiculoId !== vehiculoSeleccionado.id) return false;
      const rInicio = new Date(r.inicio);
      const rFin = new Date(r.fin);
      return inicioSel <= rFin && finSel >= rInicio;
    });
  };

  // Precios del vehículo según días
  const obtenerPrecioPorDia = (v) => {
    if (!v) return 0;
    if (dias >= 11) return v.precios.largo;
    if (dias >= 5) return v.precios.medio;
    return v.precios.base;
  };

  // Precios del Seguro Full según rango de días
  const obtenerPrecioSeguroPorDia = (v) => {
    if (!v || !seguroFull) return 0;
    if (dias >= 11) return v.seguroFullPrecios.largo;
    if (dias >= 5) return v.seguroFullPrecios.medio;
    return v.seguroFullPrecios.corto;
  };

  const precioPorDia = obtenerPrecioPorDia(vehiculoSeleccionado);
  const precioSeguroPorDia = obtenerPrecioSeguroPorDia(vehiculoSeleccionado);
  const costoRenta = dias * precioPorDia;
  const costoSeguro = dias * precioSeguroPorDia;
  const costoTotal = costoRenta + costoSeguro;

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    if (dias < 3) {
      alert('El alquiler mínimo es de 3 días.');
      return;
    }
    if (estaReservado()) {
      alert('El vehículo ya se encuentra reservado en el rango de fechas seleccionado. Por favor escoge otras fechas.');
      return;
    }
    if (!aceptaContrato) {
      alert('Debes aceptar el contrato de arrendamiento para continuar.');
      return;
    }

    setEnviando(true);

    const templateParams = {
      to_email: email,
      cliente_nombre: nombre,
      cliente_telefono: telefono,
      cliente_email: email,
      tipo_cliente: tipoCliente === 'extranjero' ? 'Extranjero (Pasaporte)' : 'Nacional/Residente (Cédula + Licencia)',
      vehiculo: vehiculoSeleccionado.nombre,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      dias_totales: dias,
      precio_por_dia: precioPorDia,
      seguro_full: seguroFull ? `SI (USD $${precioSeguroPorDia}/día)` : 'NO (Depósito $400 USD)',
      costo_seguro_total: costoSeguro,
      costo_total: costoTotal,
      monto_reserva: 150,
      cuentas_bancarias: DATOS_BANCARIOS,
      contrato_texto: TEXTO_CONTRATO
    };

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      // Guardar la nueva reserva en el estado local
      reservasExistentes.push({ vehiculoId: vehiculoSeleccionado.id, inicio: fechaInicio, fin: fechaFin });

      alert(`¡Reserva realizada con éxito!\n\nSe ha enviado la confirmación a: ${email}\nEl vehículo ha quedado bloqueado para esas fechas.`);
      setVehiculoSeleccionado(null);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      alert('Hubo un detalle al enviar el correo. Por favor contáctanos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>Monaco Luxury Rent a Car</title>
        <meta name="description" content="Alquiler de vehículos de lujo en Santo Domingo" />
      </Head>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Monaco Luxury Logo" style={{ height: '50px', borderRadius: '8px' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>MONACO LUXURY RENT A CAR</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a 
            href="https://www.instagram.com/monacoluxuryrentacar/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#e1306c', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', backgroundColor: '#833ab41f', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #833ab4' }}
          >
            📸 Instagram
          </a>
          <button 
            onClick={() => setMostrarModalWS(true)} 
            style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💬 WhatsApp
          </button>
        </div>
      </header>

      {/* BANNER PRINCIPAL */}
      <section style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#1e293b' }}>
        <h2 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Reserva tu Auto en Santo Domingo</h2>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>Ubicados en Gazcue. Renta mínima de 3 días. Rápida y segura con la mejor atención personalizada.</p>
      </section>

      {/* CATÁLOGO DE VEHÍCULOS */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#f59e0b', textAlign: 'center' }}>Nuestra Flota</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {vehiculos.map((v) => (
            <div key={v.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
              <img src={v.imagen} alt={v.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h4 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', color: '#fff' }}>{v.nombre}</h4>
                
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#f59e0b', fontWeight: 'bold' }}>Tarifas por Día (Mínimo 3 Días):</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span>3 - 5 Días:</span>
                    <strong>USD ${v.precios.base}/día</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span>5 - 10 Días:</span>
                    <strong>USD ${v.precios.medio}/día</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>11+ Días:</span>
                    <strong>USD ${v.precios.largo}/día</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem', border: '1px solid #334155' }}>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#38bdf8', fontWeight: 'bold' }}>Seguro Full Opcional:</p>
                  <div>3-5 días: ${v.seguroFullPrecios.corto}/día | 5-10 días: ${v.seguroFullPrecios.medio}/día | 11+ días: ${v.seguroFullPrecios.largo}/día</div>
                </div>

                <button 
                  onClick={() => { setVehiculoSeleccionado(v); setSeguroFull(false); }} 
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto' }}
                >
                  Reservar este Auto
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DE RESERVA */}
      {vehiculoSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#f59e0b' }}>Reservar {vehiculoSeleccionado.nombre}</h3>
              <button onClick={() => setVehiculoSeleccionado(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* SELECCIÓN CON CALENDARIO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.3rem', fontWeight: 'bold' }}>📅 Fecha Inicio:</label>
                  <input 
                    type="date" 
                    value={fechaInicio} 
                    onChange={(e) => setFechaInicio(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', cursor: 'pointer' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.3rem', fontWeight: 'bold' }}>📅 Fecha Entrega:</label>
                  <input 
                    type="date" 
                    value={fechaFin} 
                    min={fechaInicio} 
                    onChange={(e) => setFechaFin(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', cursor: 'pointer' }} 
                  />
                </div>
              </div>

              {/* ALERTA FECHAS OCUPADAS O RENTA MÍNIMA */}
              {dias > 0 && dias < 3 && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>⚠️ El tiempo mínimo de renta es de 3 días.</p>
              )}

              {estaReservado() && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>🚫 Este vehículo ya está reservado en las fechas seleccionadas.</p>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Tipo de Cliente:</label>
                <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }}>
                  <option value="extranjero">Extranjero (Requiere Pasaporte)</option>
                  <option value="nacional">Nacional / Residente (Cédula + Licencia)</option>
                </select>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                  <input type="checkbox" checked={seguroFull} onChange={(e) => setSeguroFull(e.target.checked)} />
                  <strong>Deseo contratar Seguro Full</strong>
                </label>
                {dias >= 3 && (
                  <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.8rem', color: '#38bdf8' }}>
                    Costo Seguro Full: <strong>USD ${precioSeguroPorDia}/día</strong> para {dias} días (Exonera el depósito de $400 USD).
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Nombre Completo:</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Teléfono / WhatsApp:</label>
                  <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Correo Electrónico:</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
                </div>
              </div>

              {/* RESUMEN DE COSTOS CON SEGURO INCLUIDO Y CUENTAS */}
              {dias >= 3 && !estaReservado() && (
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #f59e0b', fontSize: '0.9rem' }}>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Días de Alquiler: <strong>{dias} día(s)</strong></p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Renta del Auto: <strong>USD ${costoRenta}</strong> (${precioPorDia}/día)</p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Seguro Full: <strong>{seguroFull ? `USD $${costoSeguro} ($${precioSeguroPorDia}/día)` : 'No Incluido ($0)'}</strong></p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Depósito: <strong>{seguroFull ? 'Exonerado' : 'USD $400.00'}</strong></p>
                  <h4 style={{ margin: '0.5rem 0', color: '#f59e0b', fontSize: '1.2rem' }}>TOTAL CON SEGURO: USD ${costoTotal}</h4>
                  
                  <hr style={{ borderColor: '#334155', margin: '0.8rem 0' }} />

                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8', fontSize: '0.95rem' }}>💳 Pago de Reserva mediante Transferencia (USD $150.00)</h5>
                  <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    <p style={{ margin: '0 0 0.3rem 0' }}><strong>• Banco Popular (USD):</strong> Cta. Ahorros N° <code>123456789</code></p>
                    <p style={{ margin: '0 0 0.3rem 0' }}><strong>• Banreservas / BHD (DOP):</strong> Cta. Corriente N° <code>987654321</code></p>
                    <p style={{ margin: '0', color: '#f59e0b', fontSize: '0.75rem' }}><em>* Titular: Monaco Luxury Rent a Car. Enviar comprobante por WhatsApp tras completar la reserva.</em></p>
                  </div>
                </div>
              )}

              {/* CHECKBOX CONTRATO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="contrato" checked={aceptaContrato} onChange={(e) => setAceptaContrato(e.target.checked)} required />
                <label htmlFor="contrato" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Acepto los <button type="button" onClick={() => setMostrarModalContrato(true)} style={{ color: '#f59e0b', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>Términos y Condiciones del Contrato</button>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={enviando || dias < 3 || estaReservado()}
                style={{ padding: '0.75rem', backgroundColor: (enviando || dias < 3 || estaReservado()) ? '#64748b' : '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: (enviando || dias < 3 || estaReservado()) ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
              >
                {enviando ? 'Procesando reserva...' : 'Confirmar Reserva e Instrucciones de Pago'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WHATSAPP */}
      {mostrarModalWS && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 110 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '100%', border: '1px solid #334155', textAlign: 'center' }}>
            <h3 style={{ color: '#25D366', marginTop: 0 }}>Contactar por WhatsApp</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Selecciona uno de nuestros números de atención:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              <a href="https://wa.me/18498471138" target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>📱 WhatsApp Opción 1 (+1 849-847-1138)</a>
              <a href="https://wa.me/18296792686" target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>📱 WhatsApp Opción 2 (+1 829-679-2686)</a>
            </div>
            <button onClick={() => setMostrarModalWS(false)} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL CONTRATO */}
      {mostrarModalContrato && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 120 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '700px', width: '100%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #334155', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#f59e0b' }}>CONTRATO DE ARRENDAMIENTO DE VEHÍCULO</h3>
              <button onClick={() => setMostrarModalContrato(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <p><strong>EMPRESA ARRENDADORA: MONACO LUXURY RENT A CAR</strong><br /><em>MODALIDAD: Aceptación / Términos y Condiciones de Servicio</em></p>

            <h4 style={{ color: '#fff' }}>1. RESERVA Y PAGOS</h4>
            <p><strong>1.1. Monto de Reserva:</strong> Para confirmar y garantizar la reserva de un vehículo, el CLIENTE debe realizar un pago inicial de USD $150.00.<br />
            <strong>1.2. Política de Cancelación:</strong> El monto de la reserva (USD $150.00) NO ES REEMBOLSABLE bajo ninguna circunstancia si el CLIENTE decide cancelar el servicio.<br />
            <strong>1.3. Pago del Saldo Restante:</strong> El saldo restante del costo total del alquiler debe ser saldado en su totalidad al momento en que MONACO LUXURY RENT A CAR realice la entrega del vehículo al CLIENTE.</p>

            <h4 style={{ color: '#fff' }}>2. DOCUMENTACIÓN REQUERIDA Y DEVOLUCIÓN</h4>
            <p><strong>2.1. Clientes Extranjeros:</strong> Deberán presentar y dejar en custodia su pasaporte original vigente.<br />
            <strong>2.2. Clientes Nacionales / Residentes:</strong> Deberán entregar copia fotostática legible de su cédula de identidad y electoral y de su licencia de conducir vigente.<br />
            <strong>2.3. Devolución de Documentos:</strong> Los documentos entregados en custodia serán devueltos al CLIENTE únicamente tras la inspección final y devolución satisfactoria del vehículo.</p>

            <h4 style={{ color: '#fff' }}>3. DEPÓSITO DE GARANTÍA Y OPCIONES DE SEGURO</h4>
            <p><strong>3.1. Seguro Básico de Tránsito:</strong> Todos los vehículos incluyen un seguro de tránsito obligatorio únicamente para circular legalmente. Este seguro no cubre daños físicos ni pérdidas materiales en caso de accidente.<br />
            <strong>3.2. Depósito de Garantía:</strong> Salvo que se adquiera la cobertura completa, el CLIENTE debe dejar un depósito de garantía de USD $400.00.<br />
            <strong>3.3. Responsabilidad por Daños:</strong> Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante.<br />
            <strong>3.4. Seguro Full (Cobertura Total Exclusiva):</strong> Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: queda totalmente exonerado del depósito de garantía de USD $400.00. En caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.</p>

            <h4 style={{ color: '#fff' }}>4. TIEMPO DE RENTA, HORARIOS Y PENALIZACIONES</h4>
            <p><strong>4.1. Hora de Entrega:</strong> El vehículo debe ser devuelto a la misma hora exacta en la que fue entregado por MONACO LUXURY RENT A CAR.<br />
            <strong>4.2. Tolerancia y Recargos:</strong> Se otorga un margen máximo de tolerancia. Si la devolución del vehículo se retrasa por más de cuatro (4) horas respecto a la hora pactada, se cobrará automáticamente un (1) día completo adicional de renta.</p>

            <h4 style={{ color: '#fff' }}>5. MULTAS Y INFRACCIONES DE TRÁNSITO</h4>
            <p><strong>5.1.</strong> El CLIENTE asume la responsabilidad total y exclusiva por cualquier multa, sanción, fotomulta o Infracción de tránsito emitida por las autoridades correspondientes durante el período en que el vehículo estuvo bajo su posesión.<br />
            <strong>5.2.</strong> En caso de que las multas sean notificadas con posterioridad a la entrega del vehículo, MONACO LUXURY RENT A CAR queda facultada para realizar el cobro o reclamo correspondiente al CLIENTE.</p>

            <h4 style={{ color: '#fff' }}>6. CONDICIONES ADICIONALES E IMPORTANTES</h4>
            <p><strong>6.1. Estado del Vehículo:</strong> El CLIENTE declara recibir el vehículo en perfectas condiciones mecánicas, estéticas y de limpieza, y se compromete a devolverlo en las mismas condiciones exactas en que lo recibió.<br />
            <strong>6.2. Nivel de Combustible:</strong> El vehículo debe ser devuelto con la misma cantidad de combustible con la que fue entregado.<br />
            <strong>6.3. Uso Permitido y Prohibiciones:</strong> El vehículo solo podrá ser conducido por el CLIENTE o por conductores autorizados. Queda prohibido subarrendar, transportar carga pesada, participar en carreras o conducir bajo los efectos del alcohol.<br />
            <strong>6.4. Llaves y Neumáticos:</strong> La pérdida o daño de llaves o neumáticos no están cubiertos por ningún seguro.<br />
            <strong>6.5. Asistencia:</strong> Notificar inmediatamente a MONACO LUXURY RENT A CAR en un plazo no mayor a 2 horas tras cualquier siniestro.</p>

            <h4 style={{ color: '#fff' }}>7. ACEPTACIÓN DIGITAL</h4>
            <p>Al realizar el pago de la reserva o al tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato digital.</p>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setMostrarModalContrato(false)} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Entendido / Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid #334155', color: '#64748b', fontSize: '0.85rem' }}>
        <p>© Monaco Luxury Rent a Car - Gazcue, Santo Domingo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
