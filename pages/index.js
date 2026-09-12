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
    imagen: '/kiaseltos.jpn.jpeg',
    precios: { base: 55, medio: 50, largo: 45 },
    seguroFullPrecios: { corto: 40, medio: 35, largo: 30 },
    disponible: true
  }
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
6.3. Uso Permitido y Prohibiciones: El vehículo solo podrá ser conducido por el CLIENTE o por conductores adicionales autorizados explícitamente. Queda strictly prohibido utilizarlo para subarrendar, transportar carga pesada, participar en carreras, remolcar, realizar actividades ilícitas o conducir bajo los efectos del alcohol o sustancias controladas.
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

  // FAQ Accordion State
  const [faqAbierta, setFaqAbierta] = useState(null);

  const canvasRef = useRef(null);
  const [dibujando, setDibujando] = useState(false);
  const [tieneFirma, setTieneFirma] = useState(false);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'reservas'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data());
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

  const precioPorDia = vehiculoSeleccionado
    ? dias >= 11
      ? vehiculoSeleccionado.precios.largo
      : dias >= 6
      ? vehiculoSeleccionado.precios.medio
      : vehiculoSeleccionado.precios.base
    : 0;

  const precioSeguroPorDia =
    vehiculoSeleccionado && seguroFull
      ? dias >= 11
        ? vehiculoSeleccionado.seguroFullPrecios.largo
        : dias >= 6
        ? vehiculoSeleccionado.seguroFullPrecios.medio
        : vehiculoSeleccionado.seguroFullPrecios.corto
      : 0;

  const costoRenta = dias * precioPorDia;
  const costoSeguro = dias * precioSeguroPorDia;
  const depositoGarantia = seguroFull ? 0 : 400;
  const costoTotal = costoRenta + costoSeguro + depositoGarantia;

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const coincideMarca =
      busquedaMarca === '' || v.marca.toLowerCase().includes(busquedaMarca.toLowerCase());
    const coincideModelo =
      busquedaModelo === '' ||
      v.modelo.toLowerCase().includes(busquedaModelo.toLowerCase()) ||
      v.nombre.toLowerCase().includes(busquedaModelo.toLowerCase());
    return coincideMarca && coincideModelo;
  });

  const toggleFaq = (index) => {
    setFaqAbierta(faqAbierta === index ? null : index);
  };

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    if (dias < 3) {
      alert('El alquiler mínimo es de 3 días.');
      return;
    }
    if (estaReservado()) {
      alert('El vehículo ya se encuentra reservado en esas fechas. Por favor elige otras fechas.');
      return;
    }
    if (!direccionRD.trim()) {
      alert('Por favor ingresa tu dirección de residencia en RD.');
      return;
    }
    if (!aceptaContrato) {
      alert('Debes aceptar el contrato y las políticas.');
      return;
    }
    if (!tieneFirma) {
      alert('Debes firmar digitalmente en el recuadro.');
      return;
    }

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

  const faqs = [
    {
      pregunta: '¿Cuáles son los requisitos principales para rentar un vehículo?',
      respuesta:
        'Ser mayor de 21 años, contar con licencia de conducir válida y vigente, documento de identidad o pasaporte, y presentar la tarjeta de crédito o el depósito de garantía equivalente.'
    },
    {
      pregunta: '¿Cómo funciona el depósito de garantía?',
      respuesta:
        'El depósito de garantía (USD $400.00) se autoriza o entrega al momento de firmar el contrato digital de alquiler y se reembolsa íntegramente al devolver el vehículo en las mismas condiciones entregadas.'
    },
    {
      pregunta: '¿Qué incluye el alquiler de los vehículos?',
      respuesta:
        'Todos nuestros alquileres incluyen Cobertura de Seguro Básico de Tránsito, mantenimiento mecánico preventivo al día y asistencia vehicular vial durante el período contratado.'
    },
    {
      pregunta: '¿Cuál es la política de entrega y devolución del vehículo?',
      respuesta:
        'El vehículo se entrega con el nivel de combustible pactado y debe ser devuelto a la misma hora exacta y lugar fijados en el contrato. Se otorga margen de tolerancia, pero exceder de 4 horas generará el cobro de un día adicional de renta.'
    },
    {
      pregunta: '¿Quién es responsable de las multas de tránsito?',
      respuesta:
        'El cliente es total y exclusivamente responsable de cualquier multa, fotomulta o sanción de tránsito incurrida durante el período que tenga en posesión el vehículo.'
    }
  ];

  return (
    <div
      id="inicio"
      style={{
        background: 'radial-gradient(circle at top, #1a0002 0%, #050505 50%, #000000 100%)',
        backgroundAttachment: 'fixed',
        color: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <Head>
        <title>Monaco Luxury Rent a Car</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        body {
          background: radial-gradient(circle at top, #1a0002 0%, #050505 50%, #000000 100%) !important;
          background-attachment: fixed !important;
          color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        input[type='text'],
        input[type='email'],
        input[type='tel'],
        input[type='date'],
        select,
        textarea {
          background-color: #121212 !important;
          color: #ffffff !important;
          border: 1px solid #333333 !important;
          border-radius: 6px;
          padding: 0.75rem;
          outline: none;
        }
        input:focus,
        select:focus,
        textarea:focus {
          border-color: #ff0000 !important;
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
        }
        ::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: #111;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 2rem;
          max-width: 650px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          color: #fff;
        }
      `}</style>

      {/* HEADER PRINCIPAL */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #222',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}
      >
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/logo.png" alt="Monaco Logo" style={{ height: '40px', objectFit: 'contain' }} />
            <h1 style={{ fontSize: '1.25rem', color: '#ff0000', margin: 0, letterSpacing: '1px' }}>
              MONACO LUXURY RENT A CAR
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a
              href="https://www.instagram.com/monacoluxuryrentacar/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#E1306C',
                fontSize: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <button
              onClick={() => setMostrarModalWS(true)}
              style={{
                backgroundColor: '#25D366',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> WhatsApp VIP
            </button>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav style={{ backgroundColor: 'rgba(17, 17, 17, 0.8)', borderTop: '1px solid #222', padding: '0.75rem 2rem' }}>
          <ul
            style={{
              display: 'flex',
              gap: '2rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              justify: 'center',
              flexWrap: 'wrap'
            }}
          >
            <li>
              <a href="#inicio" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                INICIO
              </a>
            </li>
            <li>
              <a href="#flota" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                NUESTRA FLOTA
              </a>
            </li>
            <li>
              <a href="#nosotros" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                SOBRE NOSOTROS
              </a>
            </li>
            <li>
              <a href="#faq" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                PREGUNTAS FRECUENTES
              </a>
            </li>
            <li>
              <a href="#contacto" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                CONTACTO
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* SECCIÓN HERO / INICIO */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(30,0,3,0.7) 0%, rgba(10,10,10,0.95) 100%)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid #2a2a2a'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2.8rem',
              color: '#ffffff',
              marginBottom: '1.2rem',
              fontWeight: '900',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            Alquiler de Vehículos en República Dominicana
          </h2>

          <p
            style={{
              color: '#e2e8f0',
              fontSize: '1.2rem',
              lineHeight: '1.8',
              maxWidth: '850px',
              margin: '0 auto 3rem auto',
              fontWeight: '300'
            }}
          >
            En <strong style={{ color: '#ff0000', fontWeight: 'bold' }}>MONACO LUXURY RENT A CAR</strong> somos una
            empresa especializada en el alquiler de vehículos de lujo y gama alta, orientada a ofrecer soluciones de
            movilidad exclusiva, confort y elegancia para ejecutivos, turistas y clientes exigentes.
          </p>

          {/* BUSCADOR DE VEHÍCULOS */}
          <div
            style={{
              backgroundColor: 'rgba(22, 22, 22, 0.9)',
              padding: '1.8rem',
              borderRadius: '12px',
              border: '1px solid #333',
              boxShadow: '0 8px 32px rgba(255, 0, 0, 0.08)'
            }}
          >
            <h4
              style={{
                margin: '0 0 1rem 0',
                color: '#f59e0b',
                fontSize: '1.1rem',
                textAlign: 'left',
                fontWeight: 'bold'
              }}
            >
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '8px' }}></i> BUSCAR VEHÍCULO POR MARCA
              Y MODELO
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    color: '#aaa',
                    marginBottom: '0.3rem',
                    textAlign: 'left'
                  }}
                >
                  Marca
                </label>
                <select value={busquedaMarca} onChange={(e) => setBusquedaMarca(e.target.value)} style={{ width: '100%' }}>
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
                <label
                  style={{
                    display: 'block',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    color: '#aaa',
                    marginBottom: '0.3rem',
                    textAlign: 'left'
                  }}
                >
                  Modelo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sportage, Cherokee, Seltos..."
                  value={busquedaModelo}
                  onChange={(e) => setBusquedaModelo(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN FLOTA DE VEHÍCULOS */}
      <main id="flota" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        <h3
          style={{
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '2.5rem',
            fontSize: '1.8rem',
            letterSpacing: '1px',
            fontWeight: 'bold'
          }}
        >
          NUESTRA FLOTA DISPONIBLE
        </h3>

        {vehiculosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
            No se encontraron vehículos que coincidan con la búsqueda.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}
          >
            {vehiculosFiltrados.map((v) => {
              return (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: 'rgba(17, 17, 17, 0.85)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #2a2a2a',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }}
                >
                  <div>
                    <img
                      src={v.imagen}
                      alt={v.nombre}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <h4 style={{ color: '#fff', margin: '1rem 0 0.5rem 0', fontSize: '1.2rem' }}>{v.nombre}</h4>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        backgroundColor: '#1a1a1a',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        border: '1px solid #2a2a2a',
                        fontSize: '0.82rem'
                      }}
                    >
                      <span style={{ color: '#cbd5e1' }}>
                        <i className="fa-solid fa-gas-pump" style={{ color: '#ff0000', marginRight: '5px' }}></i>{' '}
                        {v.combustible}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>
                        <i className="fa-solid fa-users" style={{ color: '#ff0000', marginRight: '5px' }}></i>{' '}
                        {v.pasajeros}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>
                        <i className="fa-solid fa-gear" style={{ color: '#ff0000', marginRight: '5px' }}></i>{' '}
                        {v.transmision}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>
                        <i className="fa-solid fa-calendar" style={{ color: '#ff0000', marginRight: '5px' }}></i> Año{' '}
                        {v.anio}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: '#cbd5e1',
                        marginBottom: '1rem',
                        backgroundColor: '#090909',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #222'
                      }}
                    >
                      <p style={{ margin: '0 0 0.25rem 0', color: '#ff0000', fontWeight: 'bold' }}>
                        Tarifas de Renta (Mínimo 3 días):
                      </p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 3-5 Días: USD ${v.precios.base}/día</p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 6-10 Días: USD ${v.precios.medio}/día</p>
                      <p style={{ margin: '0 0 0.5rem 0' }}>• 11+ Días: USD ${v.precios.largo}/día</p>

                      <p style={{ margin: '0.5rem 0 0.25rem 0', color: '#25D366', fontWeight: 'bold' }}>
                        Tarifas de Seguro Full (Opcional):
                      </p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 3-5 Días: USD ${v.seguroFullPrecios.corto}/día</p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 6-10 Días: USD ${v.seguroFullPrecios.medio}/día</p>
                      <p style={{ margin: '0' }}>• 11+ Días: USD ${v.seguroFullPrecios.largo}/día</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setVehiculoSeleccionado(v)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#f59e0b',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Reservar este Auto
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL FORMULARIO DE RESERVA */}
      {vehiculoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#ff0000' }}>Reservar {vehiculoSeleccionado.nombre}</h3>
              <button
                onClick={() => setVehiculoSeleccionado(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Tipo de Cliente:</label>
                <select
                  value={tipoCliente}
                  onChange={(e) => setTipoCliente(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="extranjero">Extranjero (Deja Pasaporte Físico)</option>
                  <option value="nacional">Nacional / Residente (Deja Copia Cédula + Licencia)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Fecha Inicio:</label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Fecha Fin:</label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* MENSAJES DE ERROR DE FECHAS Y MENOS DE 3 DÍAS */}
              {fechaInicio && fechaFin && (
                <div>
                  {dias < 3 ? (
                    <div
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #ef4444',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                      El alquiler mínimo es de 3 días. Has seleccionado {dias} día(s).
                    </div>
                  ) : estaReservado() ? (
                    <div
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #ef4444',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                      Este vehículo ya se encuentra reservado en las fechas seleccionadas. Elige otras fechas.
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: 'rgba(37, 211, 102, 0.15)',
                        color: '#25D366',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #25D366',
                        fontSize: '0.85rem'
                      }}
                    >
                      <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                      Vehículo disponible para {dias} días de alquiler.
                    </div>
                  )}
                </div>
              )}

              {/* OPCIÓN SEGURO FULL */}
              <div
                style={{
                  backgroundColor: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#25D366'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={seguroFull}
                    onChange={(e) => setSeguroFull(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                  />
                  Agregar Seguro Full (Cobertura Total)
                </label>
                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0.4rem 0 0 0' }}>
                  Al incluir Seguro Full quedas exonerado de los USD $400.00 de depósito de garantía.
                </p>
              </div>

              {/* DESGLOSE TOTAL */}
              {dias >= 3 && !estaReservado() && (
                <div
                  style={{
                    backgroundColor: '#090909',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #25D366'
                  }}
                >
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>
                    • Alquiler por día ({dias} días): <strong>USD ${precioPorDia}/día</strong>
                  </p>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>
                    • Subtotal Renta: <strong>USD ${costoRenta}</strong>
                  </p>
                  {seguroFull && (
                    <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#25D366' }}>
                      • Seguro Full ({dias} días a ${precioSeguroPorDia}/día): <strong>USD ${costoSeguro}</strong>
                    </p>
                  )}
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: seguroFull ? '#25D366' : '#f59e0b' }}>
                    • Depósito de Garantía:{' '}
                    <strong>{seguroFull ? 'USD $0 (Exonerado por Seguro Full)' : 'USD $400.00'}</strong>
                  </p>
                  <hr style={{ borderColor: '#333' }} />
                  <h4 style={{ margin: '0.5rem 0 0 0', color: '#fff', fontSize: '1.2rem' }}>
                    MONTO TOTAL: <span style={{ color: '#25D366' }}>USD ${costoTotal}</span>
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#f59e0b', margin: '0.3rem 0 0 0' }}>
                    * Para confirmar la reserva se requiere un pago inicial de USD $150.00.
                  </p>
                </div>
              )}

              {/* DATOS DEL CLIENTE */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  Dirección de Residencia en Rep. Dom.:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calle Principal #12, Hotel / Residencia, Santo Domingo"
                  value={direccionRD}
                  onChange={(e) => setDireccionRD(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Teléfono / WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (809) 000-0000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Correo Electrónico:</label>
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* SECCIÓN FIRMA DIGITAL */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  Firma Digital del Cliente:
                </label>
                <div style={{ backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    onMouseDown={iniciarDibujo}
                    onMouseMove={dibujar}
                    onMouseUp={detenerDibujo}
                    onMouseLeave={detenerDibujo}
                    onTouchStart={iniciarDibujo}
                    onTouchMove={dibujar}
                    onTouchEnd={detenerDibujo}
                    style={{ width: '100%', height: '150px', touchAction: 'none', cursor: 'crosshair' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={limpiarFirma}
                  style={{
                    marginTop: '0.4rem',
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Limpiar Firma
                </button>
              </div>

              {/* TÉRMINOS Y CONTRATO LEÍBLE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={aceptaContrato}
                    onChange={(e) => setAceptaContrato(e.target.checked)}
                    required
                  />
                  Acepto los términos y condiciones del contrato de arrendamiento.
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarModalContrato(true)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: 0
                  }}
                >
                  <i className="fa-solid fa-file-contract" style={{ marginRight: '5px' }}></i>
                  Ver Contrato Completo en Pantalla
                </button>
              </div>

              <button
                type="submit"
                disabled={enviando || dias < 3 || estaReservado()}
                style={{
                  padding: '1rem',
                  backgroundColor: enviando || dias < 3 || estaReservado() ? '#555' : '#ff0000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: enviando || dias < 3 || estaReservado() ? 'not-allowed' : 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                {enviando ? 'Procesando Reserva...' : 'CONFIRMAR Y SOLICITAR RESERVA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER CONTRATO LEÍBLE */}
      {mostrarModalContrato && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#f59e0b' }}>CONTRATO DIGITAL DE ARRENDAMIENTO</h3>
              <button
                onClick={() => setMostrarModalContrato(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'Arial, sans-serif',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                color: '#cbd5e1',
                backgroundColor: '#050505',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #222',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}
            >
              {TEXTO_CONTRATO}
            </pre>
            <button
              onClick={() => setMostrarModalContrato(false)}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Entendido y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL WHATSAPP VIP */}
      {mostrarModalWS && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#25D366', marginTop: 0 }}>Contacto Directo WhatsApp VIP</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
              Selecciona uno de nuestros ejecutivos para atención inmediata:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              <a
                href="https://wa.me/18090000000?text=Hola,%20deseo%20rentar%20un%20veh%C3%ADculo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.8rem',
                  backgroundColor: '#25D366',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                <i className="fa-brands fa-whatsapp"></i> Contactar a Freddy Rodríguez
              </a>
              <a
                href="https://wa.me/18090000001?text=Hola,%20deseo%20rentar%20un%20veh%C3%ADculo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.8rem',
                  backgroundColor: '#25D366',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                <i className="fa-brands fa-whatsapp"></i> Contactar a Landra Guzmán
              </a>
            </div>
            <button
              onClick={() => setMostrarModalWS(false)}
              style={{
                background: 'none',
                border: '1px solid #555',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* SECCIÓN SOBRE NOSOTROS */}
      <section id="nosotros" style={{ padding: '4rem 1.5rem', backgroundColor: 'rgba(12, 12, 12, 0.9)', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#ff0000', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            SOBRE MONACO LUXURY RENT A CAR
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
            Nos consolidamos como el estándar de referencia en la República Dominicana para clientes que demandan exclusividad, discreción y el más alto nivel de servicio en transporte privado y alquiler de vehículos premium.
          </p>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ textAlign: 'center', color: '#f59e0b', fontSize: '1.8rem', marginBottom: '2rem', fontWeight: 'bold' }}>
          PREGUNTAS FRECUENTES (FAQ)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#121212',
                border: '1px solid #222',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1rem 1.2rem',
                  backgroundColor: '#181818',
                  color: '#fff',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{faq.pregunta}</span>
                <i className={`fa-solid ${faqAbierta === index ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>
              {faqAbierta === index && (
                <div style={{ padding: '1rem 1.2rem', color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {faq.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" style={{ backgroundColor: '#050505', borderTop: '1px solid #222', padding: '3rem 1.5rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>
        <p style={{ margin: '0 0 0.5rem 0', color: '#fff', fontWeight: 'bold' }}>MONACO LUXURY RENT A CAR</p>
        <p style={{ margin: '0 0 1rem 0' }}>República Dominicana | Reserva Directa y Atención Ejecutiva</p>
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Monaco Luxury Rent a Car. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
