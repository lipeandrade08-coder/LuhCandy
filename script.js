document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial pause for animation elements not in viewport
    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => {
        // Only pause if they are not in the first section
        if(!el.closest('.hero')) {
            el.style.animationPlayState = 'paused';
            el.style.opacity = '0';
            observer.observe(el);
        }
    });

    // --- Dynamic Animated Calendar ---
    const calendarGrid = document.getElementById('calendar-grid');
    if (calendarGrid) {
        let currentMonth = 7; // August (0-indexed)
        const currentYear = 2026;
        
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        // Mock Events for 2026 (Month is 0-indexed)
        const allEvents = {
            7: { // August
                5: { title: 'Casamento ao Ar Livre', desc: 'Mesa de doces finos e bolo cenográfico. (Data Indisponível)', link: null },
                8: { title: 'Chá Revelação', desc: 'Evento íntimo com doces temáticos e delicados. (Data Indisponível)', link: null },
                12: { title: 'Aniversário de 15 Anos', desc: 'Buffet completo e carrinho de guloseimas. (Data Indisponível)', link: null },
                15: { title: 'Brunch de Degustação - Noivas', desc: 'Uma manhã especial para conhecer nosso cardápio de casamentos. (Últimas Vagas!)', link: 'https://wa.me/5512992538126?text=Olá,%20quero%20reservar%20minha%20vaga%20para%20a%20degustação%20do%20dia%2015!' },
                22: { title: 'Evento Corporativo Exclusivo', desc: 'Atendimento fechado para confraternização empresarial. (Data Indisponível)', link: null },
                25: { title: 'Bodas de Prata', desc: 'Comemoração de 25 anos de casados com menu super premium. (Data Indisponível)', link: null },
                30: { title: 'Agenda de Setembro Aberta', desc: 'Datas disponíveis para o próximo mês. Consulte-nos para reservar o seu evento.', link: 'https://wa.me/5512992538126?text=Olá,%20gostaria%20de%20verificar%20uma%20data%20em%20Setembro!' }
            }
        };

        const panel = document.getElementById('event-details-panel');
        const panelTitle = document.getElementById('event-title');
        const panelDesc = document.getElementById('event-desc');
        const panelLink = document.getElementById('event-link');
        const calMonthYear = document.getElementById('cal-month-year');
        let activeCell = null;

        function renderCalendar(month, year) {
            calendarGrid.innerHTML = '';
            panel.classList.add('hidden');
            activeCell = null;
            
            calMonthYear.textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const monthEvents = allEvents[month] || {};

            // Add empty cells for days before the 1st
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'cal-day empty';
                calendarGrid.appendChild(emptyCell);
            }

            // Add actual days
            for (let i = 1; i <= daysInMonth; i++) {
                const dayCell = document.createElement('div');
                const hasEvent = monthEvents[i] ? true : false;
                
                dayCell.className = `cal-day pop-in ${hasEvent ? 'has-event' : ''}`;
                dayCell.style.animationDelay = `${(firstDay + i) * 0.01}s`;
                
                if (hasEvent) {
                    dayCell.innerHTML = `
                        ${i}
                        <img src="images/06_Selo_Circular_Rosa_Transparente.png" alt="Selo" class="day-seal">
                    `;
                    
                    dayCell.addEventListener('click', () => {
                        if (activeCell) activeCell.classList.remove('active');
                        dayCell.classList.add('active');
                        activeCell = dayCell;
                        
                        const eventData = monthEvents[i];
                        panelTitle.textContent = eventData.title;
                        panelDesc.textContent = eventData.desc;
                        panel.classList.remove('hidden');
                        
                        if (eventData.link) {
                            panelLink.style.display = 'inline-flex';
                            panelLink.href = eventData.link;
                        } else {
                            panelLink.style.display = 'none';
                        }
                    });
                } else {
                    dayCell.innerHTML = `${i}`;
                    dayCell.addEventListener('click', () => {
                        if (activeCell) activeCell.classList.remove('active');
                        dayCell.classList.add('active');
                        activeCell = dayCell;
                        
                        panelTitle.textContent = `${i} de ${monthNames[month]}`;
                        panelDesc.textContent = 'Nenhum evento programado. Entre em contato para consultar a disponibilidade desta data!';
                        panel.classList.remove('hidden');
                        panelLink.style.display = 'inline-flex';
                        panelLink.href = `https://wa.me/5512992538126?text=Olá,%20gostaria%20de%20saber%20sobre%20a%20disponibilidade%20para%20o%20dia%20${i}%20de%20${monthNames[month]}!`;
                        panelLink.textContent = "Consultar Disponibilidade";
                    });
                }
                
                calendarGrid.appendChild(dayCell);
            }
        }

        renderCalendar(currentMonth, currentYear);

        document.getElementById('prev-month').addEventListener('click', () => {
            if (currentMonth > 0) {
                currentMonth--;
                renderCalendar(currentMonth, currentYear);
            }
        });

        document.getElementById('next-month').addEventListener('click', () => {
            if (currentMonth < 11) {
                currentMonth++;
                renderCalendar(currentMonth, currentYear);
            }
        });
    }

    // Slideshow Logic
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        
        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        // Change slide every 4 seconds
        setInterval(nextSlide, 4000);
    }
});
