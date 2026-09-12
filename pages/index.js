import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import emailjs from '@emailjs/browser';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const vehiculos = [
  {
    id: 'kia-sportage-lx-2020',
    nombre: 'KIA SPORTAGE LX 2020',
    marca: 'KIA',
    modelo: 'Sportage LX',
    anio: 2020,
    combustible: 'Gasolina',
    pasajeros: '5 Personas',
    transmision: 'Automática',
    imagen: '/kia.jpg',
    precios: { base: 50, medio: 45, largo: 40 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 },
    disponible: true
  },
  {
    id: 'jeep-cherokee-latitude-2019',
    nombre: 'JEEP CHEROKEE LATITUDE 2019',
    marca: 'JEEP',
    modelo: 'Cherokee Latitude',
    anio: 2019,
    combustible: 'Gasolina',
    pasajeros: '5 Personas',
    transmision: 'Automática',
    imagen: '/jeep.jpeg',
    precios: { base: 55, medio: 50, largo: 45 },
    seguroFullPrecios: { corto: 30, medio: 25, largo: 20 },
    disponible: true
  },
  {
    id: 'kia-seltos-2019',
    nombre: 'KIA SELTOS 2019',
    marca: 'KIA',
    modelo: 'Seltos',
    anio: 2019,
    combustible: 'Gasolina',
    pasajeros: '5 Personas',
    transmision: 'Automática',
    imagen: 'kiaseltos.jpn.jpeg',
    precios: { base: 55, medio: 50, largo: 45 },
    seguroFullPrecios: { corto: 40, medio: 35, largo: 30 },
    disponible: true
  }
];

const marcasDestacadas = [
  { nombre: 'CHEVROLET', logo: 'fa-solid fa-car-side' },
  { nombre: 'KIA', logo: 'fa-solid fa-car' },
  { nombre: 'AUDI', logo: 'fa-solid fa-shield-halved' },
  { nombre: 'HONDA', logo: 'fa-solid fa-gauge-high' },
  { nombre: 'HYUNDAI', logo: 'fa-solid fa-bolt' },
  { nombre: 'JEEP', logo: 'fa-solid fa-truck-monster' },
  { nombre: 'MERCEDES', logo: 'fa-solid fa-crown' },
  { nombre: 'BMW', logo: 'fa-solid fa-star' }
];

const DATOS_BANCARIOS = `
CUENTAS BANCARIAS PARA TRANSFERENCIA / RESERVA ($150 USD):
• Banco Popular Dominicano (Pesos DOP): Cta. Ahorros N° 123456789
• Banreservas / BHD (Pesos DOP): Cta. Corriente N° 987654321
• Zelle (Dólares USD): Landra2916@gmail.com
* Titular: Landra Guzman, Freddy Rodriguez. Enviar comprobante vía WhatsApp.
`;

