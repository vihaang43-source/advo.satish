/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons if available via CDN
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  /* ==========================================
     PRELOADER / LOADING SCREEN
     ========================================== */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    // Force a slight delay to allow drawing animation to be noticed
    window.addEventListener("load", () => {
      setTimeout(() => {
        preloader.classList.add("fade-out");
      }, 1800); // Fades out nicely after drawing finishes
    });

    // Fallback: in case window load event already fired or is delayed
    setTimeout(() => {
      if (!preloader.classList.contains("fade-out")) {
        preloader.classList.add("fade-out");
      }
    }, 4500);
  }

  /* ==========================================
     SCROLL PROGRESS INDICATOR
     ========================================== */
  const progressBar = document.querySelector(".scroll-progress-bar");
  
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${scrollPercent}%`;
  };

  window.addEventListener("scroll", updateScrollProgress);
  updateScrollProgress();

  /* ==========================================
     STICKY NAVBAR & ACTIVE NAV HIGHLIGHT
     ========================================== */
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  const handleNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  // Highlights the correct navigation link based on current viewport scroll position
  const highlightActiveLink = () => {
    const scrollY = window.scrollY + 120; // offset of header height
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute("id");
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  };

  window.addEventListener("scroll", () => {
    handleNavbarScroll();
    highlightActiveLink();
  });
  handleNavbarScroll();
  highlightActiveLink();

  /* ==========================================
     MOBILE HAMBURGER MENU / DRAWER
     ========================================== */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const menuLinks = document.querySelectorAll(".nav-menu .nav-link, .nav-menu .nav-btn");

  if (navToggle && navMenu) {
    const toggleMenu = () => {
      navToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
      // Prevent body scroll when menu is active
      document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
    };

    navToggle.addEventListener("click", toggleMenu);

    // Close menu when clicking on a link
    menuLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("active")) {
          toggleMenu();
        }
      });
    });
  }

  /* ==========================================
     SMOOTH SCROLLING fallback
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Calculate offset (sticky header height)
        const headerOffset = navbar ? navbar.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });

  /* ==========================================
     INTERSECTION OBSERVER: SCROLL REVEAL
     ========================================== */
  const revealElements = document.querySelectorAll(".reveal, .timeline-item");
  
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target); // Unobserve once animated
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px" // triggers slightly before entering full viewport
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => {
      el.classList.add("revealed");
    });
  }

  /* ==========================================
     ANIMATED STATS COUNTERS
     ========================================== */
  const statsSection = document.getElementById("about");
  const statNumbers = document.querySelectorAll(".stat-number");
  let countersAnimated = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute("data-target"), 10);
      const suffix = stat.getAttribute("data-suffix") || "";
      const duration = 2000; // 2 seconds duration
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Custom easeOutQuart transition curve for elegant decay speed
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeProgress * target);

        stat.textContent = `${currentValue}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          stat.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  if ("IntersectionObserver" in window && statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          animateCounters();
          countersAnimated = true;
          statsObserver.unobserve(statsSection);
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(statsSection);
  } else {
    // Fallback if observer is not available
    setTimeout(animateCounters, 1000);
  }

  /* ==========================================
     TESTIMONIAL SLIDER / DECK
     ========================================== */
  const track = document.querySelector(".testimonials-track");
  const slides = document.querySelectorAll(".testimonial-slide");
  const prevBtn = document.getElementById("testimonialPrev");
  const nextBtn = document.getElementById("testimonialNext");
  const dotsContainer = document.getElementById("testimonialDots");

  if (track && slides.length > 0) {
    let currentIndex = 0;
    const slideCount = slides.length;
    let autoSlideInterval;

    // Create dot indicators
    slides.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.classList.add("slider-dot");
      if (idx === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".slider-dot");

    const updateSlider = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      // Update active classes
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentIndex);
      });
    };

    const goToSlide = (index) => {
      currentIndex = index;
      if (currentIndex < 0) currentIndex = slideCount - 1;
      if (currentIndex >= slideCount) currentIndex = 0;
      updateSlider();
      resetAutoSlide();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    // Auto sliding interval setup (every 6 seconds)
    const startAutoSlide = () => {
      autoSlideInterval = setInterval(nextSlide, 6000);
    };

    const resetAutoSlide = () => {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    };

    startAutoSlide();

    // Swipe support for touch screens
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        nextSlide(); // Swipe left -> next
      } else if (touchEndX - touchStartX > swipeThreshold) {
        prevSlide(); // Swipe right -> prev
      }
    };
  }

  /* ==========================================
     INTERACTIVE FAQ ACCORDION
     ========================================== */
  const faqHeaders = document.querySelectorAll(".faq-header");

  faqHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const currentItem = header.parentElement;
      const answerWrapper = currentItem.querySelector(".faq-answer-wrapper");
      const isCurrentlyActive = currentItem.classList.contains("active");

      // Close all other FAQ items first
      document.querySelectorAll(".faq-item").forEach(item => {
        item.classList.remove("active");
        item.querySelector(".faq-answer-wrapper").style.maxHeight = null;
      });

      // Toggle current item
      if (!isCurrentlyActive) {
        currentItem.classList.add("active");
        // Dynamically compute the exact content's scroll height for fluid expansion
        answerWrapper.style.maxHeight = `${answerWrapper.scrollHeight}px`;
      }
    });
  });

  /* ==========================================
     CONTACT FORM COMPREHENSIVE VALIDATION
     ========================================== */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm) {
    const validateField = (field, regex, errorMsg) => {
      const group = field.parentElement;
      const val = field.value.trim();
      
      if (!regex.test(val)) {
        group.classList.add("error");
        group.querySelector(".form-error-msg").textContent = errorMsg;
        return false;
      } else {
        group.classList.remove("error");
        return true;
      }
    };

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameField = document.getElementById("name");
      const emailField = document.getElementById("email");
      const phoneField = document.getElementById("phone");
      const subjectField = document.getElementById("subject");
      const messageField = document.getElementById("message");

      const nameValid = validateField(
        nameField, 
        /^[a-zA-Z\s]{3,50}$/, 
        "Please enter a valid name (at least 3 characters)"
      );

      const emailValid = validateField(
        emailField, 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        "Please enter a valid email address"
      );

      const phoneValid = validateField(
        phoneField, 
        /^\+?[0-9\s-]{10,15}$/, 
        "Please enter a valid phone number (at least 10 digits)"
      );

      const subjectValid = validateField(
        subjectField, 
        /^.{4,100}$/, 
        "Please enter a valid subject (at least 4 characters)"
      );

      const messageValid = validateField(
        messageField, 
        /^[\s\S]{10,1000}$/, 
        "Message must be at least 10 characters long"
      );

      if (nameValid && emailValid && phoneValid && subjectValid && messageValid) {
        // Show sending state
        const submitBtn = contactForm.querySelector(".btn-submit");
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span>`;

        // Simulate professional API server-side request with a transition delay
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Message Sent</span>`;
          
          if (formStatus) {
            formStatus.textContent = "Your message has been sent successfully. We will get back to you shortly.";
            formStatus.classList.add("success");
            formStatus.style.display = "block";
          }

          // Reset Form values and floating labels
          contactForm.reset();

          // Clear success status after a while
          setTimeout(() => {
            if (formStatus) {
              formStatus.style.display = "none";
              formStatus.classList.remove("success");
            }
            submitBtn.innerHTML = `<span>${originalBtnText}</span>`;
          }, 5000);
        }, 1500);
      }
    });

    // Clear error class instantly upon text input/change
    contactForm.querySelectorAll(".form-input").forEach(input => {
      input.addEventListener("input", () => {
        const group = input.parentElement;
        if (group.classList.contains("error")) {
          group.classList.remove("error");
        }
      });
    });
  }

  /* ==========================================
     BACK TO TOP BUTTON STABILITY
     ========================================== */
  const backToTopBtn = document.getElementById("backToTop");
  
  const handleBackToTopScroll = () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("active");
    } else {
      backToTopBtn.classList.remove("active");
    }
  };

  window.addEventListener("scroll", handleBackToTopScroll);
  handleBackToTopScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
