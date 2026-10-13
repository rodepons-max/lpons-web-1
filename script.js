/* ==========================================================================
   LPONS ESTRUCTURAS METÁLICAS - INTERACTIVE SCRIPT (2026)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Components
  initNavbar();
  initCalculators();
  initServicesTabs();
  initPortfolioModal();
  initSmoothScroll();
});

/* Navbar Scroll Effect & Mobile Menu */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileBtn.querySelector('i').classList.toggle('fa-bars');
      mobileBtn.querySelector('i').classList.toggle('fa-xmark');
    });
  }
}

/* ==========================================================================
   INTERACTIVE CALCULATORS ENGINE
   ========================================================================== */
function initCalculators() {
  const calcTabs = document.querySelectorAll('.calc-type-btn');
  const calcFormGalpon = document.getElementById('calc-form-galpon');
  const calcFormCaldereria = document.getElementById('calc-form-caldereria');
  const calcFormMenor = document.getElementById('calc-form-menor');

  // Tab Switcher
  calcTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      calcTabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-calc');
      calcFormGalpon.style.display = target === 'galpon' ? 'grid' : 'none';
      calcFormCaldereria.style.display = target === 'caldereria' ? 'grid' : 'none';
      calcFormMenor.style.display = target === 'menor' ? 'grid' : 'none';

      // Recalculate
      if (target === 'galpon') calculateGalpon();
      if (target === 'caldereria') calculateCaldereria();
      if (target === 'menor') calculateMenor();
    });
  });

  // Inputs Listeners for Galpón / Montaje Semi-Pesado
  const inputAncho = document.getElementById('range-ancho');
  const inputLargo = document.getElementById('range-largo');
  const inputAlto = document.getElementById('range-alto');
  const selectUso = document.getElementById('select-uso');

  if (inputAncho && inputLargo && inputAlto) {
    [inputAncho, inputLargo, inputAlto, selectUso].forEach(el => {
      el.addEventListener('input', calculateGalpon);
    });
  }

  // Inputs Listeners for Calderería / Estanques
  const inputDiametro = document.getElementById('range-diametro');
  const inputAlturaTanque = document.getElementById('range-altura-tanque');
  const selectMaterial = document.getElementById('select-material');

  if (inputDiametro && inputAlturaTanque) {
    [inputDiametro, inputAlturaTanque, selectMaterial].forEach(el => {
      el.addEventListener('input', calculateCaldereria);
    });
  }

  // Inputs Listeners for Construcción Menor & Entrepisos
  const inputSuperficieMenor = document.getElementById('range-superficie-menor');
  const selectTipoObra = document.getElementById('select-tipo-obra');

  if (inputSuperficieMenor) {
    [inputSuperficieMenor, selectTipoObra].forEach(el => {
      el.addEventListener('input', calculateMenor);
    });
  }

  // Initial Calculation Trigger
  calculateGalpon();
}

