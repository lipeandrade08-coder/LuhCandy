document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');

    // =========================================================
    // NAVBAR SCROLL — com requestAnimationFrame throttle
    // Evita jank por execução excessiva do handler de scroll
    // =========================================================
    let lastScrollY = 0;
    let rafPending = false;

    function updateNavbar() {
        if (lastScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        rafPending = false;
    }

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(updateNavbar);
        }
    }, { passive: true });

    // =========================================================
    // INTERSECTION OBSERVER — animações no scroll
    // Usa threshold baixo para disparar antes do elemento entrar,
    // garantindo que a animação já esteja visível ao rolar.
    // =========================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Pausar animações inicialmente para elementos fora da viewport
    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => {
        if (!el.closest('.hero')) {
            el.style.animationPlayState = 'paused';
            el.style.opacity = '0';
            observer.observe(el);
        }
    });

    // =========================================================
    // SLIDESHOW — com lazy loading WebP e Page Visibility API
    // As imagens são carregadas via data-src apenas quando
    // a slide fica ativa, economizando banda na carga inicial.
    // =========================================================
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideshowInterval = null;
        let isVisible = true;

        const dotsContainer = document.getElementById('slideshow-dots');
        const prevBtn = document.getElementById('slide-prev');
        const nextBtn = document.getElementById('slide-next');

        // ---- Lazy-load de imagem via data-src / data-srcset ----
        function loadSlideImage(slide) {
            const img = slide.querySelector('img[data-src]');
            const source = slide.querySelector('source[data-srcset]');
            if (img && img.dataset.src) {
                if (source && source.dataset.srcset) {
                    source.srcset = source.dataset.srcset;
                    delete source.dataset.srcset;
                }
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
        }

        // Carregar a primeira slide imediatamente
        loadSlideImage(slides[0]);

        // Criar dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Foto ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.slideshow-dot');

        function goToSlide(index) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            // Lazy-load da slide atual e da próxima (pre-fetch)
            loadSlideImage(slides[currentSlide]);
            const nextIdx = (currentSlide + 1) % slides.length;
            loadSlideImage(slides[nextIdx]);
        }

        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }

        function startInterval() {
            if (slideshowInterval) return;
            slideshowInterval = setInterval(() => {
                if (isVisible) nextSlide();
            }, 4000);
        }

        function stopInterval() {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
        }

        function resetInterval() {
            stopInterval();
            startInterval();
        }

        // Page Visibility API — pausa quando aba não está visível
        // Economiza CPU, bateria e evita slides "acumulados"
        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
            if (isVisible) {
                startInterval();
            } else {
                stopInterval();
            }
        });

        nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
        prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

        startInterval();
    }

    // =========================================================
    // CALENDÁRIO DINÂMICO
    // =========================================================
    const calendarGrid = document.getElementById('calendar-grid');
    if (calendarGrid) {
        let currentMonth = 7; // Agosto (0-indexed)
        const currentYear = 2026;

        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        // Eventos (mês 0-indexed)
        const allEvents = {
            7: { // Agosto
                5:  { title: 'Casamento ao Ar Livre', desc: 'Mesa de doces finos e bolo cenográfico. (Data Indisponível)', link: null },
                8:  { title: 'Chá Revelação', desc: 'Evento íntimo com doces temáticos e delicados. (Data Indisponível)', link: null },
                12: { title: 'Aniversário de 15 Anos', desc: 'Buffet completo e carrinho de guloseimas. (Data Indisponível)', link: null },
                15: { title: 'Brunch de Degustação - Noivas', desc: 'Uma manhã especial para conhecer nosso cardápio de casamentos. (Últimas Vagas!)', link: 'https://wa.me/5512992538126?text=Olá,%20quero%20reservar%20minha%20vaga%20para%20a%20degustação%20do%20dia%2015!' },
                22: { title: 'Evento Corporativo Exclusivo', desc: 'Atendimento fechado para confraternização empresarial. (Data Indisponível)', link: null },
                25: { title: 'Bodas de Prata', desc: 'Comemoração de 25 anos de casados com menu super premium. (Data Indisponível)', link: null },
                30: { title: 'Agenda de Setembro Aberta', desc: 'Datas disponíveis para o próximo mês. Consulte-nos para reservar o seu evento.', link: 'https://wa.me/5512992538126?text=Olá,%20gostaria%20de%20verificar%20uma%20data%20em%20Setembro!' }
            }
        };

        const panel     = document.getElementById('event-details-panel');
        const panelTitle = document.getElementById('event-title');
        const panelDesc  = document.getElementById('event-desc');
        const panelLink  = document.getElementById('event-link');
        const calMonthYear = document.getElementById('cal-month-year');
        let activeCell = null;

        function renderCalendar(month, year) {
            calendarGrid.innerHTML = '';
            panel.classList.add('hidden');
            activeCell = null;

            calMonthYear.textContent = `${monthNames[month]} ${year}`;

            const firstDay    = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const monthEvents = allEvents[month] || {};

            // Células vazias antes do dia 1
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'cal-day empty';
                calendarGrid.appendChild(emptyCell);
            }

            // Dias do mês
            for (let i = 1; i <= daysInMonth; i++) {
                const dayCell = document.createElement('div');
                const hasEvent = !!monthEvents[i];

                dayCell.className = `cal-day pop-in ${hasEvent ? 'has-event' : ''}`;
                dayCell.style.animationDelay = `${(firstDay + i) * 0.01}s`;

                if (hasEvent) {
                    dayCell.innerHTML = `
                        ${i}
                        <img src="images/webp/06_Selo_Circular_Rosa_Transparente.png" alt="Selo" class="day-seal" width="26" height="26" loading="lazy" decoding="async">
                    `;
                    dayCell.addEventListener('click', () => {
                        if (activeCell) activeCell.classList.remove('active');
                        dayCell.classList.add('active');
                        activeCell = dayCell;

                        const eventData = monthEvents[i];
                        panelTitle.textContent = eventData.title;
                        panelDesc.textContent  = eventData.desc;
                        panel.classList.remove('hidden');

                        if (eventData.link) {
                            panelLink.style.display = 'inline-flex';
                            panelLink.href = eventData.link;
                        } else {
                            panelLink.style.display = 'none';
                        }
                    });
                } else {
                    dayCell.textContent = i;
                    dayCell.addEventListener('click', () => {
                        if (activeCell) activeCell.classList.remove('active');
                        dayCell.classList.add('active');
                        activeCell = dayCell;

                        panelTitle.textContent = `${i} de ${monthNames[month]}`;
                        panelDesc.textContent  = 'Nenhum evento programado. Entre em contato para consultar a disponibilidade desta data!';
                        panel.classList.remove('hidden');
                        panelLink.style.display = 'inline-flex';
                        panelLink.href = `https://wa.me/5512992538126?text=Olá,%20gostaria%20de%20saber%20sobre%20a%20disponibilidade%20para%20o%20dia%20${i}%20de%20${monthNames[month]}!`;
                        panelLink.textContent = 'Consultar Disponibilidade';
                    });
                }

                calendarGrid.appendChild(dayCell);
            }
        }

        renderCalendar(currentMonth, currentYear);

        document.getElementById('prev-month').addEventListener('click', () => {
            if (currentMonth > 0) { currentMonth--; renderCalendar(currentMonth, currentYear); }
        });
        document.getElementById('next-month').addEventListener('click', () => {
            if (currentMonth < 11) { currentMonth++; renderCalendar(currentMonth, currentYear); }
        });
    }

    // =========================================================
    // MODAL CARDÁPIO
    // =========================================================
    const menuModal    = document.getElementById('menu-modal');
    const openModalBtn = document.getElementById('open-menu-modal');
    const closeModalBtn = document.getElementById('close-menu-modal');

    if (menuModal && openModalBtn && closeModalBtn) {
        openModalBtn.addEventListener('click', () => {
            menuModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        function closeModal() {
            menuModal.classList.remove('open');
            document.body.style.overflow = '';
        }

        closeModalBtn.addEventListener('click', closeModal);

        menuModal.addEventListener('click', (e) => {
            if (e.target === menuModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
});
