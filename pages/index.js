import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import emailjs from '@emailjs/browser';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, getDocs } from 'firebase/firestore';



const DATOS_BANCARIOS = `
CUENTAS BANCARIAS PARA TRANSFERENCIA / RESERVA ($150 USD):
• Banco Popular Dominicano (Pesos DOP): Cta. Ahorros N° 814423729
• Banreservas (Pesos DOP): Cta. Corriente N° 9605170252
• BHD (Pesos DOP): Cta. Corriente N° 39485910015
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
3.2. Depósito de Garantía: el CLIENTE debe dejar un depósito de garantía de USD $400.00.
3.3. Responsabilidad por Daños: Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante.
3.4. Seguro Full (Cobertura Total Exclusiva): Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: en caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.

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
6.6. Compensación por Inmovilización y Pérdida de Uso (Loss of Use): Además de los costos de reparación material del vehículo descritos en este contrato, el CLIENTE acepta y
se compromete a indemnizar a MONACO LUXURY RENT A CAR por los días en que el vehículo permanezca fuera de servicio e inhabilitado para la renta debido al tiempo que
tome su peritaje, reparación en el taller y/o proceso de pintura. Esta compensación se calculará multiplicando el número de días que dure la inmovilización por la tarifa diaria
de alquiler vigente del vehículo. Este cobro aplica de manera independiente al estado del seguro o deducibles, ya que cubre la lucrocesante de la flota comercial.

7. ACEPTACIÓN DIGITAL
Al realizar el pago de la reserva o al tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato digital emitido por MONACO LUXURY RENT A CAR.
`;

