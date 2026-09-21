<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Control de Renta de Vehículos - LuxeDrive</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome Icons CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              gold: {
                50: '#fffdf0',
                100: '#fefab8',
                200: '#fdf380',
                300: '#fce848',
                400: '#fbd818',
                500: '#d4af37', // Custom Luxe Gold
                600: '#aa820a',
                700: '#805d04',
                800: '#553c02',
                900: '#2b1c00',
              },
              dark: {
                900: '#0f1115',
                800: '#181b20',
                700: '#22262f',
                600: '#2d323e',
              }
            },
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
      /* Custom Print Styling */
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-ficha, #printable-ficha * {
          visibility: visible;
        }
        #printable-ficha {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
        .no-print {
          display: none !important;
        }
      }
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #181b20;
      }
      ::-webkit-scrollbar-thumb {
        background: #d4af37;
        border-radius: 4px;
      }
    </style>
</head>
<body class="bg-dark-900 text-gray-200 font-sans antialiased min-h-screen flex flex-col">

    <header class="bg-dark-800 border-b border-gold-500/20 sticky top-0 z-30 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Branding -->
        <div class="flex items-center space-x-3">
          <div class="bg-gradient-to-tr from-gold-600 to-gold-400 p-2.5 rounded-xl shadow-md text-dark-900 font-bold">
            <i class="fa-solid fa-car-rear text-xl"></i>
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-white tracking-wide">LuxeDrive <span class="text-gold-500 text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/30 ml-1">Control Panel</span></h1>
            <p class="text-xs text-gray-400">Sistema Integral de Gestión de Reservas y Alquileres</p>
          </div>
        </div>

        <!-- Quick Stats & Actions -->
        <div class="flex items-center space-x-3">
          <button onclick="openModalNew()" class="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-lg shadow-gold-500/10 flex items-center space-x-2">
            <i class="fa-solid fa-circle-plus"></i>
            <span class="hidden sm:inline">Nueva Reserva</span>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

      <section class="lg:col-span-4 flex flex-col space-y-4">
        
        <!-- Search & Filter Bar -->
        <div class="bg-dark-800 p-4 rounded-xl border border-gray-800 shadow-md">
          <div class="relative mb-3">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm"></i>
            <input type="text" id="searchInput" oninput="filterReservations()" placeholder="Buscar por cliente, vehículo o doc..." 
              class="w-full pl-9 pr-4 py-2 bg-dark-900 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors">
          </div>
          <div class="flex space-x-2">
            <select id="statusFilter" onchange="filterReservations()" class="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gold-500">
              <option value="ALL">Todos los Estados</option>
              <option value="Pagado Completo">Pagado Completo</option>
              <option value="Depósito Parcial">Depósito Parcial</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        <!-- Reservations List -->
        <div class="bg-dark-800 rounded-xl border border-gray-800 shadow-md flex-grow flex flex-col overflow-hidden">
          <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-dark-700/50">
            <h2 class="font-bold text-sm text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-list text-gold-500"></i> Reservas (<span id="reservationCount">0</span>)
            </h2>
            <span class="text-xs text-gray-400">Selecciona para ver detalle</span>
          </div>

          <div id="reservationsList" class="divide-y divide-gray-800/60 overflow-y-auto max-h-[650px] p-2 space-y-1">
            <!-- Dynamic Reservation Items Inserted Here -->
          </div>
        </div>
      </section>

      <section class="lg:col-span-8 flex flex-col space-y-4">
        
        <!-- Ficha Banner Actions -->
        <div class="bg-dark-800 p-4 rounded-xl border border-gray-800 flex flex-wrap justify-between items-center gap-3 shadow-md">
          <div class="flex items-center space-x-3">
            <span class="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-gold-500/10 text-gold-500 border border-gold-500/30" id="badgeReservaID">
              RES-1001
            </span>
            <span class="text-xs text-gray-400" id="badgeFechaCreacion">Creada: --/--/----</span>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center space-x-2 no-print">
            <button onclick="editCurrentReservation()" class="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-200 rounded-lg text-xs font-semibold border border-gray-600 flex items-center gap-1.5 transition-colors">
              <i class="fa-solid fa-pen-to-square text-gold-500"></i> Editar
            </button>
            <button onclick="exportWhatsApp()" class="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
            </button>
            <button onclick="window.print()" class="px-3 py-1.5 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 border border-gold-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i class="fa-solid fa-print"></i> Imprimir
            </button>
            <button onclick="deleteCurrentReservation()" class="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Printable / Viewable Ficha Details Container -->
        <div id="printable-ficha" class="bg-dark-800 rounded-xl border border-gold-500/30 p-6 shadow-2xl space-y-6 relative overflow-hidden">
          
          <!-- Decorative Top Bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>

          <!-- Title Header inside Sheet -->
          <div class="flex justify-between items-start border-b border-gray-700/60 pb-4">
            <div>
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-file-contract text-gold-500"></i> FICHA DE CONTROL DE RESERVA Y ALQUILER
              </h2>
              <p class="text-xs text-gray-400 mt-1">LuxeDrive Vehicle Management System - Control Contable y Operativo</p>
            </div>
            <div class="text-right">
              <span id="displayEstatusPago" class="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PAGADO COMPLETO
              </span>
            </div>
          </div>

          <!-- Grid Sections -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="bg-dark-900/80 p-4 rounded-xl border border-gray-800 space-y-2">
              <h3 class="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                <i class="fa-solid fa-user-tag"></i> 1. Datos de la Reserva y Cliente
              </h3>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span class="text-gray-400 block">Fecha Reserva:</span>
                  <span id="valFechaReserva" class="font-semibold text-gray-100">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Cliente:</span>
                  <span id="valClienteNombre" class="font-bold text-white">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Teléfono / Contacto:</span>
                  <span id="valClienteTelefono" class="font-semibold text-gray-200">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Tipo / Doc. Identidad:</span>
                  <span id="valClienteDoc" class="font-semibold text-gray-200">----</span>
                </div>
              </div>
            </div>

            <div class="bg-dark-900/80 p-4 rounded-xl border border-gray-800 space-y-2">
              <h3 class="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                <i class="fa-solid fa-car"></i> 2. Detalle del Vehículo
              </h3>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                <div class="col-span-2">
                  <span class="text-gray-400 block">Vehículo (Marca, Modelo, Año, Placa):</span>
                  <span id="valVehiculoNombre" class="font-bold text-gold-400 text-sm">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Nivel Combustible:</span>
                  <span id="valCombustible" class="font-semibold text-gray-200">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Kilometraje Inicial:</span>
                  <span id="valKmInicial" class="font-semibold text-gray-200">----</span>
                </div>
              </div>
            </div>

            <div class="bg-dark-900/80 p-4 rounded-xl border border-gray-800 space-y-2">
              <h3 class="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                <i class="fa-solid fa-calendar-days"></i> 3. Fechas y Logística
              </h3>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span class="text-gray-400 block">Fecha Inicio / Entrega:</span>
                  <span id="valFechaInicio" class="font-semibold text-gray-100">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Fecha Fin / Devolución:</span>
                  <span id="valFechaFin" class="font-semibold text-gray-100">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Días Totales de Renta:</span>
                  <span id="valDiasTotales" class="font-extrabold text-gold-400 text-sm">0 Días</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Margen Tolerancia:</span>
                  <span id="valTolerancia" class="font-semibold text-gray-200">1 Hora</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Lugar Entrega:</span>
                  <span id="valLugarEntrega" class="font-semibold text-gray-200">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Lugar Devolución:</span>
                  <span id="valLugarDevolucion" class="font-semibold text-gray-200">----</span>
                </div>
              </div>
            </div>

            <div class="bg-dark-900/80 p-4 rounded-xl border border-gray-800 space-y-2">
              <h3 class="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
                <i class="fa-solid fa-shield-halved"></i> 4. Cobertura y Políticas
              </h3>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span class="text-gray-400 block">Seguro Full Cobertura:</span>
                  <span id="valSeguroFullBadge" class="font-bold text-gray-200">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Depósito de Garantía:</span>
                  <span id="valDepositoGarantia" class="font-semibold text-gray-200">----</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Política Combustible:</span>
                  <span id="valPoliticaCombustible" class="font-semibold text-gray-200">Mismo nivel al retornar</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Conductor Adicional:</span>
                  <span id="valConductorAdicional" class="font-semibold text-gray-200">----</span>
                </div>
              </div>
            </div>

          </div>

          <div class="bg-dark-900/90 rounded-xl border border-gold-500/20 overflow-hidden shadow-inner">
            <div class="p-3 bg-dark-700/60 border-b border-gray-800 flex justify-between items-center">
              <h3 class="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-calculator"></i> 5. Desglose Estimado en Tiempo Real (<span id="valDesgloseDias">18 Días</span>)
              </h3>
              <span class="text-xs text-gray-400">Moneda: <strong id="valMoneda" class="text-white">USD ($)</strong></span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-gray-300">
                <thead class="bg-dark-800 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
                  <tr>
                    <th class="p-3">Concepto</th>
                    <th class="p-3">Tarifa / Detalle</th>
                    <th class="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800/80 font-medium">
                  <tr>
                    <td class="p-3 text-gray-200">Alquiler Base del Vehículo</td>
                    <td id="rowAlquilerTarifa" class="p-3 text-gray-400">$40.00 / día x 18 días</td>
                    <td id="rowAlquilerSubtotal" class="p-3 text-right font-semibold text-white">$720.00</td>
                  </tr>
                  <tr>
                    <td class="p-3 text-gray-200">Seguro Full Cobertura</td>
                    <td id="rowSeguroTarifa" class="p-3 text-gray-400">$20.00 / día x 18 días</td>
                    <td id="rowSeguroSubtotal" class="p-3 text-right font-semibold text-white">$360.00</td>
                  </tr>
                  <tr>
                    <td class="p-3 text-gray-200">Entrega / Movilización</td>
                    <td id="rowEntregaTarifa" class="p-3 text-gray-400">Cargo Único Logístico</td>
                    <td id="rowEntregaSubtotal" class="p-3 text-right font-semibold text-white">$100.00</td>
                  </tr>
                  <tr>
                    <td class="p-3 text-gray-200">Depósito de Garantía (Reembolsable)</td>
                    <td id="rowDepositoTarifa" class="p-3 text-gray-400">Garantía / Retención</td>
                    <td id="rowDepositoSubtotal" class="p-3 text-right font-semibold text-gray-400">$0.00</td>
                  </tr>
                </tbody>
                <tfoot class="bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 border-t-2 border-gold-500/40 text-white font-extrabold">
                  <tr>
                    <td colspan="2" class="p-3.5 text-right text-sm uppercase tracking-wider text-gold-400">TOTAL ESTIMADO A PAGAR:</td>
                    <td id="rowTotalEstimado" class="p-3.5 text-right text-base text-gold-400">$1,180.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div class="bg-dark-900/80 p-4 rounded-xl border border-gray-800 space-y-3">
            <h3 class="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
              <i class="fa-solid fa-clipboard-check"></i> 6. Información Relevante Adicional (Control Operativo)
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span class="text-gray-400 block">Estatus de Pago:</span>
                <span id="valEstatusPagoTexto" class="font-bold text-emerald-400">Pagado Completo</span>
              </div>
              <div>
                <span class="text-gray-400 block">Método de Pago:</span>
                <span id="valMetodoPago" class="font-semibold text-gray-200">Tarjeta de Crédito</span>
              </div>
              <div>
                <span class="text-gray-400 block">Registro Inspección Previa:</span>
                <span id="valInspeccionEstado" class="font-semibold text-emerald-400"><i class="fa-solid fa-check-circle"></i> Checklist Completo</span>
              </div>
            </div>

            <!-- Notes & Inspection Checklist -->
            <div class="bg-dark-800 p-3 rounded-lg border border-gray-800 text-xs space-y-1">
              <span class="text-gray-400 font-bold block">Notas / Observaciones de Daños Previos:</span>
              <p id="valNotasInspeccion" class="text-gray-300 italic">"Vehículo entregado limpio. Pequeño rayón preexistente en parachoques trasero derecho registrado en fotos."</p>
            </div>
          </div>

          <!-- Signatures for Printable Contract -->
          <div class="pt-6 border-t border-gray-800 grid grid-cols-2 gap-8 text-center text-xs text-gray-400">
            <div>
              <div class="border-b border-gray-600 mb-2 h-10"></div>
              <p class="font-bold text-gray-300">Firma del Cliente</p>
              <p id="valFirmaClienteDoc">Doc: ----</p>
            </div>
            <div>
              <div class="border-b border-gray-600 mb-2 h-10"></div>
              <p class="font-bold text-gray-300">Agente LuxeDrive</p>
              <p>Firma y Sello Autorizado</p>
            </div>
          </div>

        </div>
      </section>

    </main>

    <div id="reservationModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 overflow-y-auto">
      <div class="bg-dark-800 border border-gold-500/30 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
        
        <!-- Modal Header -->
        <div class="bg-dark-700 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 id="modalTitle" class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-pen-to-square text-gold-500"></i> Registrar / Editar Reserva
          </h3>
          <button onclick="closeModal()" class="text-gray-400 hover:text-white text-xl">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Form Body -->
        <form id="reservationForm" onsubmit="saveReservation(event)" class="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          
          <input type="hidden" id="formReservaId">

          <!-- Section 1 -->
          <div>
            <h4 class="font-extrabold text-gold-500 uppercase tracking-wider mb-3 border-b border-gray-700 pb-1">1. Cliente y Datos Generales</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Nombre Completo *</label>
                <input type="text" id="formCliente" required class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Teléfono / WhatsApp *</label>
                <input type="text" id="formTelefono" required class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Doc. Identidad / Licencia *</label>
                <input type="text" id="formDoc" required class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
            </div>
          </div>

          <!-- Section 2 -->
          <div>
            <h4 class="font-extrabold text-gold-500 uppercase tracking-wider mb-3 border-b border-gray-700 pb-1">2. Vehículo y Condición</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Vehículo (Marca/Modelo/Placa) *</label>
                <input type="text" id="formVehiculo" required placeholder="Ej: Kia Sportage 2020 (ABC-1234)" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Nivel de Combustible</label>
                <select id="formCombustible" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="Tanque Lleno (100%)">Tanque Lleno (100%)</option>
                  <option value="3/4 Tanque">3/4 Tanque</option>
                  <option value="1/2 Tanque">1/2 Tanque</option>
                  <option value="1/4 Tanque">1/4 Tanque</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Kilometraje Inicial</label>
                <input type="text" id="formKm" placeholder="Ej: 45,000 KM" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
            </div>
          </div>

          <!-- Section 3 -->
          <div>
            <h4 class="font-extrabold text-gold-500 uppercase tracking-wider mb-3 border-b border-gray-700 pb-1">3. Fechas y Logística</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Fecha Reserva</label>
                <input type="date" id="formFechaReserva" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Fecha Inicio Renta *</label>
                <input type="date" id="formFechaInicio" onchange="calculateDaysAndTotal()" required class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Fecha Fin Renta *</label>
                <input type="date" id="formFechaFin" onchange="calculateDaysAndTotal()" required class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Días Totales</label>
                <input type="number" id="formDias" readonly class="w-full bg-dark-700 border border-gray-600 rounded-lg p-2 text-gold-400 font-bold">
              </div>
              <div class="md:col-span-2">
                <label class="block text-gray-400 mb-1">Lugar de Entrega</label>
                <input type="text" id="formLugarEntrega" placeholder="Ej: Aeropuerto Internacional" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div class="md:col-span-2">
                <label class="block text-gray-400 mb-1">Lugar de Devolución</label>
                <input type="text" id="formLugarDevolucion" placeholder="Ej: Aeropuerto Internacional" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
            </div>
          </div>

          <!-- Section 4 -->
          <div>
            <h4 class="font-extrabold text-gold-500 uppercase tracking-wider mb-3 border-b border-gray-700 pb-1">4. Tarifas, Coberturas y Desglose</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Alquiler ($/Día) *</label>
                <input type="number" id="formTarifaAlquiler" oninput="calculateDaysAndTotal()" step="0.01" value="40" required class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">¿Aplica Seguro Full?</label>
                <select id="formAplicaSeguro" onchange="calculateDaysAndTotal()" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="SI">Sí (Con Seguro)</option>
                  <option value="NO">No (Sin Seguro)</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Seguro Full ($/Día)</label>
                <input type="number" id="formTarifaSeguro" oninput="calculateDaysAndTotal()" step="0.01" value="20" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Entrega / Movilización ($)</label>
                <input type="number" id="formCostoEntrega" oninput="calculateDaysAndTotal()" step="0.01" value="100" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Depósito Garantía ($)</label>
                <input type="number" id="formDeposito" step="0.01" value="0" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Moneda</label>
                <select id="formMoneda" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MXN">MXN ($)</option>
                  <option value="DOP">DOP ($)</option>
                </select>
              </div>
              <div class="md:col-span-2 bg-dark-900/90 p-3 rounded-lg border border-gold-500/30 flex justify-between items-center">
                <span class="text-xs text-gray-300 font-bold">TOTAL ESTIMADO CALCULADO:</span>
                <span id="formCalculatedTotal" class="text-base font-extrabold text-gold-400">$1,180.00</span>
              </div>
            </div>
          </div>

          <!-- Section 5 -->
          <div>
            <h4 class="font-extrabold text-gold-500 uppercase tracking-wider mb-3 border-b border-gray-700 pb-1">5. Operaciones e Inspección</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Estatus de Pago</label>
                <select id="formEstatusPago" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="Pagado Completo">Pagado Completo</option>
                  <option value="Depósito Parcial">Depósito Parcial</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Método de Pago</label>
                <select id="formMetodoPago" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Apple Pay / PayPal">Apple Pay / PayPal</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Conductor Adicional</label>
                <input type="text" id="formConductorAdicional" placeholder="Nombre o 'No Aplica'" class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500">
              </div>
              <div class="md:col-span-3">
                <label class="block text-gray-400 mb-1">Notas / Checklist de Inspección Previa</label>
                <textarea id="formNotasInspeccion" rows="2" placeholder="Detalles de estado del vehículo, rayones previos, etc." class="w-full bg-dark-900 border border-gray-700 rounded-lg p-2 text-white focus:border-gold-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="pt-4 border-t border-gray-700 flex justify-end space-x-3">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-semibold">
              Cancelar
            </button>
            <button type="submit" class="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-bold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/20">
              Guardar Reserva
            </button>
          </div>

        </form>

      </div>
    </div>

    <script>
      // Initial Sample Data Store
      let reservations = [
        {
          id: 'RES-1001',
          fechaReserva: '2026-09-20',
          cliente: 'Carlos Mendoza',
          telefono: '+1 (809) 555-0192',
          docIdentidad: 'PAS-98234123',
          vehiculo: 'Kia Sportage 2020 (Placa: ABC-1234)',
          combustible: 'Tanque Lleno (100%)',
          kmInicial: '45,200 KM',
          fechaInicio: '2026-10-01',
          fechaFin: '2026-10-19',
          dias: 18,
          lugarEntrega: 'Aeropuerto Internacional SDQ',
          lugarDevolucion: 'Aeropuerto Internacional SDQ',
          seguroFull: 'SI',
          tarifaAlquiler: 40,
          tarifaSeguro: 20,
          costoEntrega: 100,
          deposito: 0,
          moneda: 'USD',
          estatusPago: 'Pagado Completo',
          metodoPago: 'Tarjeta de Crédito',
          conductorAdicional: 'María Mendoza',
          tolerancia: '1 Hora',
          politicaCombustible: 'Mismo nivel al retornar',
          notasInspeccion: 'Vehículo entregado limpio. Pequeño rayón preexistente en parachoques trasero derecho registrado en photos.'
        },
        {
          id: 'RES-1002',
          fechaReserva: '2026-09-21',
          cliente: 'Sofía Rodríguez',
          telefono: '+1 (829) 444-9911',
          docIdentidad: 'CED-001-1827364-2',
          vehiculo: 'Toyota RAV4 2023 (Placa: GHI-9012)',
          combustible: '3/4 Tanque',
          kmInicial: '12,500 KM',
          fechaInicio: '2026-10-05',
          fechaFin: '2026-10-10',
          dias: 5,
          lugarEntrega: 'Oficina Central / Hotel',
          lugarDevolucion: 'Oficina Central',
          seguroFull: 'SI',
          tarifaAlquiler: 55,
          tarifaSeguro: 25,
          costoEntrega: 50,
          deposito: 200,
          moneda: 'USD',
          estatusPago: 'Depósito Parcial',
          metodoPago: 'Transferencia Bancaria',
          conductorAdicional: 'No Aplica',
          tolerancia: '1 Hora',
          politicaCombustible: 'Mismo nivel al retornar',
          notasInspeccion: 'Sin daños visibles. Llantas en excelente estado.'
        },
        {
          id: 'RES-1003',
          fechaReserva: '2026-09-21',
          cliente: 'Alexander Wright',
          telefono: '+1 (305) 777-8822',
          docIdentidad: 'PAS-US771822',
          vehiculo: 'BMW X5 Luxury 2022 (Placa: LUX-777)',
          combustible: 'Tanque Lleno (100%)',
          kmInicial: '28,000 KM',
          fechaInicio: '2026-11-01',
          fechaFin: '2026-11-08',
          dias: 7,
          lugarEntrega: 'Terminal VIP Aeropuerto',
          lugarDevolucion: 'Terminal VIP Aeropuerto',
          seguroFull: 'NO',
          tarifaAlquiler: 120,
          tarifaSeguro: 0,
          costoEntrega: 150,
          deposito: 500,
          moneda: 'USD',
          estatusPago: 'Pendiente',
          metodoPago: 'Apple Pay / PayPal',
          conductorAdicional: 'John Doe',
          tolerancia: '1 Hora',
          politicaCombustible: 'Mismo nivel al retornar',
          notasInspeccion: 'Inspección técnica al día. Se entrega recién pulido.'
        }
      ];

      let selectedReservationId = 'RES-1001';

      window.onload = function() {
        renderReservationsList();
        loadReservationDetails(selectedReservationId);
      };

      function renderReservationsList(data = reservations) {
        const listContainer = document.getElementById('reservationsList');
        document.getElementById('reservationCount').innerText = data.length;

        if (data.length === 0) {
          listContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500 text-xs">
              <i class="fa-solid fa-folder-open text-2xl mb-2 block"></i>
              No se encontraron reservas
            </div>`;
          return;
        }

        listContainer.innerHTML = data.map(res => {
          const isSelected = res.id === selectedReservationId;
          const totalCalculated = calculateTotalAmount(res);
          
          let statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          if (res.estatusPago === 'Depósito Parcial') statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          if (res.estatusPago === 'Pendiente') statusBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

          return `
            <div onclick="selectReservation('${res.id}')" 
              class="p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-gradient-to-r from-gold-500/10 via-dark-700 to-dark-700 border-gold-500/60 shadow-lg' 
                  : 'bg-dark-900/50 hover:bg-dark-700/50 border-gray-800'
              }">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-xs text-white">${res.cliente}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${statusBadgeClass}">
                  ${res.estatusPago}
                </span>
              </div>
              <div class="text-[11px] text-gold-400 font-semibold mb-1 truncate">
                <i class="fa-solid fa-car text-xs mr-1"></i>${res.vehiculo}
              </div>
              <div class="flex justify-between items-center text-[10px] text-gray-400">
                <span><i class="fa-regular fa-calendar mr-1"></i>${res.dias} Días (${res.fechaInicio})</span>
                <span class="font-bold text-white text-xs">${getCurrencySymbol(res.moneda)}${totalCalculated.toFixed(2)}</span>
              </div>
            </div>
          `;
        }).join('');
      }

      function selectReservation(id) {
        selectedReservationId = id;
        renderReservationsList();
        loadReservationDetails(id);
      }

      function loadReservationDetails(id) {
        const res = reservations.find(r => r.id === id);
        if (!res) return;

        // Banner Badges
        document.getElementById('badgeReservaID').innerText = res.id;
        document.getElementById('badgeFechaCreacion').innerText = `Creada: ${res.fechaReserva || 'N/A'}`;

        // Section 1: Client
        document.getElementById('valFechaReserva').innerText = res.fechaReserva || 'N/A';
        document.getElementById('valClienteNombre').innerText = res.cliente;
        document.getElementById('valClienteTelefono').innerText = res.telefono;
        document.getElementById('valClienteDoc').innerText = res.docIdentidad;
        document.getElementById('valFirmaClienteDoc').innerText = `Doc: ${res.docIdentidad}`;

        // Section 2: Vehicle
        document.getElementById('valVehiculoNombre').innerText = res.vehiculo;
        document.getElementById('valCombustible').innerText = res.combustible;
        document.getElementById('valKmInicial').innerText = res.kmInicial;

        // Section 3: Logistics
        document.getElementById('valFechaInicio').innerText = res.fechaInicio;
        document.getElementById('valFechaFin').innerText = res.fechaFin;
        document.getElementById('valDiasTotales').innerText = `${res.dias} Días`;
        document.getElementById('valTolerancia').innerText = res.tolerancia || '1 Hora';
        document.getElementById('valLugarEntrega').innerText = res.lugarEntrega;
        document.getElementById('valLugarDevolucion').innerText = res.lugarDevolucion;

        // Section 4: Coverage
        const seguroBadge = res.seguroFull === 'SI' 
          ? `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-shield-check"></i> SÍ (Incluido)</span>`
          : `<span class="text-gray-400">NO (Sin Cobertura)</span>`;
        document.getElementById('valSeguroFullBadge').innerHTML = seguroBadge;
        document.getElementById('valDepositoGarantia').innerText = `${getCurrencySymbol(res.moneda)}${res.deposito} ${res.deposito > 0 ? '(Retención)' : '(No aplica)'}`;
        document.getElementById('valPoliticaCombustible').innerText = res.politicaCombustible || 'Mismo nivel al retornar';
        document.getElementById('valConductorAdicional').innerText = res.conductorAdicional || 'No Registrado';

        // Section 5: Financial Breakdown
        const curr = getCurrencySymbol(res.moneda);
        document.getElementById('valDesgloseDias').innerText = `${res.dias} Días`;
        document.getElementById('valMoneda').innerText = `${res.moneda} (${curr})`;

        const alquilerSub = res.tarifaAlquiler * res.dias;
        document.getElementById('rowAlquilerTarifa').innerText = `${curr}${res.tarifaAlquiler.toFixed(2)} / día x ${res.dias} días`;
        document.getElementById('rowAlquilerSubtotal').innerText = `${curr}${alquilerSub.toFixed(2)}`;

        const seguroSub = (res.seguroFull === 'SI') ? (res.tarifaSeguro * res.dias) : 0;
        document.getElementById('rowSeguroTarifa').innerText = (res.seguroFull === 'SI') 
          ? `${curr}${res.tarifaSeguro.toFixed(2)} / día x ${res.dias} días` 
          : 'No contratado';
        document.getElementById('rowSeguroSubtotal').innerText = `${curr}${seguroSub.toFixed(2)}`;

        document.getElementById('rowEntregaTarifa').innerText = res.costoEntrega > 0 ? 'Cargo Único Logístico' : 'Sin costo adicional';
        document.getElementById('rowEntregaSubtotal').innerText = `${curr}${res.costoEntrega.toFixed(2)}`;

        document.getElementById('rowDepositoTarifa').innerText = res.deposito > 0 ? 'Monto Reembolsable' : 'No requiere depósito';
        document.getElementById('rowDepositoSubtotal').innerText = `${curr}${res.deposito.toFixed(2)}`;

        const totalFinal = calculateTotalAmount(res);
        document.getElementById('rowTotalEstimado').innerText = `${curr}${totalFinal.toFixed(2)}`;

        // Section 6: Operational
        document.getElementById('valEstatusPagoTexto').innerText = res.estatusPago;
        document.getElementById('valMetodoPago').innerText = res.metodoPago;
        document.getElementById('valNotasInspeccion').innerText = res.notasInspeccion ? `"${res.notasInspeccion}"` : '"Sin observaciones registradas."';

        // Payment status badge top
        const estatusContainer = document.getElementById('displayEstatusPago');
        estatusContainer.innerText = res.estatusPago;
        if(res.estatusPago === 'Pagado Completo') {
          estatusContainer.className = "px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
        } else if(res.estatusPago === 'Depósito Parcial') {
          estatusContainer.className = "px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30";
        } else {
          estatusContainer.className = "px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30";
        }
      }

      function calculateTotalAmount(res) {
        const alquiler = (parseFloat(res.tarifaAlquiler) || 0) * (parseInt(res.dias) || 0);
        const seguro = (res.seguroFull === 'SI') ? ((parseFloat(res.tarifaSeguro) || 0) * (parseInt(res.dias) || 0)) : 0;
        const entrega = parseFloat(res.costoEntrega) || 0;
        return alquiler + seguro + entrega;
      }

      function getCurrencySymbol(curr) {
        switch(curr) {
          case 'EUR': return '€';
          case 'MXN': return '$';
          case 'DOP': return 'RD$';
          default: return '$';
        }
      }

      function filterReservations() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const status = document.getElementById('statusFilter').value;

        const filtered = reservations.filter(r => {
          const matchQuery = r.cliente.toLowerCase().includes(query) || 
                             r.vehiculo.toLowerCase().includes(query) || 
                             r.docIdentidad.toLowerCase().includes(query) ||
                             r.id.toLowerCase().includes(query);
          const matchStatus = (status === 'ALL') || (r.estatusPago === status);
          return matchQuery && matchStatus;
        });

        renderReservationsList(filtered);
      }

      function openModalNew() {
        document.getElementById('modalTitle').innerHTML = `<i class="fa-solid fa-circle-plus text-gold-500"></i> Nueva Reserva`;
        document.getElementById('reservationForm').reset();
        document.getElementById('formReservaId').value = '';
        
        // Defaults
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('formFechaReserva').value = today;
        document.getElementById('formFechaInicio').value = today;
        
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        document.getElementById('formFechaFin').value = nextWeek.toISOString().split('T')[0];

        calculateDaysAndTotal();
        document.getElementById('reservationModal').classList.remove('hidden');
      }

      function editCurrentReservation() {
        const res = reservations.find(r => r.id === selectedReservationId);
        if (!res) return;

        document.getElementById('modalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square text-gold-500"></i> Editar Reserva ${res.id}`;
        document.getElementById('formReservaId').value = res.id;

        document.getElementById('formCliente').value = res.cliente;
        document.getElementById('formTelefono').value = res.telefono;
        document.getElementById('formDoc').value = res.docIdentidad;
        document.getElementById('formVehiculo').value = res.vehiculo;
        document.getElementById('formCombustible').value = res.combustible;
        document.getElementById('formKm').value = res.kmInicial;

        document.getElementById('formFechaReserva').value = res.fechaReserva;
        document.getElementById('formFechaInicio').value = res.fechaInicio;
        document.getElementById('formFechaFin').value = res.fechaFin;
        document.getElementById('formLugarEntrega').value = res.lugarEntrega;
        document.getElementById('formLugarDevolucion').value = res.lugarDevolucion;

        document.getElementById('formTarifaAlquiler').value = res.tarifaAlquiler;
        document.getElementById('formAplicaSeguro').value = res.seguroFull;
        document.getElementById('formTarifaSeguro').value = res.tarifaSeguro;
        document.getElementById('formCostoEntrega').value = res.costoEntrega;
        document.getElementById('formDeposito').value = res.deposito;
        document.getElementById('formMoneda').value = res.moneda;

        document.getElementById('formEstatusPago').value = res.estatusPago;
        document.getElementById('formMetodoPago').value = res.metodoPago;
        document.getElementById('formConductorAdicional').value = res.conductorAdicional;
        document.getElementById('formNotasInspeccion').value = res.notasInspeccion;

        calculateDaysAndTotal();
        document.getElementById('reservationModal').classList.remove('hidden');
      }

      function closeModal() {
        document.getElementById('reservationModal').classList.add('hidden');
      }

      function calculateDaysAndTotal() {
        const inicio = new Date(document.getElementById('formFechaInicio').value);
        const fin = new Date(document.getElementById('formFechaFin').value);

        let dias = 1;
        if (inicio && fin && fin >= inicio) {
          const diffTime = Math.abs(fin - inicio);
          dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (dias === 0) dias = 1; // Minimum 1 day
        }
        document.getElementById('formDias').value = dias;

        const alquiler = (parseFloat(document.getElementById('formTarifaAlquiler').value) || 0) * dias;
        const aplicaSeguro = document.getElementById('formAplicaSeguro').value === 'SI';
        const seguro = aplicaSeguro ? ((parseFloat(document.getElementById('formTarifaSeguro').value) || 0) * dias) : 0;
        const entrega = parseFloat(document.getElementById('formCostoEntrega').value) || 0;

        const total = alquiler + seguro + entrega;
        const curr = getCurrencySymbol(document.getElementById('formMoneda').value);
        document.getElementById('formCalculatedTotal').innerText = `${curr}${total.toFixed(2)}`;
      }

      function saveReservation(event) {
        event.preventDefault();

        const idExistente = document.getElementById('formReservaId').value;
        const id = idExistente || `RES-${1000 + reservations.length + 1}`;

        const newRes = {
          id: id,
          fechaReserva: document.getElementById('formFechaReserva').value,
          cliente: document.getElementById('formCliente').value,
          telefono: document.getElementById('formTelefono').value,
          docIdentidad: document.getElementById('formDoc').value,
          vehiculo: document.getElementById('formVehiculo').value,
          combustible: document.getElementById('formCombustible').value,
          kmInicial: document.getElementById('formKm').value || 'N/A',
          fechaInicio: document.getElementById('formFechaInicio').value,
          fechaFin: document.getElementById('formFechaFin').value,
          dias: parseInt(document.getElementById('formDias').value) || 1,
          lugarEntrega: document.getElementById('formLugarEntrega').value || 'Oficina',
          lugarDevolucion: document.getElementById('formLugarDevolucion').value || 'Oficina',
          seguroFull: document.getElementById('formAplicaSeguro').value,
          tarifaAlquiler: parseFloat(document.getElementById('formTarifaAlquiler').value) || 0,
          tarifaSeguro: parseFloat(document.getElementById('formTarifaSeguro').value) || 0,
          costoEntrega: parseFloat(document.getElementById('formCostoEntrega').value) || 0,
          deposito: parseFloat(document.getElementById('formDeposito').value) || 0,
          moneda: document.getElementById('formMoneda').value,
          estatusPago: document.getElementById('formEstatusPago').value,
          metodoPago: document.getElementById('formMetodoPago').value,
          conductorAdicional: document.getElementById('formConductorAdicional').value || 'No Aplica',
          tolerancia: '1 Hora',
          politicaCombustible: 'Mismo nivel al retornar',
          notasInspeccion: document.getElementById('formNotasInspeccion').value
        };

        if (idExistente) {
          const index = reservations.findIndex(r => r.id === idExistente);
          if (index !== -1) reservations[index] = newRes;
        } else {
          reservations.unshift(newRes);
        }

        selectedReservationId = id;
        closeModal();
        renderReservationsList();
        loadReservationDetails(id);
      }

      function deleteCurrentReservation() {
        if (!selectedReservationId) return;
        if (confirm(`¿Estás seguro de eliminar la reserva ${selectedReservationId}?`)) {
          reservations = reservations.filter(r => r.id !== selectedReservationId);
          if (reservations.length > 0) {
            selectedReservationId = reservations[0].id;
          } else {
            selectedReservationId = null;
          }
          renderReservationsList();
          if (selectedReservationId) loadReservationDetails(selectedReservationId);
        }
      }

      function exportWhatsApp() {
        const res = reservations.find(r => r.id === selectedReservationId);
        if (!res) return;

        const curr = getCurrencySymbol(res.moneda);
        const total = calculateTotalAmount(res);

        const text = `*CONFIRMACIÓN DE RESERVA - LUXEDRIVE*%0A%0A` +
          `📌 *Reserva:* ${res.id}%0A` +
          `👤 *Cliente:* ${res.cliente}%0A` +
          `📄 *Doc:* ${res.docIdentidad}%0A` +
          `🚗 *Vehículo:* ${res.vehiculo}%0A` +
          `📅 *Fechas:* ${res.fechaInicio} al ${res.fechaFin} (${res.dias} Días)%0A` +
          `📍 *Entrega:* ${res.lugarEntrega}%0A` +
          `🛡️ *Seguro Full:* ${res.seguroFull === 'SI' ? 'Sí Incluido' : 'No'}%0A%0A` +
          `💵 *DESGLOSE ESTIMADO:*%0A` +
          `• Alquiler Base: ${curr}${(res.tarifaAlquiler * res.dias).toFixed(2)} (${curr}${res.tarifaAlquiler}/día)%0A` +
          `• Seguro Full: ${curr}${((res.seguroFull === 'SI' ? res.tarifaSeguro : 0) * res.dias).toFixed(2)}%0A` +
          `• Entrega: ${curr}${res.costoEntrega.toFixed(2)}%0A` +
          `💰 *TOTAL ESTIMADO:* ${curr}${total.toFixed(2)} (${res.moneda})%0A%0A` +
          `💳 *Estatus Pago:* ${res.estatusPago}%0A` +
          `¡Gracias por preferir LuxeDrive!`;

        const phone = res.telefono.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      }
    </script>
</body>
</html>
