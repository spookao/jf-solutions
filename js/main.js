// Preloader and Smooth Transitions
function hidePreloader() {
    const preloader = document.getElementById('page-preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
        const isHomePage = document.body.classList.contains('home-page');
        const delay = isHomePage ? 2500 : 200; // Cinematic delay for home page
        
        setTimeout(() => {
            preloader.classList.add('fade-out');
            if (isHomePage) {
                document.body.classList.add('cinematic-loaded');
            }
        }, delay); 
    }
}

// Tenta esconder no 'load' (quando tudo carrega, imagens, etc)
window.addEventListener('load', hidePreloader);

// Fallback: se a página demorar mais de 3s a carregar totalmente, esconde de qualquer maneira
setTimeout(hidePreloader, 3500);

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    // Ignore external links, anchor links, emails, and tel
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
    
    // Intercept internal navigation
    if (link.origin === window.location.origin) {
        e.preventDefault();
        const preloader = document.getElementById('page-preloader');
        if (preloader) {
            preloader.classList.remove('fade-out');
            // Reduzi o delay de transição para 350ms para manter a fluidez sem demorar
            setTimeout(() => {
                window.location.href = link.href;
            }, 350);
        } else {
            window.location.href = link.href;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // Header scroll effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Load Testimonials on homepage
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (testimonialsContainer) {
        loadTestimonials();
    }

    // Load Dynamic Content
    loadDynamicContent();

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function loadTestimonials() {
    const container = document.getElementById('testimonials-container');
    const testimonials = await api.getTestimonials();
    
    if (testimonials.length === 0) {
        container.innerHTML = `
            <div class="testimonial-card">
                <i class="fas fa-quote-left testimonial-icon"></i>
                <p class="testimonial-content">"Excelente serviço e profissionalismo. Recomendo vivamente a JF Maintenance para quem procura qualidade na Comporta."</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">JS</div>
                    <div class="testimonial-info">
                        <h4>João Silva</h4>
                        <small>Proprietário no Carvalhal</small>
                    </div>
                </div>
            </div>
            <div class="testimonial-card">
                <i class="fas fa-quote-left testimonial-icon"></i>
                <p class="testimonial-content">"A equipa é extremamente pontual e cuidadosa. Sinto-me descansada em deixar a minha casa nas mãos deles."</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">MS</div>
                    <div class="testimonial-info">
                        <h4>Maria Santos</h4>
                        <small>Proprietária em Tróia</small>
                    </div>
                </div>
            </div>
            <div class="testimonial-card">
                <i class="fas fa-quote-left testimonial-icon"></i>
                <p class="testimonial-content">"Serviço de gestão de check-in impecável. Os hóspedes estão sempre satisfeitos com a limpeza."</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">RK</div>
                    <div class="testimonial-info">
                        <h4>Robert Klein</h4>
                        <small>Investidor Estrangeiro</small>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = testimonials.map(t => {
        const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
        return `
        <div class="testimonial-card" data-aos="fade-up">
            <i class="fas fa-quote-left testimonial-icon"></i>
            <p class="testimonial-content">"${t.content}"</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${initials}</div>
                <div class="testimonial-info">
                    <h4>${t.name}</h4>
                    <small>${t.role || ''}</small>
                </div>
            </div>
        </div>
    `}).join('');
}

async function loadDynamicContent() {
    try {
        const titleContent = await api.getContent('hero-title');
        if (titleContent && titleContent.value) {
            const heroTitleEl = document.querySelector('.hero-content h1');
            if (heroTitleEl) heroTitleEl.innerText = titleContent.value;
        }

        const phoneContent = await api.getContent('contact-phone');
        const emailContent = await api.getContent('contact-email');

        if (phoneContent && phoneContent.value) {
            const phoneEl = document.getElementById('contact-phone');
            if (phoneEl) {
                phoneEl.innerText = phoneContent.value;
            } else {
                // Fallback for other pages
                document.querySelectorAll('p').forEach(p => {
                    if (p.innerHTML.includes('fa-phone')) {
                        const icon = p.querySelector('i');
                        p.innerHTML = `<i class="fas fa-phone" style="${icon ? icon.style.cssText : ''}"></i> ${phoneContent.value}`;
                    }
                });
            }

            const waBtn = document.querySelector('.whatsapp-btn');
            const waLink = document.getElementById('whatsapp-link');
            const phoneClean = phoneContent.value.replace(/\D/g, '');
            
            if (waBtn) waBtn.href = `https://wa.me/${phoneClean}`;
            if (waLink) waLink.href = `https://wa.me/${phoneClean}`;
        }

        if (emailContent && emailContent.value) {
            const emailEl = document.getElementById('contact-email');
            if (emailEl) {
                emailEl.innerText = emailContent.value;
            } else {
                // Fallback for other pages
                document.querySelectorAll('p').forEach(p => {
                    if (p.innerHTML.includes('fa-envelope')) {
                        const icon = p.querySelector('i');
                        p.innerHTML = `<i class="fas fa-envelope" style="${icon ? icon.style.cssText : ''}"></i> ${emailContent.value}`;
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading dynamic content:', error);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';
        
        await api.sendMessage(data);
        
        alert('Mensagem enviada com sucesso! Entraremos em contacto em breve.');
        e.target.reset();
    } catch (error) {
        alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
}
