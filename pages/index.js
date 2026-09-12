const handleSubmitReserva = async (e) => {
    e.preventDefault();
    if (dias < 3) { alert('El alquiler mínimo es de 3 días.'); return; }
    if (estaReservado()) { alert('El vehículo ya se encuentra reservado en esas fechas.'); return; }
    if (!aceptaContrato) { alert('Debes aceptar el contrato.'); return; }
    if (!tieneFirma) { alert('Debes firmar digitalmente.'); return; }

    setEnviando(true);

    try {
      const firmaUrl = canvasRef.current.toDataURL('image/png');

      // Intentar guardar en Firebase y capturar cualquier error exacto
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

      alert('¡Reserva guardada con éxito en Firebase!');
      setVehiculoSeleccionado(null);
    } catch (error) {
      console.error('Error detallado:', error);
      alert('Error al guardar: ' + error.code + ' - ' + error.message);
    } finally {
      setEnviando(false);
    }
  };