/* 1. Calculation: Galpón / Nave Industrial (Montaje Semi-Pesado) */
function calculateGalpon() {
  const ancho = parseFloat(document.getElementById('range-ancho').value);
  const largo = parseFloat(document.getElementById('range-largo').value);
  const alto = parseFloat(document.getElementById('range-alto').value);
  const usoFactor = parseFloat(document.getElementById('select-uso').value);

  // Update Badge Display Values
  document.getElementById('val-ancho').textContent = `${ancho} m`;
  document.getElementById('val-largo').textContent = `${largo} m`;
  document.getElementById('val-alto').textContent = `${alto} m`;

  // Calculations
  const superficie = ancho * largo; // m²
  const pesoEstimadoTon = ((superficie * (28 + (alto * 1.5))) / 1000) * usoFactor; // Toneladas
  const diasMontaje = Math.ceil(5 + (pesoEstimadoTon * 1.2)); // Días de obra en terreno
  
  // Cost Range (CLP per Ton approx $1.8M - $2.4M CLP + Montaje)
  const costoEstimadoMin = Math.round(pesoEstimadoTon * 1950000);
  const costoEstimadoMax = Math.round(pesoEstimadoTon * 2450000);

  // Update Results UI
  document.getElementById('res-superficie').textContent = `${superficie.toLocaleString('es-CL')} m²`;
  document.getElementById('res-peso').textContent = `${pesoEstimadoTon.toFixed(1)} Toneladas`;
  document.getElementById('res-dias').textContent = `${diasMontaje} Días Hábles`;
  document.getElementById('res-costo').textContent = `$${formatCLP(costoEstimadoMin)} - $${formatCLP(costoEstimadoMax)}`;

  // Update WhatsApp Quote Link
  const btnWsp = document.getElementById('btn-quote-galpon');
  if (btnWsp) {
    const textMsg = encodeURIComponent(
      `Hola LPONS, me gustaría solicitar una cotización formal para un Galpón/Nave:\n` +
      `- Dimensiones: ${ancho}m ancho x ${largo}m largo x ${alto}m alto (${superficie} m²)\n` +
      `- Peso Estimado: ${pesoEstimadoTon.toFixed(1)} Toneladas\n` +
      `- Estimación web: $${formatCLP(costoEstimadoMin)} - $${formatCLP(costoEstimadoMax)} CLP`
    );
    btnWsp.href = `https://wa.me/56977581407?text=${textMsg}`;
  }
}

/* 2. Calculation: Calderería & Estanques (Acero Inoxidable / Carbono) */
function calculateCaldereria() {
  const diametro = parseFloat(document.getElementById('range-diametro').value);
  const altura = parseFloat(document.getElementById('range-altura-tanque').value);
  const matFactor = parseFloat(document.getElementById('select-material').value);

  document.getElementById('val-diametro').textContent = `${diametro} m`;
  document.getElementById('val-altura-tanque').textContent = `${altura} m`;

  // Volume of Cylinder V = π * r² * h (m³) -> Litros = m³ * 1000
  const radio = diametro / 2;
  const volumenM3 = Math.PI * Math.pow(radio, 2) * altura;
  const capacidadLitros = Math.round(volumenM3 * 1000);

  // Steel Weight calculation based on thickness recommendation
  const espesorPlanchaMM = diametro > 4 ? 8 : (diametro > 2.5 ? 6 : 4);
  const superficiePlanchas = (2 * Math.PI * radio * altura) + (2 * Math.PI * Math.pow(radio, 2));
  const pesoKg = superficiePlanchas * (espesorPlanchaMM / 1000) * 7850 * (matFactor > 1.2 ? 1.05 : 1);
  const pesoTon = pesoKg / 1000;

  const costoMin = Math.round(pesoKg * (matFactor > 1.2 ? 6500 : 3200));
  const costoMax = Math.round(costoMin * 1.25);

  document.getElementById('res-capacidad').textContent = `${capacidadLitros.toLocaleString('es-CL')} Lts (${volumenM3.toFixed(1)} m³)`;
  document.getElementById('res-espesor').textContent = `${espesorPlanchaMM} mm (${selectMaterialText()})`;
  document.getElementById('res-peso-tanque').textContent = `${pesoTon.toFixed(2)} Toneladas`;
  document.getElementById('res-costo-tanque').textContent = `$${formatCLP(costoMin)} - $${formatCLP(costoMax)}`;

  const btnWsp = document.getElementById('btn-quote-caldereria');
  if (btnWsp) {
    const textMsg = encodeURIComponent(
      `Hola LPONS, solicito cotización de Calderería/Estanque:\n` +
      `- Diámetro: ${diametro}m x Altura: ${altura}m\n` +
      `- Capacidad: ${capacidadLitros.toLocaleString('es-CL')} Lts\n` +
      `- Espesor: ${espesorPlanchaMM}mm (${selectMaterialText()})\n` +
      `- Estimación web: $${formatCLP(costoMin)} CLP`
    );
    btnWsp.href = `https://wa.me/56977581407?text=${textMsg}`;
  }
}