const TEXTO_CONTRATO = `
CONTRATO DE ARRENDAMIENTO DE VEHÍCULO
EMPRESA ARRENDADORA: MONACO LUXURY RENT A CAR

MODALIDAD: Aceptación / Términos y Condiciones de Servicio

1. RESERVA Y PAGOS
1.1. Monto de Reserva: Para confirmar y garantizar la reserva de un vehículo, el CLIENTE debe realizar un pago inicial de USD $150.00.
1.2. Política de Cancelación: El monto de la reserva (USD $150.00) NO ES REEMBOLSABLE bajo ninguna circunstancia si el CLIENTE decide cancelar el servicio.
1.3. Pago del Saldo Restante: El saldo restante del costo total del alquiler debe ser saldado en su totalidad al momento en que MONACO LUXURY RENT A CAR realice la entrega del vehículo al CLIENTE.

2. DOCUMENTACIÓN REQUERIDA Y DEVOLUCIÓN
2.1. Clientes Extranjeros: Deberán presentar y dejar en custodia su pasaporte original vigente.
2.2. Clientes Nacionales / Residentes: Deberán entregar copia fotostática legible de su cédula de identidad y electoral y de su licencia de conducir vigente.
2.3. Devolución de Documentos: Los documentos entregados en custodia serán devueltos al CLIENTE únicamente tras la inspección final y devolución satisfactoria del vehículo.

3. DEPÓSITO DE GARANTÍA Y OPCIONES DE SEGURO
3.1. Seguro Básico de Tránsito: Todos los vehículos incluyen un seguro de tránsito obligatorio únicamente para circular legalmente. Este seguro no cubre daños físicos ni pérdidas materiales en caso de accidente.
3.2. Depósito de Garantía: Salvo que se adquiera la cobertura completa, el CLIENTE debe dejar un depósito de garantía de USD $400.00.
3.3. Responsabilidad por Daños: Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante.
3.4. Seguro Full (Cobertura Total Exclusiva): Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: queda totalmente exonerado del depósito de garantía de USD $400.00, y en caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.

4. TIEMPO DE RENTA, HORARIOS Y PENALIZACIONES
4.1. Hora de Entrega: El vehículo debe ser devuelto a la misma hora exacta en la que fue entregado por MONACO LUXURY RENT A CAR.
4.2. Tolerancia y Recargos: Se otorga un margen máximo de tolerancia. Si la devolución del vehículo se retrasa por más de cuatro (4) horas respecto a la hora pactada, se cobrará automáticamente un (1) día completo adicional de renta.

5. MULTAS Y INFRACCIONES DE TRÁNSITO
5.1. El CLIENTE asume la responsabilidad total y exclusiva por cualquier multa, sanción, fotomulta o infracción de tránsito emitida por las autoridades correspondientes durante el período en que el vehículo estuvo bajo su posesión.
5.2. En caso de que las multas sean notificadas con posterioridad a la entrega del vehículo, MONACO LUXURY RENT A CAR queda facultada para realizar el cobro o reclamo correspondiente al CLIENTE.

6. CONDICIONES ADICIONALES E IMPORTANTES
6.1. Estado del Vehículo: El CLIENTE declara recibir el vehículo en perfectas condiciones mecánicas, estéticas y de limpieza, y se compromete a devolverlo en las mismas condiciones exactas en que lo recibió.
6.2. Nivel de Combustible: El vehículo debe ser devuelto con la misma cantidad de combustible con la que fue entregado. De lo contrario, se aplicará un cargo por reabastecimiento.
6.3. Uso Permitido y Prohibiciones: El vehículo solo podrá ser conducido por el CLIENTE o por conductores adicionales autorizados explícitamente. Queda estrictamente prohibido utilizarlo para subarrendar, transportar carga pesada, participar en carreras, remolcar, realizar actividades ilícitas o conducir bajo los efectos del alcohol o sustancias controladas.
6.4. Llaves y Neumáticos: La pérdida o daño de las llaves, así como pinchaduras o daños severos en los neumáticos por negligencia, no están cubiertos por ningún seguro y serán facturados directamente al CLIENTE.
6.5. Asistencia y Reporte de Siniestros: En caso de accidente, avería o robo, el CLIENTE debe notificar inmediatamente a MONACO LUXURY RENT A CAR y a las autoridades policiales en un plazo no mayor a 2 horas.

7. ACEPTACIÓN DIGITAL
Al realizar el pago de la reserva o al tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato digital emitido por MONACO LUXURY RENT A CAR.
`;

