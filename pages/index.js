import React, { useState } from 'react';
import Head from 'next/head';

const vehiculos = [
  {
    id: 'kia-sportage-lx-2020',
    nombre: 'Kia Sportage LX 2020',
    imagen: '/kia.jpeg',
    precios: { base: 50, medio: 45, largo: 40 }
  },
  {
    id: 'jeep-cherokee-latitude-2019',
    nombre: 'Jeep Cherokee Latitude 2019',
    imagen: '/jeep.jpg',
    precios: { base: 55, medio: 50, largo: 45 }
  },
  {
    id: 'kia-seltos-2021',
    nombre: 'Kia Seltos 2021',
    imagen: '/kia.jpeg',
    precios: { base: 55, medio: 50, largo: 45 }
  }
];

export default function Home() {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mostrarModalWS, setMostrarModalWS] = useState(false);
  const [mostrarModalContrato, setMostrarModalContrato] = useState(false);

  // Formulario
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoCliente, setTipoCliente] = useState('extranjero');
  const [seguroFull, setSeguroFull] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaContrato, setAceptaContrato] = useState(false);

  // Cálculo de días y precio
  const calcularDias = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const dias = calcularDias();

  const obtenerPrecioPorDia = (v) => {
    if (!v) return 0;
    if (dias >= 11) return v.precios.largo;
    if (dias >= 4) return v.precios.medio;
    return v.precios.base;
  };

  const precioPorDia = obtenerPrecioPorDia(vehiculoSeleccionado);
  const costoRenta = dias * precioPorDia;
  const costoSeguro = seguroFull ? dias * 15 : 0; // Tarifa referencial de seguro full
  const costoTotal = costoRenta + costoSeguro;

  const handleSubmitReserva = (e) => {
    e.preventDefault();
    if (!aceptaContrato) {
      alert('Debes aceptar el contrato de arrendamiento para continuar.');
      return;
    }
    alert(`¡Reserva iniciada exitosamente!\n\nVehículo: ${vehiculoSeleccionado.nombre}\nDías: ${dias}\nTotal a pagar: USD $${costoTotal}\nReserva requerida: USD $150.00\n\nNos pondremos en contacto contigo a la brevedad.`);
    setVehiculoSeleccionado(null);
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
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>Ubicados en Gazcue. Renta fácil, rápida y segura con la mejor atención personalizada.</p>
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
                
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span>1 - 3 Días:</span>
                    <strong style={{ color: '#f59e0b' }}>USD ${v.precios.base}/día</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span>4 - 10 Días:</span>
                    <strong style={{ color: '#f59e0b' }}>USD ${v.precios.medio}/día</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>11+ Días:</span>
                    <strong style={{ color: '#f59e0b' }}>USD ${v.precios.largo}/día</strong>
                  </div>
                </div>

                <button 
                  onClick={() => setVehiculoSeleccionado(v)} 
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
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Fecha de Inicio:</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Fecha de Fin:</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
              </div>

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
                  <strong>Deseo contratar Seguro Full (+USD $15/día)</strong>
                </label>
                <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Exonera el depósito de garantía de USD $400. En caso de siniestro solo pagas el deducible.</p>
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

              {/* RESUMEN DE COSTOS */}
              {dias > 0 && (
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #f59e0b', fontSize: '0.9rem' }}>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Días de Alquiler: <strong>{dias} día(s)</strong></p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Precio por Día: <strong>USD ${precioPorDia}</strong></p>
                  <p style={{ margin: '0 0 0.3rem 0' }}>Depósito Requerido: <strong>{seguroFull ? 'Exonerado (Seguro Full)' : 'USD $400.00'}</strong></p>
                  <h4 style={{ margin: '0.5rem 0 0 0', color: '#f59e0b', fontSize: '1.1rem' }}>Total Estimado: USD ${costoTotal}</h4>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Se requiere un abono de <strong>USD $150.00</strong> para confirmar la reserva.</p>
                </div>
              )}

              {/* CHECKBOX CONTRATO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="contrato" checked={aceptaContrato} onChange={(e) => setAceptaContrato(e.target.checked)} required />
                <label htmlFor="contrato" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Acepto los <button type="button" onClick={() => setMostrarModalContrato(true)} style={{ color: '#f59e0b', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>Términos y Condiciones del Contrato</button>
                </label>
              </div>

              <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                Confirmar Reserva
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
              <a 
                href="https://wa.me/18498471138" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ padding: '0.75rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}
              >
                📱 WhatsApp Opción 1 (+1 849-847-1138)
              </a>
              <a 
                href="https://wa.me/18296792686" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ padding: '0.75rem', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}
              >
                📱 WhatsApp Opción 2 (+1 829-679-2686)
              </a>
            </div>
            <button onClick={() => setMostrarModalWS(false)} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL CONTRATO DE ARRENDAMIENTO */}
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
            <strong>6.3. Uso Permitido y Prohibiciones:</strong> El vehículo solo podrá ser conducido por el CLIENTE o por conductores adicionales autorizados. Queda prohibido subarrendar, transportar carga pesada, participar en carreras o conducir bajo los efectos del alcohol.<br />
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
