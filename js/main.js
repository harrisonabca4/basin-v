/* ============================================
   Basin Ventures — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation ---
  const mobileToggle = document.querySelector('.nav__mobile-toggle');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.innerHTML = isOpen ? '&#x2715;' : '&#9776;';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.innerHTML = '&#9776;';
        document.body.style.overflow = '';
      });
    });
  }

  // --- Nav Scroll Effect ---
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Animated Counters ---
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => counterObserver.observe(c));
  }

  // --- Fade-in on Scroll ---
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');

      // Close all others in same container
      item.parentElement.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });

  // --- Resource Filter ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const resourceCards = document.querySelectorAll('.resource-card[data-category]');

  if (filterBtns.length && resourceCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;

        resourceCards.forEach(card => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Newsletter Form ---
  document.querySelectorAll('.newsletter__form, .lead-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        const btn = form.querySelector('button');
        const origText = btn.textContent;
        btn.textContent = 'Subscribed!';
        btn.disabled = true;
        emailInput.value = '';
        setTimeout(() => {
          btn.textContent = origText;
          btn.disabled = false;
        }, 3000);
      }
    });
  });

  // --- Investment Calculator ---
  const calcForm = document.getElementById('calc-form');
  if (calcForm) {
    const incomeInput = document.getElementById('calc-income');
    const investInput = document.getElementById('calc-investment');
    const incomeRange = document.getElementById('calc-income-range');
    const investRange = document.getElementById('calc-investment-range');
    const filingInput = document.getElementById('calc-filing');

    const fmt = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

    const brackets2025 = {
      single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
      ],
      married: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 }
      ]
    };

    function calcTax(income, filing) {
      const schedule = brackets2025[filing] || brackets2025.single;
      let tax = 0;
      for (const b of schedule) {
        if (income <= b.min) break;
        const taxable = Math.min(income, b.max) - b.min;
        tax += taxable * b.rate;
      }
      return tax;
    }

    function getMarginalRate(income, filing) {
      const schedule = brackets2025[filing] || brackets2025.single;
      let rate = 0.10;
      for (const b of schedule) {
        if (income > b.min) rate = b.rate;
      }
      return rate;
    }

    function updateCalc() {
      const income = parseInt(incomeInput.value) || 0;
      const investment = parseInt(investInput.value) || 0;
      const filing = filingInput ? filingInput.value : 'single';

      // IDC deduction (87% of investment)
      const idcDeduction = investment * 0.87;
      // TDC deduction (remaining 13% with bonus depreciation)
      const tdcDeduction = investment * 0.13;
      // Total Year 1 deduction
      const totalDeduction = idcDeduction + tdcDeduction;

      // Tax before and after
      const taxBefore = calcTax(income, filing);
      const taxAfter = calcTax(Math.max(0, income - totalDeduction), filing);
      const taxSavings = taxBefore - taxAfter;

      // Marginal rate
      const marginalRate = getMarginalRate(income, filing);

      // Effective cost after tax benefit
      const effectiveCost = investment - taxSavings;

      // Annual depletion (15% of estimated production income)
      const estAnnualIncome = investment * 0.15; // conservative estimate
      const depletionBenefit = estAnnualIncome * 0.15;

      // Update DOM
      const setValue = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setValue('result-idc', fmt(idcDeduction));
      setValue('result-tdc', fmt(tdcDeduction));
      setValue('result-total-deduction', fmt(totalDeduction));
      setValue('result-tax-before', fmt(taxBefore));
      setValue('result-tax-after', fmt(taxAfter));
      setValue('result-tax-savings', fmt(taxSavings));
      setValue('result-marginal-rate', (marginalRate * 100).toFixed(0) + '%');
      setValue('result-effective-cost', fmt(effectiveCost));
      setValue('result-depletion', fmt(depletionBenefit) + '/yr');

      // Update range displays
      const incomeDisplay = document.getElementById('income-display');
      const investDisplay = document.getElementById('invest-display');
      if (incomeDisplay) incomeDisplay.textContent = fmt(income);
      if (investDisplay) investDisplay.textContent = fmt(investment);
    }

    // Sync inputs and ranges
    if (incomeRange) {
      incomeRange.addEventListener('input', () => {
        incomeInput.value = incomeRange.value;
        updateCalc();
      });
      incomeInput.addEventListener('input', () => {
        incomeRange.value = incomeInput.value;
        updateCalc();
      });
    }

    if (investRange) {
      investRange.addEventListener('input', () => {
        investInput.value = investRange.value;
        updateCalc();
      });
      investInput.addEventListener('input', () => {
        investRange.value = investInput.value;
        updateCalc();
      });
    }

    if (filingInput) {
      filingInput.addEventListener('change', updateCalc);
    }

    // Initial calc
    updateCalc();
  }

  // --- Contact Form ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const origText = btn.textContent;
      btn.textContent = 'Message Sent!';
      btn.disabled = true;
      contactForm.reset();
      setTimeout(() => {
        btn.textContent = origText;
        btn.disabled = false;
      }, 3000);
    });
  }

  // --- Smooth scroll for anchor links (with fixed header offset) ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const bar = document.querySelector('.announcement-bar');
        const offset = bar ? 130 : 90; // nav + bar + buffer
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