export default function Home() {
  const [vehiculos, setVehiculos] = useState([]); // <-- Dejamos solo una

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'vehiculos'), (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre || '',
          marca: data.marca || '',
          modelo: data.modelo || '',
          anio: data.anio || 2023,
          combustible: data.combustible || 'Gasolina',
          pasajeros: data.pasajeros || '5 Personas',
          transmision: data.transmision || 'Automática',
          imagen: data.imagenUrl || '/kia.jpg',
          precios: {
            base: Number(data.precio3a5Dias) || 50,
            medio: Number(data.precio6a10Dias) || 45,
            largo: Number(data.precio11MasDias) || 40
          },
          seguroFullPrecios: {
            corto: Number(data.seguro3a5Dias || data['Seguro de 3 a 5 días']) || 30,
            medio: Number(data.seguro6a10Dias) || 25,
            largo: Number(data.seguro11MasDias) || 20
          },
          disponible: data.estado === 'disponible',
          estado: data.estado || 'disponible'
        };
      }).filter(v => v.estado !== 'inactivo');

      setVehiculos(docs);
    });

    return () => unsubscribe();
  }, []);
  // --- FIN DE LA CONEXIÓN ---
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarModalWS, setMostrarModalWS] = useState(false);
  const [mostrarModalContrato, setMostrarModalContrato] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reservasExistentes, setReservasExistentes] = useState([]);

  const [menuAbierto, setMenuAbierto] = useState(false);

  // Buscador por marca y modelo
  const [busquedaMarca, setBusquedaMarca] = useState('');
  const [busquedaModelo, setBusquedaModelo] = useState('');

  // Datos de la reserva
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoCliente, setTipoCliente] = useState('extranjero');
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [seguroFull, setSeguroFull] = useState(false);
  const [nombre, setNombre] = useState('');
  const [direccionRD, setDireccionRD] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaContrato, setAceptaContrato] = useState(false);
  const [lugarEntrega, setLugarEntrega] = useState('aero-americas');
  const [otraDireccionEntrega, setOtraDireccionEntrega] = useState('');

  // FAQ Accordion State
  const [faqAbierta, setFaqAbierta] = useState(null);

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
    return reservasExistentes
    .filter(r => r.vehiculoId === vehiculoSeleccionado.id)
    .some((r) => {
        const rInicio = new Date(r.inicio + 'T00:00:00');
        const rFin = new Date(r.fin + 'T00:00:00');
        return inicioSel <= rFin && finSel >= rInicio;
    });
  };
  const precioPorDia = vehiculoSeleccionado ? (
    dias >= 11 ? vehiculoSeleccionado.precios.largo : 
    dias >= 6 ? vehiculoSeleccionado.precios.medio : 
    vehiculoSeleccionado.precios.base
  ) : 0;

  const precioSeguroPorDia = vehiculoSeleccionado && seguroFull ? (
    dias >= 11 ? vehiculoSeleccionado.seguroFullPrecios.largo : 
    dias >= 6 ? vehiculoSeleccionado.seguroFullPrecios.medio : 
    vehiculoSeleccionado.seguroFullPrecios.corto
  ) : 0;

  const costoRenta = dias * precioPorDia;
  const costoSeguro = dias * precioSeguroPorDia;
  const depositoGarantia = 400;

  const costoEntrega = 
    lugarEntrega === 'puntacana' ? 150 : 
    lugarEntrega === 'santiago' ? 100 : 0;

  const costoTotalFinal = costoRenta + costoSeguro + depositoGarantia + costoEntrega;
  const costoTotal = costoTotalFinal;
  const errorDias = dias < 3;

 const vehiculosFiltrados = vehiculos.filter((v) => {
  const marcaFiltro = busquedaMarca.toLowerCase().trim();
  const modeloFiltro = busquedaModelo.toLowerCase().trim();

  // Obtener texto de marca y nombre de forma segura evitando undefined
  const marcaVehiculo = (v.marca || '').toLowerCase();
  const nombreVehiculo = (v.nombre || '').toLowerCase();
  const modeloVehiculo = (v.modelo || '').toLowerCase();

  // Coincide la marca si está vacía, o si la marca/nombre contiene el texto buscado
  const coincideMarca = 
    busquedaMarca === '' || 
    busquedaMarca === 'Todas las Marcas' || 
    marcaVehiculo.includes(marcaFiltro) || 
    nombreVehiculo.includes(marcaFiltro);

  // Coincide el modelo si está vacío, o si el modelo/nombre contiene el texto buscado
  const coincideModelo = 
    busquedaModelo === '' || 
    modeloVehiculo.includes(modeloFiltro) || 
    nombreVehiculo.includes(modeloFiltro);

  return coincideMarca && coincideModelo;
});

  const toggleFaq = (index) => {
    setFaqAbierta(faqAbierta === index ? null : index);
  };

  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    if (estaReservado()) { alert('El vehículo ya se encuentra reservado en esas fechas. Por favor elige otras fechas.'); return; }
    if (!direccionRD.trim()) { alert('Por favor ingresa tu dirección de residencia en RD.'); return; }
    if (!aceptaContrato) { alert('Debes aceptar el contrato.'); return; }
    if (!tieneFirma) { alert('Debes firmar digitalmente.'); return; }

   // 1. VALIDACIÓN DEFINITIVA DE LISTA NEGRA
    try {
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const cedulaInput = String(
        typeof documentoCliente !== 'undefined' ? documentoCliente :
        typeof cedula !== 'undefined' ? cedula :
        typeof documento !== 'undefined' ? documento : ''
      ).trim();

      if (cedulaInput) {
        let estaBloqueado = false;

        querySnapshot.forEach((docSnap) => {
          const cData = docSnap.data();
          const enLista = 
            cData.listaNegra === true || cData.listaNegra === "true" || 
            cData.enListaNegra === true || cData.enListaNegra === "true";

          if (enLista) {
            const dbCedula = cData.cedula ? String(cData.cedula).trim() : '';
            const dbPasaporte = cData.cedulaPasaporte ? String(cData.cedulaPasaporte).trim() : '';
            const dbDoc = cData.documento ? String(cData.documento).trim() : '';

            if (
              dbCedula === cedulaInput || 
              dbPasaporte === cedulaInput || 
              dbDoc === cedulaInput || 
              docSnap.id.trim() === cedulaInput
            ) {
              estaBloqueado = true;
            }
          }
        });

        if (estaBloqueado) {
          alert('⚠️ ACCESO DENEGADO: Este número de documento se encuentra en la LISTA NEGRA. No se puede procesar la reserva.');
          setEnviando(false);
          return; // Detiene la ejecución aquí mismo por completo
        }
      }
    } catch (error) {
      console.error('Error al verificar lista negra:', error);
    }

    // 2. SI NO ESTÁ BLOQUEADO, PROCEDE A GUARDAR
    setEnviando(true);
    try {
      // ... (el resto de tu código de guardar y enviar correo que ya tienes abajo)
      const firmaUrl = canvasRef.current.toDataURL('image/png');

      await addDoc(collection(db, 'reservas'), {
        vehiculoId: vehiculoSeleccionado.id,
        vehiculoNombre: vehiculoSeleccionado.nombre,
        inicio: fechaInicio,
        fin: fechaFin,
        clienteNombre: nombre,
        clienteEmail: email,
        clienteTelefono: telefono,
        clienteDireccionRD: direccionRD,
        tipoCliente: tipoCliente,
        documentoCliente: documentoCliente,
        seguroFull: seguroFull === 'si' || seguroFull === true || (typeof seguroFull === 'string' && seguroFull.includes('Seguro Full')),        opcionSeguro: seguroFull,
        precioPorDia: precioPorDia,
        precioSeguroPorDia: precioSeguroPorDia,
        depositoGarantia: 400,
        lugarEntrega: lugarEntrega,
        costoEntrega: costoEntrega || 0,
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
            documento_cliente: documentoCliente,
            vehiculo: vehiculoSeleccionado.nombre,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            dias_totales: dias,
            precio_por_dia: precioPorDia,
            seguro_full: seguroFull ? `SI ($${precioSeguroPorDia}/día)` : 'NO',
            costo_total: costoTotalFinal,
            // Mandamos ambas nomenclaturas para que EmailJS la tome sí o sí
     depositoGarantia: 400,
     deposito_garantia: 400,
      
      lugarEntrega: lugarEntrega === 'puntacana' ? 'Punta Cana (+$150)' : lugarEntrega === 'santiago' ? 'Santiago (+$100)' : 'Santo Domingo (Gratis / A Coordinar)',
      lugar_entrega: lugarEntrega === 'puntacana' ? 'Punta Cana (+$150)' : lugarEntrega === 'santiago' ? 'Santiago (+$100)' : 'Santo Domingo (Gratis / A Coordinar)',
      
      costoEntrega: costoEntrega,
      costo_entrega: costoEntrega,
      
      costoTotalFinal: costoTotalFinal,
      costo_total_final: costoTotalFinal,
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
      respuesta: 'Ser mayor de 21 años, contar con licencia de conducir válida y vigente, documento de identidad o pasaporte, y presentar la tarjeta de crédito o el depósito de garantía equivalente.'
    },
    {
      pregunta: '¿Cómo funciona el depósito de garantía?',
      respuesta: 'El depósito de garantía (USD $400.00) se autoriza o entrega al momento de firmar el contrato digital de alquiler y se reembolsa íntegramente al devolver el vehículo en las mismas condiciones entregadas.'
    },
    {
      pregunta: '¿Qué incluye el alquiler de los vehículos?',
      respuesta: 'Todos nuestros alquileres incluyen Cobertura de Seguro Básico de Tránsito, mantenimiento mecánico preventivo al día y asistencia vehicular vial durante el período contratado.'
    },
    {
      pregunta: '¿Cuál es la política de entrega y devolución del vehículo?',
      respuesta: 'El vehículo se entrega con el nivel de combustible pactado y debe ser devuelto a la misma hora exacta y lugar fijados en el contrato. Se otorga margen de tolerancia, pero exceder de 4 horas generará el cobro de un día adicional de renta.'
    },
    {
      pregunta: '¿Quién es responsable de las multas de tránsito?',
      respuesta: 'El cliente es total y exclusivamente responsable de cualquier multa, fotomulta o sanción de tránsito incurrida durante el período que tenga en posesión el vehículo.'
    }
  ];

  return (
    <div id="inicio" style={{ 
      background: 'radial-gradient(circle at top, #1a0002 0%, #050505 50%, #000000 100%)', 
      backgroundAttachment: 'fixed',
      color: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <Head>
        <title>Monaco Luxury Rent a Car</title>
        <meta name="google-site-verification" content="UiwtQWYSJxH8WCZgh6tP3l_J6NuP7KJqv5jl417-M5A" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      {/* ESTILOS CSS GLOBALES */}
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
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="date"],
        select,
        textarea {
          background-color: #121212 !important;
          color: #ffffff !important;
          border: 1px solid #333333 !important;
          border-radius: 6px;
          padding: 0.75rem;
          outline: none;
        }
        input:focus, select:focus, textarea:focus {
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
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          color: #fff;
        }
      `}</style>
      
      {/* HEADER PRINCIPAL */}
      <header style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 90 }}>
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

        {/* MENÚ DE NAVEGACIÓN CON BOTÓN DE HAMBURGUESA */}
        <div style={{ background: 'rgba(17, 17, 17, 0.8)', borderTop: '1px solid #222', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)} 
            style={{ background: '#222', border: '1px solid #444', color: '#fff', fontSize: '1.2rem', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
          >
            ☰
          </button>
        </div>

       {menuAbierto && (
         <div style={{ background: '#141414', borderBottom: '1px solid #333', padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'center', position: 'absolute', width: '100%', zIndex: 100, boxShadow: '0px 10px 20px rgba(0,0,0,0.5)' }}>
           <a href="#inicio" onClick={() => setMenuAbierto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', padding: '0.5rem' }}>INICIO</a>
           <a href="#flota" onClick={() => setMenuAbierto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', padding: '0.5rem' }}>NUESTRA FLOTA</a>
           <a href="#nosotros" onClick={() => setMenuAbierto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', padding: '0.5rem' }}>SOBRE NOSOTROS</a>
           <a href="#faq" onClick={() => setMenuAbierto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', padding: '0.5rem' }}>PREGUNTAS FRECUENTES</a>
           <a href="#contacto" onClick={() => setMenuAbierto(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', padding: '0.5rem' }}>CONTACTO</a>
         </div>
       )}
     </header>

      {/* SECCIÓN HERO / INICIO CON PRESENTACIÓN COMPLETA */}
      <section style={{ background: 'linear-gradient(180deg, rgba(30,0,3,0.7) 0%, rgba(10,10,10,0.95) 100%)', padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <h2 style={{ fontSize: '2.8rem', color: '#ffffff', marginBottom: '1.2rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Alquiler de Vehículos en República Dominicana
          </h2>
          
          <p style={{ color: '#e2e8f0', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '850px', margin: '0 auto 3rem auto', fontWeight: '300' }}>
            En <strong style={{ color: '#ff0000', fontWeight: 'bold' }}>MONACO LUXURY RENT A CAR</strong> somos una empresa especializada en el alquiler de vehículos de lujo y gama alta, orientada a ofrecer soluciones de movilidad exclusiva, confort y elegancia para ejecutivos, turistas y clientes exigentes.
          </p>

          {/* TARJETA ¿QUIÉNES SOMOS? */}
          <div style={{ backgroundColor: 'rgba(18, 18, 18, 0.85)', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', textAlign: 'left', marginBottom: '3.5rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#ff0000', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ¿Quiénes Somos?
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.8rem' }}>
              
              <div style={{ backgroundColor: '#121212', padding: '1.5rem', borderRadius: '10px', borderLeft: '4px solid #ff0000' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-gem" style={{ color: '#f59e0b' }}></i> Especialistas en Movilidad Prémium
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  Brindamos un servicio diferencial respaldado por una flota impecable de vehículos modernos y de alta gama, diseñados para garantizar máxima seguridad y estatus en cada trayecto.
                </p>
              </div>

              <div style={{ backgroundColor: '#121212', padding: '1.5rem', borderRadius: '10px', borderLeft: '4px solid #ff0000' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-user-shield" style={{ color: '#25D366' }}></i> Atención Personalizada e Integral
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  Nos enfocamos en satisfacer las necesidades individuales de cada cliente, ofreciendo entregas personalizadas en aeropuertos, hoteles y residencias, además de atención continua y procesos de reserva fluidos.
                </p>
              </div>

              <div style={{ backgroundColor: '#121212', padding: '1.5rem', borderRadius: '10px', borderLeft: '4px solid #ff0000' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-handshake" style={{ color: '#3b82f6' }}></i> Compromiso y Transparencia
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  Operamos bajo estándares internacionales de servicio, respaldados por políticas contractuales claras, mantenimientos rigurosos y opciones de cobertura para asegurar una experiencia sin inconvenientes.
                </p>
              </div>

            </div>
          </div>

          {/* BUSCADOR DE VEHÍCULOS */}
          <div style={{ backgroundColor: 'rgba(22, 22, 22, 0.9)', padding: '1.8rem', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 8px 32px rgba(255, 0, 0, 0.08)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#f59e0b', fontSize: '1.1rem', textAlign: 'left', fontWeight: 'bold' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '8px' }}></i> BUSCAR VEHÍCULO POR MARCA Y MODELO
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem', textAlign: 'left' }}>Marca</label>
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
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem', textAlign: 'left' }}>Modelo</label>
                <input type="text" placeholder="Ej: Sportage, Cherokee, Seltos..." value={busquedaModelo} onChange={(e) => setBusquedaModelo(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN FLOTA DE VEHÍCULOS */}
      <main id="flota" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        <h3 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.8rem', letterSpacing: '1px', fontWeight: 'bold' }}>
          NUESTRA FLOTA DISPONIBLE
        </h3>

        {vehiculosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>No se encontraron vehículos que coincidan con la búsqueda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {vehiculosFiltrados.map((v) => {
              return (
                <div key={v.id} style={{ backgroundColor: 'rgba(17, 17, 17, 0.85)', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <div>
                    <img src={v.imagen} alt={v.nombre} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    <h4 style={{ color: '#fff', margin: '1rem 0 0.5rem 0', fontSize: '1.2rem' }}>{v.nombre}</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#1a1a1a', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #2a2a2a', fontSize: '0.82rem' }}>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-gas-pump" style={{ color: '#ff0000', marginRight: '5px' }}></i> {v.combustible}</span>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-users" style={{ color: '#ff0000', marginRight: '5px' }}></i> {v.pasajeros}</span>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-gear" style={{ color: '#ff0000', marginRight: '5px' }}></i> {v.transmision}</span>
                      <span style={{ color: '#cbd5e1' }}><i className="fa-solid fa-calendar" style={{ color: '#ff0000', marginRight: '5px' }}></i> Año {v.anio}</span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem', backgroundColor: '#090909', padding: '0.75rem', borderRadius: '6px', border: '1px solid #222' }}>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#ff0000', fontWeight: 'bold' }}>Tarifas por Día (Mínimo 3 Días):</p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 3-5 Días: USD ${v.precios.base}/día</p>
                      <p style={{ margin: '0 0 0.15rem 0' }}>• 6-10 Días: USD ${v.precios.medio}/día</p>
                      <p style={{ margin: '0 0 0.5rem 0' }}>• 11+ Días: USD ${v.precios.largo}/día</p>
                    </div>
                  </div>

                 <button 
  onClick={() => v.disponible && setVehiculoSeleccionado(v)} 
  disabled={!v.disponible}
  style={{ 
    width: '100%', 
    padding: '0.75rem', 
    backgroundColor: v.disponible ? '#f59e0b' : '#dc2626', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: v.disponible ? 'pointer' : 'not-allowed', 
    fontSize: '1rem',
    opacity: v.disponible ? 1 : 0.9
  }}
>
  {v.disponible ? 'Reservar este Auto' : 'No disponible'}
</button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* SECCIÓN SOBRE NOSOTROS Y VALORES */}
      <section id="nosotros" style={{ padding: '4rem 1.5rem', backgroundColor: 'rgba(12, 12, 12, 0.9)', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#ff0000', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            SOBRE MONACO LUXURY RENT A CAR
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
            Nos consolidamos como el estándar de referencia en la República Dominicana para clientes que demandan exclusividad, discreción y el más alto nivel de servicio en transporte privado y alquiler de vehículos premium.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '3.5rem' }}>
            <div style={{ backgroundColor: '#181818', padding: '2rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '1rem' }}><i className="fa-solid fa-bullseye"></i></div>
              <h4 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Nuestra Misión</h4>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Proporcionar soluciones de movilidad prémium respaldadas por el confort, la puntualidad y la seguridad absoluta, convirtiendo cada trayecto en una experiencia inolvidable.
              </p>
            </div>

            <div style={{ backgroundColor: '#181818', padding: '2rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: '2rem', color: '#ff0000', marginBottom: '1rem' }}><i className="fa-solid fa-eye"></i></div>
              <h4 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Nuestra Visión</h4>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Ser reconocidos como la marca líder en rent-a-car de lujo del Caribe, expandiendo continuamente nuestra flota moderna con los más altos estándares éticos y operacionales.
              </p>
            </div>
          </div>

          {/* SECCIÓN DE VALORES DE LA EMPRESA */}
          <h4 style={{ fontSize: '1.6rem', color: '#f59e0b', marginBottom: '1.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            NUESTROS VALORES
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            
            <div style={{ backgroundColor: '#181818', padding: '1.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-award" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.8rem' }}></i>
              <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>EXCELENCIA</h5>
              <p style={{ color: '#aaa', fontSize: '0.88rem', margin: 0 }}>Mantenemos los más altos estándares en la calidad de nuestros vehículos y servicios.</p>
            </div>

            <div style={{ backgroundColor: '#181818', padding: '1.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-clock" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.8rem' }}></i>
              <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>PUNTUALIDAD</h5>
              <p style={{ color: '#aaa', fontSize: '0.88rem', margin: 0 }}>Respetamos tu tiempo ofreciendo un servicio rápido y entregas siempre a tiempo.</p>
            </div>

            <div style={{ backgroundColor: '#181818', padding: '1.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-file-contract" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.8rem' }}></i>
              <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>TRANSPARENCIA</h5>
              <p style={{ color: '#aaa', fontSize: '0.88rem', margin: 0 }}>Términos claros, contratos digitales y sin cargos ni tarifas ocultas.</p>
            </div>

            <div style={{ backgroundColor: '#181818', padding: '1.8rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.8rem' }}></i>
              <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>SEGURIDAD</h5>
              <p style={{ color: '#aaa', fontSize: '0.88rem', margin: 0 }}>Vehículos inspeccionados minuciosamente para garantizar total tranquilidad en tu viaje.</p>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '2.5rem', fontWeight: 'bold' }}>
          PREGUNTAS FRECUENTES (FAQ)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderRadius: '8px', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{faq.pregunta}</span>
                <i className={`fa-solid ${faqAbierta === index ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#ff0000' }}></i>
              </button>
              {faqAbierta === index && (
                <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', borderTop: '1px solid #222' }}>
                  <p style={{ marginTop: '0.8rem', marginBottom: 0 }}>{faq.respuesta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN CONTACTO */}
      <section id="contacto" style={{ padding: '4rem 1.5rem', backgroundColor: '#0a0a0a', borderTop: '1px solid #222' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#ff0000', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            CONTÁCTANOS
          </h3>
          <p style={{ color: '#aaa', marginBottom: '2.5rem' }}>Estamos disponibles para atender tus dudas, consultas o reservaciones personalizadas de forma inmediata.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#121212', padding: '1.5rem', borderRadius: '10px', border: '1px solid #222' }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: '2rem', color: '#ff0000', marginBottom: '0.8rem' }}></i>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Correo Electrónico</h4>
              <p style={{ color: '#cbd5e1', margin: 0 }}>
                <a href="mailto:monacoluxurycars7@gmail.com" style={{ color: '#f59e0b', textDecoration: 'none' }}>monacoluxurycars7@gmail.com</a>
              </p>
            </div>

            <div style={{ backgroundColor: '#121212', padding: '1.5rem', borderRadius: '10px', border: '1px solid #222' }}>
              <i className="fa-solid fa-phone" style={{ fontSize: '2rem', color: '#25D366', marginBottom: '0.8rem' }}></i>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Teléfonos / WhatsApp</h4>
              <p style={{ color: '#cbd5e1', margin: '0 0 0.3rem 0' }}>
                <a href="tel:8294257986" style={{ color: '#f59e0b', textDecoration: 'none' }}>+1 (829) 425-7986</a>
              </p>
              <p style={{ color: '#cbd5e1', margin: 0 }}>
                <a href="tel:9732894797" style={{ color: '#f59e0b', textDecoration: 'none' }}>+1 (973) 289-4797</a>
              </p>
            </div>

            <div style={{ backgroundColor: '#121212', padding: '1.5rem', borderRadius: '10px', border: '1px solid #222' }}>
              <i className="fa-solid fa-clock" style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.8rem' }}></i>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Horario de Atención</h4>
              <p style={{ color: '#cbd5e1', margin: 0 }}>Lunes a Domingo<br />Atención las 24 Horas</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#050505', padding: '2rem 1rem', textAlign: 'center', borderTop: '1px solid #1a1a1a', fontSize: '0.85rem', color: '#777' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>&copy; 2026 MONACO LUXURY RENT A CAR. Todos los derechos reservados.</p>
        <p style={{ margin: 0, color: '#aaa' }}>Contacto: monacoluxurycars7@gmail.com | Tel: 829-425-7986 / 973-289-4797</p>
      </footer>

      {/* MODAL SELECCIÓN WHATSAPP */}
      {mostrarModalWS && (
        <div className="modal-overlay" onClick={() => setMostrarModalWS(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h3 style={{ color: '#25D366', marginBottom: '1rem', fontSize: '1.4rem' }}>
              <i className="fa-brands fa-whatsapp"></i> Seleccionar WhatsApp
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Selecciona con cuál de nuestras líneas oficiales deseas comunicarte:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="https://wa.me/18294257986" target="_blank" rel="noopener noreferrer" style={{ padding: '0.8rem', backgroundColor: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Línea 1: +1 (829) 425-7986
              </a>
              <a href="https://wa.me/19732894797" target="_blank" rel="noopener noreferrer" style={{ padding: '0.8rem', backgroundColor: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                Línea 2: +1 (973) 289-4797
              </a>
            </div>
            <button onClick={() => setMostrarModalWS(false)} style={{ marginTop: '1.5rem', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}


      {/* MODAL DE RESERVA Y FIRMA DIGITAL */}
      {vehiculoSeleccionado && (
        <div className="modal-overlay" onClick={() => setVehiculoSeleccionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Reservar: {vehiculoSeleccionado.nombre}</h3>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Por favor completa todos los datos requeridos para generar tu solicitud y contrato digital.</p>
            
            <form onSubmit={handleSubmitReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Nombre Completo *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Correo Electrónico *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Teléfono / WhatsApp *</label>
                  <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Dirección de Residencia en RD *</label>
                <input type="text" required value={direccionRD} onChange={(e) => setDireccionRD(e.target.value)} placeholder="Ej: Calle Principal #12, Hotel u Hospedaje" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Fecha Inicio *</label>
                  <input type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Fecha Fin *</label>
                  <input type="date" required value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Tipo de Cliente</label>
                  <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} style={{ width: '100%' }}>
                    <option value="extranjero">Extranjero (Pasaporte)</option>
                    <option value="residente">Residente / Local (Cédula)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>Opción de Seguro</label>
                  <select value={seguroFull ? 'si' : 'no'} onChange={(e) => setSeguroFull(e.target.value === 'si')} style={{ width: '100%' }}>
                    <option value="no">Seguro Básico </option>
                    <option value="si">Seguro Full </option>
                  </select>
                </div>
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
                 <div>
                   <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>
                     No. de Cédula o Pasaporte *
                   </label>
                   <input 
                    type="text" 
                    required 
                    placeholder="Ingresa el número de tu cédula o pasaporte" 
                    value={documentoCliente} 
                    onChange={(e) => setDocumentoCliente(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
              </div>

           {/* SECCIÓN DE LUGAR DE ENTREGA */}
<div style={{ background: '#141414', border: '1px solid #333', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
  <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.8rem', color: '#ff0000', marginBottom: '0.5rem', fontWeight: 'bold' }}>
    Lugar de Entrega / Retiro del Vehículo *
  </label>
  <select 
    value={lugarEntrega}
    onChange={(e) => setLugarEntrega(e.target.value)}
    style={{ width: '100%', padding: '0.7rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px', marginBottom: '1rem' }}
  >
    <option value="aero-americas">Aeropuerto Internacional de las Américas (Gratis)</option>
    <option value="aero-isabela">Aeropuerto Internacional La Isabela - JBQ (Gratis)</option>
    <option value="puntacana">Aeropuerto de Punta Cana (Costo: $150 USD)</option>
    <option value="santiago">Aeropuerto de Santiago (Costo: $100 USD)</option>
    <option value="santo-domingo">Otra dirección en Santo Domingo (Gratis)</option>
  </select>

  {/* Si eligen otra dirección en Santo Domingo, aparece este campo */}
  {lugarEntrega === 'santo-domingo' && (
    <div style={{ marginTop: '0.8rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.3rem' }}>
        Especifica la dirección de entrega (Si es diferente a donde te hospedarás):
      </label>
      <input 
        type="text"
        placeholder="Ej: Calle Principal #12, Piantini, Santo Domingo"
        value={otraDireccionEntrega}
        onChange={(e) => setOtraDireccionEntrega(e.target.value)}
        style={{ width: '100%', padding: '0.6rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
      />
    </div>
  )}
</div>

              {/* RESUMEN DE PRECIOS */}
              {dias < 3 ? (
                <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff0000' }}>
                  <p style={{ margin: 0, color: '#ff0000', fontWeight: 'bold' }}>⚠️ El alquiler es de mínimo 3 días. Por favor selecciona fechas válidas.</p>
                </div>
              ) : estaReservado() ? (
                <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff0000' }}>
                  <p style={{ margin: 0, color: '#ff0000', fontWeight: 'bold' }}>⚠️ El vehículo ya se encuentra reservado en esas fechas. Por favor elige otros días.</p>
                </div>
              ) : (
                <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <p style={{ margin: '0 0 0.3rem', color: '#f59e0b', fontWeight: 'bold' }}>Desglose Estimado ({dias} Días):</p>
                  <p style={{ margin: '0 0 0.2rem' }}>• Alquiler: USD ${costoRenta} (${precioPorDia}/día)</p>
                  <p style={{ margin: '0 0 0.2rem' }}> Depósito Garantía: USD ${depositoGarantia}</p>                  
                  <p style={{ margin: '0 0 0.2rem' }}>• Seguro Full: USD ${costoSeguro} (${precioSeguroPorDia}/día)</p>
                  
                  {costoEntrega > 0 && (
                    <p style={{ margin: '0 0 0.2rem' }}>• Entrega / Movilización: USD ${costoEntrega}</p>
                  )}

                  <p style={{ margin: '0', color: '#25d366', fontWeight: 'bold', fontSize: '1.05rem', borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
                    Total Estimado: USD ${costoTotalFinal}
                  </p>
                </div>
              )}
              {/* ÁREA DE FIRMA DIGITAL */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#aaa' }}>Firma Digital del Cliente *</label>
                  <button type="button" onClick={limpiarFirma} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Limpiar Firma
                  </button>
                </div>
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
              </div>

              {/* CHECKBOX ACEPTAR CONTRATO */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="aceptaContrato"
                  checked={aceptaContrato}
                  onChange={(e) => setAceptaContrato(e.target.checked)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="aceptaContrato" style={{ fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  Acepto los términos del{' '}
                  <span onClick={(e) => { e.preventDefault(); setMostrarModalContrato(true); }} style={{ color: '#ff0000', textDecoration: 'underline', cursor: 'pointer' }}>
                    Contrato de Arrendamiento
                  </span>{' '}
                  y confirmo que los datos ingresados son verídicos.
                </label>
              </div>

                {/* MODAL CONTRATO DE ARRENDAMIENTO */}
      {mostrarModalContrato && (
        <div className="modal-overlay" onClick={() => setMostrarModalContrato(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#ff0000', marginBottom: '1rem', textAlign: 'center' }}>CONTRATO DE ARRENDAMIENTO</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', backgroundColor: '#080808', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
              {TEXTO_CONTRATO}
            </pre>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setMostrarModalContrato(false)} style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
              {/* BOTONES ACCIÓN */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setVehiculoSeleccionado(null)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancelar
                </button>
               <button type="submit" disabled={enviando || estaReservado()} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#ff0000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: (enviando || estaReservado()) ? 0.6 : 1 }}>
  {enviando ? 'Procesando...' : 'Confirmar Reserva'}
</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