function selectMaterialText() {
  const sel = document.getElementById('select-material');
  return sel.options[sel.selectedIndex].text;
}

/* 3. Calculation: Construcción Menor & Entrepisos */
function calculateMenor() {
  const superficie = parseFloat(document.getElementById('range-superficie-menor').value);
  const factorObra = parseFloat(document.getElementById('select-tipo-obra').value);

  document.getElementById('val-superficie-menor').textContent = `${superficie} m²`;

  const pesoKg = superficie * 35 * factorObra;
  const diasEjecucion = Math.ceil(superficie / 15);
  const costoMin = Math.round(superficie * 65000 * factorObra);
  const costoMax = Math.round(costoMin * 1.3);

  document.getElementById('res-peso-menor').textContent = `${(pesoKg / 1000).toFixed(2)} Toneladas`;
  document.getElementById('res-dias-menor').textContent = `${diasEjecucion} Días`;
  document.getElementById('res-costo-menor').textContent = `$${formatCLP(costoMin)} - $${formatCLP(costoMax)}`;

  const btnWsp = document.getElementById('btn-quote-menor');
  if (btnWsp) {
    const textMsg = encodeURIComponent(
      `Hola LPONS, cotización Construcción Menor/Carpintería:\n` +
      `- Superficie / Área: ${superficie} m²\n` +
      `- Tipo de Trabajo: ${document.getElementById('select-tipo-obra').options[document.getElementById('select-tipo-obra').selectedIndex].text}\n` +
      `- Estimación web: $${formatCLP(costoMin)} - $${formatCLP(costoMax)} CLP`
    );
    btnWsp.href = `https://wa.me/56977581407?text=${textMsg}`;
  }
}

/* Helper: Chilean Pesos Formatter */
function formatCLP(value) {
  return new Intl.NumberFormat('es-CL').format(value);
}

/* Services Tabs Switcher */
function initServicesTabs() {
  const tabs = document.querySelectorAll('.services-tabs-nav .tab-btn');
  const cards = document.querySelectorAll('.service-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* Modal Dialog for Projects Details */
function initPortfolioModal() {
  const modal = document.getElementById('project-modal');
  const modalClose = document.querySelector('.modal-close');
  const projectCards = document.querySelectorAll('.project-card');

  const projectsData = {
    'biobio': {
      title: 'Montaje Estructura Estereométrica - Cementos Bío Bío',
      location: 'Teno, Región del Maule',
      desc: 'Montaje de gran envergadura espacial sin pilares intermedios para la molienda de áridos. Estructura reticulada tridimensional de alta precisión técnica.',
      img: './IMG/7.png'
    },
    'hangar': {
      title: 'Fabricación y Montaje de Hangar Aeropuerto Carriel Sur',
      location: 'Concepción, Región del Biobío',
      desc: 'Hangar de aviación comercial fabricado con vigas de alma llena y celosías de gran luz resistentes a vientos costeros de alta velocidad.',
      img: './IMG/4.png'
    },
    'estanque': {
      title: 'Estanque Industrial Planta de Levaduras Golondrina',
      location: 'Quilicura, Santiago',
      desc: 'Calderería pesada y estanque cilindrico en acero con soldaduras inspeccionadas por ensayos no destructivos para la industria de alimentos.',
      img: './IMG/2.png'
    },
    'palacio': {
      title: 'Refuerzo Estructural & Entrepiso Palacio Riesco',
      location: 'Huechuraba, Santiago',
      desc: 'Intervención en edificio patrimonial mediante entramado de vigas dobles T e inserción de losas colaborantes para aumentar la capacidad de carga.',
      img: './IMG/3.png'
    }
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const pKey = card.getAttribute('data-project');
      const pData = projectsData[pKey];

      if (pData && modal) {
        document.getElementById('modal-img').src = pData.img;
        document.getElementById('modal-title').textContent = pData.title;
        document.getElementById('modal-location').textContent = pData.location;
        document.getElementById('modal-desc').textContent = pData.desc;
        modal.classList.add('active');
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

/* Smooth Scroll Links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