export default function Home() {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarModalWS, setMostrarModalWS] = useState(false);
  const [mostrarModalContrato, setMostrarModalContrato] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reservasExistentes, setReservasExistentes] = useState([]);

  // Buscador por marca y modelo
  const [busquedaMarca, setBusquedaMarca] = useState('');
  const [busquedaModelo, setBusquedaModelo] = useState('');

  // Datos de la reserva
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoCliente, setTipoCliente] = useState('extranjero');
  const [seguroFull, setSeguroFull] = useState(false);
  const [nombre, setNombre] = useState('');
  const [direccionRD, setDireccionRD] = useState('');
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
    const inicioSel = new Date(fechaInicio + 'T00:00:00');
    const finSel = new Date(fechaFin + 'T00:00:00');
    return reservasExistentes.some((r) => {
      if (r.vehiculoId !== vehiculoSeleccionado.id) return false;
      const rInicio = new Date(r.inicio + 'T00:00:00');
      const rFin = new Date(r.fin + 'T00:00:00');
      return inicioSel <= rFin && finSel >= rInicio;
    });
  };

  const precioPorDia = vehiculoSeleccionado ? (dias >= 11 ? vehiculoSeleccionado.precios.largo : dias >= 5 ? vehiculoSeleccionado.precios.medio : vehiculoSeleccionado.precios.base) : 0;
  const precioSeguroPorDia = vehiculoSeleccionado && seguroFull ? (dias >= 11 ? vehiculoSeleccionado.seguroFullPrecios.largo : dias >= 5 ? vehiculoSeleccionado.seguroFullPrecios.medio : vehiculoSeleccionado.seguroFullPrecios.corto) : 0;
  const costoRenta = dias * precioPorDia;
  const costoSeguro = dias * precioSeguroPorDia;
  const depositoGarantia = 400; 
  const costoTotal = costoRenta + costoSeguro + depositoGarantia;

  // Filtrado de la flota según la búsqueda
  const vehiculosFiltrados = vehiculos.filter((v) => {
    const coincideMarca = busquedaMarca === '' || v.marca.toLowerCase().includes(busquedaMarca.toLowerCase());
    const coincideModelo = busquedaModelo === '' || v.modelo.toLowerCase().includes(busquedaModelo.toLowerCase()) || v.nombre.toLowerCase().includes(busquedaModelo.toLowerCase());
    return coincideMarca && coincideModelo;
  });

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    if (dias < 3) { alert('El alquiler mínimo es de 3 días.'); return; }
    if (estaReservado()) { alert('El vehículo ya se encuentra reservado en esas fechas. Por favor elige otras fechas.'); return; }
    if (!direccionRD.trim()) { alert('Por favor ingresa tu dirección de residencia en RD.'); return; }
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
        clienteDireccionRD: direccionRD,
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
            cliente_direccion_rd: direccionRD,
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
      setFechaInicio('');
      setFechaFin('');
      setNombre('');
      setDireccionRD('');
      setTelefono('');
      setEmail('');
      setSeguroFull(false);
      setAceptaContrato(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la reserva: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', color: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>Monaco Luxury Rent a Car</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      
      {/* HEADER PRINCIPAL CON NAVEGACIÓN */}
      <header id="inicio" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', borderBottom: '1px solid #222', sticky: 'top', position: 'sticky', top: 0, zIndex: 90 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/logo.png" alt="Monaco Logo" style={{ height: '40px', objectFit: 'contain' }} />
            <h1 style={{ fontSize: '1.25rem', color: '#ff0000', margin: 0, letterSpacing: '1px' }}>MONACO LUXURY RENT A CAR</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="https://www.instagram.com/monacoluxuryrentacar/" target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C', fontSize: '1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <i className="fa-brands fa-instagram"></i>
            </a>
            <button onClick={() => setMostrarModalWS(true)} style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> WhatsApp VIP
            </button>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav style={{ backgroundColor: '#111', borderTop: '1px solid #222', padding: '0.75rem 2rem' }}>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
            <li><a href="#inicio" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>INICIO</a></li>
            <li><a href="#flota" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>NUESTRA FLOTA</a></li>
            <li><a href="#nosotros" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>SOBRE NOSOTROS</a></li>
            <li><a href="#faq" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>PREGUNTAS FRECUENTES</a></li>
            <li><a href="#contacto" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>CONTACTO</a></li>
          </ul>
        </nav>
      </header>

      {/* SECCIÓN HERO Y BUSCADOR PRINCIPAL */}
      <section style={{ backgroundColor: '#0d0d0d', padding: '3rem 1rem', textAlign: 'center', borderBottom: '1px solid #222' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Encuentra el Vehículo Ideal para tu Viaje</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Experiencia de movilidad VIP de alto nivel en la República Dominicana</p>

        {/* CUBÍCULO DE BÚSQUEDA DE VEHÍCULOS */}
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#161616', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#ff0000', fontSize: '1.1rem', textAlign: 'left' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '8px' }}></i> Buscar Vehículo por Marca y Modelo
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem', textAlign: 'left' }}>Marca</label>
              <select value={busquedaMarca} onChange={(e) => setBusquedaMarca(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px' }}>
                <option value="">Todas las Marcas</option>
                <option value="KIA">KIA</option>
                <option value="JEEP">JEEP</option>
                <option value="CHEVROLET">CHEVROLET</option>
                <option value="HONDA">HONDA</option>
                <option value="HYUNDAI">HYUNDAI</option>
                <option value="AUDI">AUDI</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem', textAlign: 'left' }}>Modelo</label>
              <input type="text" placeholder="Ej: Sportage, Cherokee, Seltos..." value={busquedaModelo} onChange={(e) => setBusquedaModelo(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN FLOTA DE VEHÍCULOS */}
      <main id="flota" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <h3 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', letterSpacing: '1px' }}>
          NUESTRA FLOTA DE LUJO
        </h3>

        {vehiculosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>No se encontraron vehículos que coincidan con la búsqueda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {vehiculosFiltrados.map((v) => {
              return (
                <div key={v.id} style={{ backgroundColor: '#111', borderRadius: '12px', padding: '1.5rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <img src={v.imagen} alt={v.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    <h4 style={{ color: '#fff', margin: '1rem 0 0.5rem 0', fontSize: '1.2rem' }}>{v.nombre}</h4>
                    
                    {/* ESPECIFICACIONES TÉCNICAS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#1a1a1a', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #2a2a2a', fontSize: '0.82rem' }}>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-gas-pump" style={{ color: '#ff0000', marginRight: '5px' }}></i> {v.combustible}</span>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-users" style={{ color: '#ff0000', marginRight: '5px' }}></i> {v.pasajeros}</span>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-gear" style={{ color: '#ff0000', marginRight: '5px' }}></i> {v.transmision}</span>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-calendar" style={{ color: '#ff0000', marginRight: '5px' }}></i> Año {v.anio}</span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem', backgroundColor: '#000', padding: '0.75rem', borderRadius: '6px', border: '1px solid #222' }}>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#ff0000', fontWeight: 'bold' }}>Tarifas por Día (Mínimo 3 Días):</p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 3-5 Días: USD ${v.precios.base}/día</p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 6-10 Días: USD ${v.precios.medio}/día</p>
                      <p style={{ margin: '0 0 0.5rem 0' }}>• 11+ Días: USD ${v.precios.largo}/día</p>
                    </div>
                  </div>

                  <button onClick={() => setVehiculoSeleccionado(v)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                    Reservar este Auto
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MARCAS DE VEHÍCULOS (PRESENTACIÓN SLIDER / GRID) */}
      <section style={{ backgroundColor: '#080808', padding: '3rem 1rem', borderTop: '1px solid #222', borderBottom: '1px solid #222', textAlign: 'center' }}>
        <h4 style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '2rem' }}>Marcas que integran nuestro estándar de flota</h4>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
          {marcasDestacadas.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.8, cursor: 'default' }}>
              <i className={m.logo} style={{ fontSize: '2rem', color: '#ff0000' }}></i>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>{m.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN SOBRE NOSOTROS */}
      <section id="nosotros" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        <h3 style={{ color: '#ff0000', textAlign: 'center', fontSize: '1.8rem', marginBottom: '2.5rem', letterSpacing: '1px' }}>SOBRE NOSOTROS</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '2rem', borderRadius: '12px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-bullseye" style={{ color: '#ff0000' }}></i> Misión
            </h4>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
              Proporcionar una experiencia de movilidad de alto nivel mediante el alquiler de vehículos de lujo y gama alta, garantizando puntualidad, seguridad y una atención personalizada que supere las expectativas de clientes ejecutivos y particulares.
            </p>
          </div>

          <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '2rem', borderRadius: '12px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-eye" style={{ color: '#ff0000' }}></i> Visión
            </h4>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
              Consolidarse como la empresa líder y referente en el mercado de renta de vehículos de lujo, reconocida por la excelencia operativa, la calidad de su flota y la confianza de sus clientes a nivel regional e internacional.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '2rem', borderRadius: '12px' }}>
          <h4 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-gem" style={{ color: '#ff0000' }}></i> Valores Corporativos
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h5 style={{ color: '#ff0000', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Excelencia</h5>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Compromiso constante con la máxima calidad en la flota de vehículos y en el trato al cliente.</p>
            </div>
            <div>
              <h5 style={{ color: '#ff0000', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Integridad y Transparencia</h5>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Claridad total en las políticas de alquiler, términos contractuales y responsabilidad contractual.</p>
            </div>
            <div>
              <h5 style={{ color: '#ff0000', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Puntualidad y Confiabilidad</h5>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Respeto estricto por el tiempo de los usuarios en la entrega y recepción de las unidades.</p>
            </div>
            <div>
              <h5 style={{ color: '#ff0000', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Seguridad y Privacidad</h5>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Protección total de los datos de los clientes y un mantenimiento minucioso de cada vehículo para viajes seguros.</p>
            </div>
            <div>
              <h5 style={{ color: '#ff0000', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Exclusividad</h5>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Enfoque orientado a ofrecer detalles de alto confort, estética impecable y un servicio adaptable a necesidades específicas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" style={{ backgroundColor: '#0a0a0a', padding: '4rem 1rem', borderTop: '1px solid #222' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3 style={{ color: '#ff0000', textAlign: 'center', fontSize: '1.8rem', marginBottom: '2.5rem', letterSpacing: '1px' }}>PREGUNTAS FRECUENTES</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '1.5rem', borderRadius: '10px' }}>
              <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Requisitos y Reservas</h4>
              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Cuáles son los requisitos para alquilar un vehículo?</p>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Es necesario presentar documento de identidad o pasaporte vigente, licencia de conducir válida y una tarjeta de crédito a nombre del titular para el depósito de garantía.</p>

              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Cuál es la edad mínima para rentar?</p>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>La edad mínima requerida es de 25 años. Conductores entre 21 y 24 años pueden aplicar sujetos a condiciones especiales o cargos adicionales de seguro.</p>

              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Cómo se confirma una reserva?</p>
              <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.9rem' }}>La reserva queda confirmada tras la firma del acuerdo digital y el pago del anticipo o depósito correspondiente.</p>
            </div>

            <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '1.5rem', borderRadius: '10px' }}>
              <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Pagos, Depósitos y Cobertura</h4>
              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Por qué se requiere un depósito de garantía y cuándo se devuelve?</p>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>El depósito garantiza el cumplimiento del contrato y cubre posibles eventualidades (multas, faltantes de combustible o deducibles). Se retiene temporalmente en la tarjeta de crédito y se libera tras la inspección final del vehículo al devolverlo.</p>

              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Qué incluyen las opciones de seguro?</p>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Ofrecemos desde cobertura básica de responsabilidad civil hasta protecciones prémium contra daños colisionables y robo con deducible reducido.</p>

              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Quién es responsable de las multas de tránsito?</p>
              <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.9rem' }}>El titular del alquiler es el único responsable de cualquier infracción o multa incurrida durante el periodo de renta.</p>
            </div>

            <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '1.5rem', borderRadius: '10px' }}>
              <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Uso y Devolución del Vehículo</h4>
              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Se puede entregar o devolver el vehículo en el aeropuerto o en una ubicación personalizada?</p>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Sí, contamos con servicio de entrega VIP y recogida personalizada en aeropuertos, hoteles o residencias previa coordinación.</p>

              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Qué sucede si me retraso en la devolución?</p>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Existe un margen de tolerancia de 30 minutos. Trascurrido este periodo, se aplican cargos adicionales por hora o la tarifa correspondiente a un día extra de renta.</p>

              <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>¿Pueden conducir otras personas el vehículo?</p>
              <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.9rem' }}>Solo están autorizados los conductores registrados explícitamente en el contrato de alquiler que hayan presentado su documentación requerida.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CONTACTO Y PIE DE PÁGINA */}
      <footer id="contacto" style={{ backgroundColor: '#050505', borderTop: '1px solid #222', padding: '4rem 1rem 2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          <div>
            <h4 style={{ color: '#ff0000', fontSize: '1.2rem', marginBottom: '1rem' }}>MONACO LUXURY RENT A CAR</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Experiencia VIP y alquiler de vehículos de lujo en la República Dominicana. Garantía de elegancia, confort y respuesta inmediata.
            </p>
            <p style={{ color: '#fff', fontSize: '0.9rem' }}>
              <i className="fa-brands fa-instagram" style={{ color: '#E1306C', marginRight: '8px' }}></i> @Monacoluxuryrentacar
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Información de Contacto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><i className="fa-solid fa-location-dot" style={{ color: '#ff0000', marginRight: '8px' }}></i> C/ Felix Mariano Lluveres #16, Gazcue, Santo Domingo, RD</li>
              <li><i className="fa-solid fa-phone" style={{ color: '#ff0000', marginRight: '8px' }}></i> Teléfono: 829-425-7986 / 1-973-289-4797</li>
              <li><i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '8px' }}></i> WhatsApp VIP (24/7): +1 (809) 555-0100</li>
              <li><i className="fa-solid fa-envelope" style={{ color: '#ff0000', marginRight: '8px' }}></i> monacoluxurycars7@gmail.com</li>
              <li><i className="fa-solid fa-globe" style={{ color: '#ff0000', marginRight: '8px' }}></i> https://monacoluxuryrentacar.vercel.app/</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Horarios y Asistencia</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}><strong>Lunes a Sábado:</strong> 8:00 AM – 10:00 PM</p>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1rem 0' }}><strong>Domingos y Feriados:</strong> 9:00 AM – 8:00 PM<br/><span style={{ fontSize: '0.8rem', color: '#aaa' }}>(Atención y entregas programadas 24/7 previo acuerdo)</span></p>
            <div style={{ backgroundColor: '#111', padding: '0.75rem', borderRadius: '6px', border: '1px solid #222' }}>
              <p style={{ color: '#ef4444', fontWeight: 'bold', margin: 0, fontSize: '0.85rem' }}>
                <i className="fa-solid fa-headset" style={{ marginRight: '6px' }}></i> Asistencia en Carretera 24/7:
              </p>
              <p style={{ color: '#fff', margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>829-425-7986</p>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} MONACO LUXURY RENT A CAR. Todos los derechos reservados.
        </div>
      </footer>

      {/* MODAL DE RESERVA */}
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
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#fff', color: '#000', border: '1px solid #333', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Fecha Entrega:</label>
                <input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)} required style={{ width: '100%', padding: '0.5rem', backgroundColor: '#fff', color: '#000', border: '1px solid #333', borderRadius: '6px' }} />
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

              {/* CAMPO DE DIRECCIÓN EN REPUBLICA DOMINICANA */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Dirección de Residencia en RD (Airbnb, Resort, Casa, Hotel, Torre, etc.):
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Resort Hotel Catalonia, Torre Bella Vista Apt 4B, Airbnb en Las Terrenas..." 
                  value={direccionRD} 
                  onChange={(e) => setDireccionRD(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '6px' }} 
                />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setMostrarModalContrato(true)} style={{ backgroundColor: '#222', color: '#38bdf8', border: '1px solid #333', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    Ver Términos y Condiciones del Contrato
                  </button>
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

      {/* MODAL DEL CONTRATO */}
      {mostrarModalContrato && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 110 }}>
          <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '12px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ff0000', margin: 0 }}>Contrato de Arrendamiento</h3>
              <button onClick={() => setMostrarModalContrato(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ backgroundColor: '#000', border: '1px solid #333', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {TEXTO_CONTRATO}
            </div>
            <button onClick={() => setMostrarModalContrato(false)} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', backgroundColor: '#ff0000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE WHATSAPP */}
      {mostrarModalWS && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #333' }}>
            <h3 style={{ color: '#25D366', marginTop: 0 }}>Atención por WhatsApp</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Comunícate directamente con nuestros asesores en Santo Domingo:</p>
            <a href="https://wa.me/18294257986" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: '#25D366', color: '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              <i className="fa-brands fa-whatsapp" style={{ marginRight: '8px' }}></i> WhatsApp Línea 1
            </a>
            <a href="https://wa.me/19732894797" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: '#25D366', color: '#fff', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              <i className="fa-brands fa-whatsapp" style={{ marginRight: '8px' }}></i> WhatsApp Línea 2
            </a>
            <button onClick={() => setMostrarModalWS(false)} style={{ background: 'none', border: '1px solid #666', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
