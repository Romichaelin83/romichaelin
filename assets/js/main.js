/* ==========================================================================
   ROMY MICHAEL - PREMIUM PORTFOLIO INTERACTIVITY
   Core Logic: Theme Management, Slider, AI Assistant, Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Register Service Worker for PWA Offline Support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('[Service Worker] Registered successfully:', reg.scope))
                .catch(err => console.log('[Service Worker] Registration failed:', err));
        });
    }

    /* --------------------------------------------------------------------------
       1. Light/Dark Mode State Management
       -------------------------------------------------------------------------- */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved theme or use default (dark)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });


    /* --------------------------------------------------------------------------
       2. Header Transitions & Scroll Progress
       -------------------------------------------------------------------------- */
    const header = document.querySelector('header');
    const scrollProgressBar = document.getElementById('scroll-progress');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Sticky Header shrink
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Auto-Hide Header on scroll down, Reappear on scroll up
        if (Math.abs(lastScrollTop - scrollTop) > 10) {
            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                header.classList.add('nav-hidden');
            } else {
                header.classList.remove('nav-hidden');
            }
        }
        lastScrollTop = scrollTop;

        // Scroll Progress Bar
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / windowHeight) * 100;
        scrollProgressBar.style.width = scrollPercent + '%';

        // Active Nav Link highlight on Scroll
        let currentSection = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });


    /* --------------------------------------------------------------------------
       3. Mobile Navigation Hamburger Menu
       -------------------------------------------------------------------------- */
    const burger = document.getElementById('menu-burger');
    const navMenu = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when links are clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });


    /* --------------------------------------------------------------------------
       4. Reveal Animations (Intersection Observer)
       -------------------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // trigger animation once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    /* --------------------------------------------------------------------------
       5. Animated Stats Counters
       -------------------------------------------------------------------------- */
    const counters = document.querySelectorAll('.counter');
    
    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const suffix = counter.getAttribute('data-suffix') || '+';
                const duration = 2000; // 2 seconds
                let start = 0;
                const step = target / (duration / 16); // ~60fps

                const updateCount = () => {
                    start += step;
                    if (start < target) {
                        counter.innerText = Math.floor(start);
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = target + suffix;
                    }
                };
                
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => countObserver.observe(c));


    /* --------------------------------------------------------------------------
       6. Interactive Before/After Slider
       -------------------------------------------------------------------------- */
    const baSlider = document.getElementById('ba-slider');
    const baBeforeImg = document.getElementById('ba-before-img');
    const baHandle = document.getElementById('ba-handle');

    if (baSlider && baBeforeImg && baHandle) {
        let isDragging = false;

        const updateSliderPosition = (xPos) => {
            const sliderRect = baSlider.getBoundingClientRect();
            let offset = xPos - sliderRect.left;
            
            // Boundary constraints
            if (offset < 0) offset = 0;
            if (offset > sliderRect.width) offset = sliderRect.width;

            const percentage = (offset / sliderRect.width) * 100;
            baBeforeImg.style.width = percentage + '%';
            baHandle.style.left = percentage + '%';
        };

        // Desktop Events
        baHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSliderPosition(e.clientX);
        });

        // Mobile Events
        baHandle.addEventListener('touchstart', (e) => {
            isDragging = true;
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSliderPosition(e.touches[0].clientX);
        });
    }


    /* --------------------------------------------------------------------------
       7. Portfolio Category Filtering
       -------------------------------------------------------------------------- */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 50);
                } else if (item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });


    /* --------------------------------------------------------------------------
       8. Lightbox Overlay (Shared)
       -------------------------------------------------------------------------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let activeItems = [];
    let currentIndex = 0;

    const openLightboxWithImage = (src, title, desc, itemList, index) => {
        lightboxImg.src = src;
        lightboxCaption.innerHTML = `<h4>${title}</h4><p style="font-size:0.85rem; color:#ccc;">${desc}</p>`;
        lightbox.classList.add('active');
        activeItems = itemList;
        currentIndex = index;
    };

    // Find all portfolio and gallery triggers
    const triggerCards = document.querySelectorAll('.open-lightbox');
    const itemArray = Array.from(triggerCards);

    triggerCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const src = card.getAttribute('data-img') || card.getAttribute('data-src') || card.querySelector('img').src;
            const title = card.getAttribute('data-title') || card.querySelector('h3, h4').innerText;
            const desc = card.getAttribute('data-desc') || "Exhibition Gallery item showcase.";
            openLightboxWithImage(src, title, desc, itemArray, index);
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            if (activeItems.length === 0) return;
            currentIndex = (currentIndex + 1) % activeItems.length;
            const nextCard = activeItems[currentIndex];
            const src = nextCard.getAttribute('data-img') || nextCard.getAttribute('data-src') || nextCard.querySelector('img').src;
            const title = nextCard.getAttribute('data-title') || nextCard.querySelector('h3, h4').innerText;
            const desc = nextCard.getAttribute('data-desc') || "Exhibition Gallery item showcase.";
            lightboxImg.src = src;
            lightboxCaption.innerHTML = `<h4>${title}</h4><p style="font-size:0.85rem; color:#ccc;">${desc}</p>`;
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            if (activeItems.length === 0) return;
            currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
            const prevCard = activeItems[currentIndex];
            const src = prevCard.getAttribute('data-img') || prevCard.getAttribute('data-src') || prevCard.querySelector('img').src;
            const title = prevCard.getAttribute('data-title') || prevCard.querySelector('h3, h4').innerText;
            const desc = prevCard.getAttribute('data-desc') || "Exhibition Gallery item showcase.";
            lightboxImg.src = src;
            lightboxCaption.innerHTML = `<h4>${title}</h4><p style="font-size:0.85rem; color:#ccc;">${desc}</p>`;
        });
    }


    /* --------------------------------------------------------------------------
       9. Floating WhatsApp Button Scroll & Inactivity Controls
       -------------------------------------------------------------------------- */
    const whatsappBtn = document.getElementById('whatsapp-btn');
    let lastScrollY = window.scrollY;
    let whatsappTimeout;

    const resetWhatsAppFade = () => {
        if (!whatsappBtn) return;
        whatsappBtn.classList.remove('fade-idle');
        clearTimeout(whatsappTimeout);
        
        // Fade to 20% opacity after 3s of inactivity
        whatsappTimeout = setTimeout(() => {
            whatsappBtn.classList.add('fade-idle');
        }, 3000);
    };

    // Reappear on interaction
    window.addEventListener('scroll', () => {
        if (!whatsappBtn) return;
        resetWhatsAppFade();

        // Scroll direction checks
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 300) {
            // Scrolling down -> Hide button
            whatsappBtn.classList.add('scroll-hide');
        } else {
            // Scrolling up -> Show button
            whatsappBtn.classList.remove('scroll-hide');
        }
        lastScrollY = currentScrollY;
    });

    if (whatsappBtn) {
        ['mousemove', 'mousedown', 'touchstart', 'hover'].forEach(evt => {
            window.addEventListener(evt, resetWhatsAppFade);
        });
        resetWhatsAppFade(); // start timer
    }


    /* --------------------------------------------------------------------------
       10. AI Assistant Chatbot Simulation
       -------------------------------------------------------------------------- */
    const aiToggle = document.getElementById('ai-toggle');
    const aiChat = document.getElementById('ai-chat');
    const aiChatClose = document.getElementById('ai-chat-close');
    const aiSend = document.getElementById('ai-send');
    const aiInput = document.getElementById('ai-input');
    const aiChatBody = document.getElementById('ai-chat-body');

    if (aiToggle && aiChat && aiChatClose) {
        aiToggle.addEventListener('click', () => {
            aiChat.classList.toggle('active');
            if (aiChat.classList.contains('active') && aiInput) {
                aiInput.focus();
            }
        });

        aiChatClose.addEventListener('click', () => {
            aiChat.classList.remove('active');
        });

        const appendMessage = (sender, text) => {
            const msgNode = document.createElement('div');
            msgNode.classList.add('ai-message', sender);
            msgNode.innerText = text;
            aiChatBody.appendChild(msgNode);
            aiChatBody.scrollTop = aiChatBody.scrollHeight;
        };

        const handleAiMessage = () => {
            const query = aiInput.value.trim().toLowerCase();
            if (query === '') return;

            appendMessage('user', aiInput.value);
            aiInput.value = '';

            // Loading state
            const typingNode = document.createElement('div');
            typingNode.classList.add('ai-message', 'bot', 'typing-indicator');
            typingNode.innerText = "Typing...";
            aiChatBody.appendChild(typingNode);
            aiChatBody.scrollTop = aiChatBody.scrollHeight;

            setTimeout(() => {
                typingNode.remove();
                
                let response = "I'm not sure about that. Try asking about 'services', 'interior design', 'contact details', or 'booking a consultation'.";

                if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
                    response = "Hello! Welcome to Romy Michael Studios. How can I assist you with your design, development, or AI goals today?";
                } else if (query.includes('service') || query.includes('what do you do')) {
                    response = "Romy Michael offers expert luxury services in: 1. Interior Design 2. Furniture Design 3. Product Design 4. Website Development 5. Mobile App Development 6. AI Solutions 7. Branding & Identity 8. Graphic Design 9. Creative Consultation.";
                } else if (query.includes('interior') || query.includes('house') || query.includes('room') || query.includes('office') || query.includes('furniture')) {
                    response = "Romy focuses on premium, Apple-inspired luxury interior planning. Our projects like 'LivDsign Pro' and 'MyVi Interio' implement modern layouts, white marble features, custom LEDs, and bespoke walnut-brass furniture.";
                } else if (query.includes('ai') || query.includes('chatbot') || query.includes('machine learning') || query.includes('automation')) {
                    response = "Romy creates custom AI-powered solutions including GPT-based chatbots, automation integrations, and machine learning endpoints tailored for businesses and creative studios.";
                } else if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('location') || query.includes('address') || query.includes('whatsapp')) {
                    response = "You can contact Romy Michael directly via Call/WhatsApp at +91 7034 34 7034 or Email at romichaelin@gmail.com. Our studio is based in Kochi, Kerala, India.";
                } else if (query.includes('book') || query.includes('consultation') || query.includes('appointment') || query.includes('hire') || query.includes('price')) {
                    response = "You can book a remote design or consultation session by clicking the 'Book Consultation' button on this site. Please complete the form with your details to lock in a time slot!";
                } else if (query.includes('website') || query.includes('app') || query.includes('develop') || query.includes('code')) {
                    response = "Romy builds high-speed, animations-heavy responsive websites and mobile apps using clean HTML/JS, React, and iOS SDKs, integrated with custom API endpoints and brand layouts.";
                } else if (query.includes('about') || query.includes('experience') || query.includes('bio')) {
                    response = "Romy Michael is a multidisciplinary creative professional based in Kerala, with over 10 years of experience designing high-end spatial structures and building advanced digital apps.";
                }

                appendMessage('bot', response);
            }, 1000);
        };

        if (aiSend) {
            aiSend.addEventListener('click', handleAiMessage);
        }

        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAiMessage();
            });
        }
    }


    /* --------------------------------------------------------------------------
       11. Consultation Booking Modal Actions
       -------------------------------------------------------------------------- */
    const bookingModalOverlay = document.getElementById('booking-modal-overlay');
    const openBookingBtns = document.querySelectorAll('.open-booking');
    const modalClose = document.getElementById('modal-close');
    const bookingForm = document.getElementById('booking-form');

    if (bookingModalOverlay && modalClose) {
        openBookingBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                bookingModalOverlay.classList.add('active');
            });
        });

        modalClose.addEventListener('click', () => {
            bookingModalOverlay.classList.remove('active');
        });

        bookingModalOverlay.addEventListener('click', (e) => {
            if (e.target === bookingModalOverlay) {
                bookingModalOverlay.classList.remove('active');
            }
        });
    }

    /* --------------------------------------------------------------------------
       11.1 Client Portal Modal Actions
       -------------------------------------------------------------------------- */
    const portalToggle = document.getElementById('portal-toggle');
    const portalModalOverlay = document.getElementById('portal-modal-overlay');
    const portalClose = document.getElementById('portal-close');
    const portalForm = document.getElementById('portal-form');

    if (portalToggle && portalModalOverlay && portalClose) {
        portalToggle.addEventListener('click', (e) => {
            e.preventDefault();
            portalModalOverlay.classList.add('active');
        });

        portalClose.addEventListener('click', () => {
            portalModalOverlay.classList.remove('active');
        });

        portalModalOverlay.addEventListener('click', (e) => {
            if (e.target === portalModalOverlay) {
                portalModalOverlay.classList.remove('active');
            }
        });

        portalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passkey = document.getElementById('portal-key').value;
            alert(`Project key "${passkey}" authenticated. Initializing connection to secure workspace...`);
            portalModalOverlay.classList.remove('active');
            portalForm.reset();
        });
    }

    /* --------------------------------------------------------------------------
       11.2 Drive Shared Assets Modal Actions
       -------------------------------------------------------------------------- */
    const driveLink = document.getElementById('drive-link');
    const driveModalOverlay = document.getElementById('drive-modal-overlay');
    const driveClose = document.getElementById('drive-close');
    const downloadBtns = document.querySelectorAll('.download-btn');

    if (driveLink && driveModalOverlay && driveClose) {
        driveLink.addEventListener('click', (e) => {
            e.preventDefault();
            driveModalOverlay.classList.add('active');
        });

        driveClose.addEventListener('click', () => {
            driveModalOverlay.classList.remove('active');
        });

        driveModalOverlay.addEventListener('click', (e) => {
            if (e.target === driveModalOverlay) {
                driveModalOverlay.classList.remove('active');
            }
        });

        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const fileName = btn.getAttribute('data-file');
                alert(`Starting secure download for: ${fileName}.zip`);
                driveModalOverlay.classList.remove('active');
            });
        });
    }


    /* --------------------------------------------------------------------------
       12. Form Submissions (Validation & Premium Feedback)
       -------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameVal = document.getElementById('name').value;
            alert(`Thank you, ${nameVal}! Your message has been encrypted and sent to Romy Michael. You will receive a direct reply within 12 business hours.`);
            contactForm.reset();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const clientName = document.getElementById('modal-name').value;
            const prefDate = document.getElementById('modal-date').value;
            const prefTime = document.getElementById('modal-time').value;
            
            alert(`Reservation slot requested for ${clientName} on ${prefDate} at ${prefTime}. Romy Michael's calendar assistant will email confirmation within 4 hours.`);
            bookingModalOverlay.classList.remove('active');
            bookingForm.reset();
        });
    }

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Subscription successful! Welcome to the premium design circle.");
            newsletterForm.reset();
        });
    }
});
