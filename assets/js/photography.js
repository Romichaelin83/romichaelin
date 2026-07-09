/* ==========================================================================
   ROMY MICHAEL - PHOTOGRAPHY GALLERY INTERACTIVITY
   Core Logic: Live Search, Masonry Filters, Slideshow Lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. Theme Management (Subpage Bridge)
       -------------------------------------------------------------------------- */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    /* Sticky Header & Scroll progress */
    const header = document.querySelector('header');
    const scrollProgressBar = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / windowHeight) * 100;
        scrollProgressBar.style.width = scrollPercent + '%';
    });

    /* Mobile Navigation Hamburger Menu */
    const burger = document.getElementById('menu-burger');
    const navMenu = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });


    /* --------------------------------------------------------------------------
       2. Multi-Filter & Live Search System
       -------------------------------------------------------------------------- */
    const searchInput = document.getElementById('photo-search');
    const filterTabs = document.querySelectorAll('#photo-filters .filter-tab');
    const photoCards = document.querySelectorAll('.photo-card');

    let currentFilter = 'all';
    let searchQuery = '';

    const applyFiltersAndSearch = () => {
        photoCards.forEach(card => {
            const tags = card.getAttribute('data-tags') || '';
            const matchesFilter = (currentFilter === 'all' || tags.includes(currentFilter));
            const matchesSearch = (searchQuery === '' || tags.includes(searchQuery));

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
                setTimeout(() => card.style.opacity = '1', 50);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });
    };

    // Filter Click
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentFilter = tab.getAttribute('data-filter');
            applyFiltersAndSearch();
            
            // If slideshow is running, pause it since items changed
            stopSlideshow();
        });
    });

    // Search Query Change
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFiltersAndSearch();
        stopSlideshow();
    });


    /* --------------------------------------------------------------------------
       3. Lightbox with Slideshow Controls
       -------------------------------------------------------------------------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    const playBtn = document.getElementById('play-slideshow');
    const pauseBtn = document.getElementById('pause-slideshow');

    let visibleCards = [];
    let currentIndex = 0;
    let slideshowInterval = null;

    const getVisibleCards = () => {
        // Collect visible elements in DOM sequence
        return Array.from(photoCards).filter(card => card.style.display !== 'none');
    };

    const updateLightboxContent = (index) => {
        if (visibleCards.length === 0) return;
        currentIndex = index;
        const card = visibleCards[currentIndex];
        
        const imgUrl = card.getAttribute('data-img');
        const title = card.getAttribute('data-title') || card.querySelector('.photo-title').innerText;
        const desc = card.getAttribute('data-desc') || "";

        lightboxImg.src = imgUrl;
        lightboxCaption.innerHTML = `<h4>${title}</h4><p style="font-size:0.85rem; color:#ccc; margin-top:0.4rem; max-width:600px;">${desc}</p>`;
    };

    // Open Lightbox
    photoCards.forEach(card => {
        card.addEventListener('click', () => {
            visibleCards = getVisibleCards();
            const index = visibleCards.indexOf(card);
            if (index !== -1) {
                updateLightboxContent(index);
                lightbox.classList.add('active');
            }
        });
    });

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        stopSlideshow();
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Next / Prev navigation
    const showNextPhoto = () => {
        if (visibleCards.length === 0) return;
        const nextIdx = (currentIndex + 1) % visibleCards.length;
        updateLightboxContent(nextIdx);
    };

    const showPrevPhoto = () => {
        if (visibleCards.length === 0) return;
        const prevIdx = (currentIndex - 1 + visibleCards.length) % visibleCards.length;
        updateLightboxContent(prevIdx);
    };

    lightboxNext.addEventListener('click', () => {
        stopSlideshow(); // stop automatic rotation on manual clicks
        showNextPhoto();
    });

    lightboxPrev.addEventListener('click', () => {
        stopSlideshow();
        showPrevPhoto();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') {
            stopSlideshow();
            showNextPhoto();
        } else if (e.key === 'ArrowLeft') {
            stopSlideshow();
            showPrevPhoto();
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    /* Slideshow Engine */
    const startSlideshow = () => {
        if (slideshowInterval) return;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        
        slideshowInterval = setInterval(() => {
            showNextPhoto();
        }, 3000); // 3 seconds interval
    };

    const stopSlideshow = () => {
        if (!slideshowInterval) return;
        clearInterval(slideshowInterval);
        slideshowInterval = null;
        
        playBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
    };

    if (playBtn && pauseBtn) {
        playBtn.addEventListener('click', startSlideshow);
        pauseBtn.addEventListener('click', stopSlideshow);
    }

    /* --------------------------------------------------------------------------
       4. Consultation Booking Modal Actions
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

    /* --------------------------------------------------------------------------
       5. Client Portal Modal Actions
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
       6. Drive Shared Assets Modal Actions
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
});
