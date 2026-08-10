document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll Progress Bar ---
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const scrollPercent = (window.scrollY / totalScroll) * 100;
      scrollProgress.style.width = `${scrollPercent}%`;
    }
  });

  // --- Sticky Header & Active Nav Links ---
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Sticky Class
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Highlight
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}` || (currentSectionId === 'home' && link.getAttribute('href') === '#')) {
          link.classList.add('active');
        }
      });
    }
  });

  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById('menu-btn');
  const navList = document.getElementById('nav-links');

  menuBtn.addEventListener('click', () => {
    navList.classList.toggle('active');
  });

  // Close menu when clicking outside or on a link
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('active');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('active');
    });
  });

  // --- Dark/Light Theme Switcher ---
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // --- Count-up Animation for Stats ---
  const stats = document.querySelectorAll('.stat-number');
  const animateStats = (stat) => {
    const rawTarget = stat.getAttribute('data-target');
    if (!rawTarget || isNaN(parseInt(rawTarget, 10))) {
      return;
    }
    const target = parseInt(rawTarget, 10);
    const suffix = stat.getAttribute('data-suffix') || '+';
    const prefix = stat.getAttribute('data-prefix') || '';
    const speed = 50;
    const increment = Math.max(1, Math.ceil(target / speed));
    
    let count = 0;
    const updateCount = () => {
      count += increment;
      if (count < target) {
        stat.innerText = prefix + count + suffix;
        setTimeout(updateCount, 20);
      } else {
        stat.innerText = prefix + target.toLocaleString() + suffix;
      }
    };
    
    updateCount();
  };

  // Trigger stats animation on intersection
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => statsObserver.observe(stat));

  // --- Scroll Reveal Animation ---
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(reveal => revealObserver.observe(reveal));

  // --- Outreach Carousel / Slideshow ---
  const track = document.getElementById('carousel-track');
  const slides = Array.from(track.children);
  const dotContainer = document.getElementById('carousel-nav');
  
  let activeIndex = 0;
  
  const getVisibleSlidesCount = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const getDotsCount = () => {
    const visibleCount = getVisibleSlidesCount();
    return Math.max(1, slides.length - visibleCount + 1);
  };

  const createDots = () => {
    dotContainer.innerHTML = '';
    const dotCount = getDotsCount();
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === activeIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        slideTo(i);
      });
      dotContainer.appendChild(dot);
    }
  };

  const slideTo = (index) => {
    const visibleCount = getVisibleSlidesCount();
    const dotCount = getDotsCount();
    
    // Constrain index
    if (index >= dotCount) index = dotCount - 1;
    if (index < 0) index = 0;
    
    activeIndex = index;
    
    // Calculate translate percent based on slide width + gaps
    const gap = 30; // matching CSS gap
    const slideWidth = slides[0].getBoundingClientRect().width;
    const offset = index * (slideWidth + gap);
    
    track.style.transform = `translateX(-${offset}px)`;
    
    // Update dots
    const dots = Array.from(dotContainer.children);
    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  // Re-initialize and size on resize
  window.addEventListener('resize', () => {
    createDots();
    slideTo(Math.min(activeIndex, getDotsCount() - 1));
  });

  // Init Carousel
  createDots();

  // --- Volunteer / Involvement Form Handling ---
  const form = document.getElementById('involvement-form');
  const formMessage = document.getElementById('form-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    
    // Disable and animate submit button
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';
    formMessage.className = 'form-message';

    // Simulate Network Request
    setTimeout(() => {
      try {
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const roleVal = document.getElementById('role').value;
        const msgVal = document.getElementById('message').value.trim();

        if (!nameVal || !emailVal || !roleVal || !msgVal) {
          throw new Error('Please fill in all fields.');
        }

        // Show Success Message
        formMessage.innerText = `Thank you, ${nameVal}! Your request to join as a "${roleVal}" has been received. We will contact you at ${emailVal} soon.`;
        formMessage.classList.add('success');
        
        // Reset form
        form.reset();
      } catch (err) {
        // Show Error Message
        formMessage.innerText = err.message || 'An error occurred. Please try again.';
        formMessage.classList.add('error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }, 1200);
  });

  // --- Donation Gateway Wizard & Checkout Modal Logic ---
  const donationOverlay = document.getElementById('donation-overlay');
  const donationModal = donationOverlay.querySelector('.donation-modal');
  const donationClose = document.getElementById('donation-close');
  const donateTriggers = document.querySelectorAll('.donate-trigger');
  
  // Wizard Steps & Indicators
  const steps = document.querySelectorAll('.wizard-step');
  const stepDots = document.querySelectorAll('.step-dot');
  const stepLines = document.querySelectorAll('.step-line');
  
  // Step Buttons
  const btnNext1 = document.getElementById('btn-next-1');
  const btnNext2 = document.getElementById('btn-next-2');
  const btnPrev2 = document.getElementById('btn-prev-2');
  const btnPrev3 = document.getElementById('btn-prev-3');
  const btnSubmitPayment = document.getElementById('btn-submit-payment');
  const btnCloseSuccess = document.getElementById('btn-close-success');
  const btnVerifyTransfer = document.getElementById('btn-verify-transfer');
  const btnPrintReceipt = document.getElementById('btn-print-receipt');
  
  // State variables
  let currentStep = 1;
  let selectedCurrency = 'USD';
  let currencySymbol = '$';
  let donationAmount = 25;
  let donationFrequency = 'One-Time';
  let donorName = '';
  let donorEmail = '';
  let isAnonymous = false;
  let isDedicated = false;
  let dedicatedName = '';
  let selectedPaymentMethod = 'card';
  let activeCoin = 'BTC';

  // Currency Exchange Rates (Simulated for dynamic calculations)
  const exchangeRates = {
    USD: 1.0,
    NGN: 1600.0,
    EUR: 0.92,
    GBP: 0.78
  };

  // Crypto conversion rates
  const cryptoRates = {
    BTC: 0.000017,
    ETH: 0.00033,
    USDT: 1.0
  };

  const presetTemplates = {
    USD: [10, 25, 50, 100],
    NGN: [15000, 40000, 80000, 150000],
    EUR: [10, 25, 50, 100],
    GBP: [10, 25, 50, 100]
  };

  // --- Dynamic Impact Calculator ---
  const updateImpactText = (amountInSelectedCurrency) => {
    // Convert to USD equivalent to evaluate thresholds
    const rate = exchangeRates[selectedCurrency];
    const amountInUSD = amountInSelectedCurrency / rate;
    const impactTextElement = document.getElementById('donation-impact-text');
    let text = '';

    if (amountInUSD < 15) {
      text = `Your ${currencySymbol}${amountInSelectedCurrency.toLocaleString()} contribution helps supply snacks and water during field outreaches.`;
    } else if (amountInUSD >= 15 && amountInUSD < 35) {
      text = `Your ${currencySymbol}${amountInSelectedCurrency.toLocaleString()} contribution provides textbooks, bags, and writing materials for a child.`;
    } else if (amountInUSD >= 35 && amountInUSD < 75) {
      text = `Your ${currencySymbol}${amountInSelectedCurrency.toLocaleString()} contribution sponsors a family welfare food package for a month.`;
    } else if (amountInUSD >= 75 && amountInUSD < 150) {
      text = `Your ${currencySymbol}${amountInSelectedCurrency.toLocaleString()} contribution funds skill acquisition training (e.g. sewing or baking tools) for a youth.`;
    } else {
      text = `Your ${currencySymbol}${amountInSelectedCurrency.toLocaleString()} contribution sponsors full grassroots medical support outreaches or youth business start-up grants.`;
    }
    impactTextElement.innerText = text;
  };

  // Toggle Modal Visibility
  const openDonationModal = () => {
    donationOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetWizard();
  };

  const closeDonationModal = () => {
    donationOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  donateTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openDonationModal();
    });
  });

  donationClose.addEventListener('click', closeDonationModal);
  donationOverlay.addEventListener('click', (e) => {
    if (e.target === donationOverlay) {
      closeDonationModal();
    }
  });

  // --- Wizard Navigation Helpers ---
  const showStep = (stepNumber) => {
    steps.forEach(step => step.classList.remove('active'));
    document.getElementById(`donate-step-${stepNumber}`).classList.add('active');
    currentStep = stepNumber;
    
    // Update progress indicator dots
    stepDots.forEach((dot, index) => {
      const dotStep = parseInt(dot.getAttribute('data-step'), 10);
      dot.classList.remove('active', 'completed');
      
      if (dotStep === stepNumber) {
        dot.classList.add('active');
      } else if (dotStep < stepNumber) {
        dot.classList.add('completed');
      }
    });

    // Scroll to top of modal on step change
    donationModal.scrollTop = 0;
  };

  const resetWizard = () => {
    currentStep = 1;
    selectedCurrency = 'USD';
    currencySymbol = '$';
    donationAmount = 25;
    donationFrequency = 'One-Time';
    donorName = '';
    donorEmail = '';
    isAnonymous = false;
    isDedicated = false;
    dedicatedName = '';
    selectedPaymentMethod = 'card';
    activeCoin = 'BTC';

    // Reset UI Inputs
    document.getElementById('custom-amount-input').value = '';
    document.getElementById('donor-name').value = '';
    document.getElementById('donor-email').value = '';
    document.getElementById('donor-anonymous').checked = false;
    document.getElementById('donor-dedicated').checked = false;
    document.getElementById('donor-dedicated-name').value = '';
    document.getElementById('dedicated-name-group').style.display = 'none';

    // Payment Methods Reset
    document.getElementById('card-number').value = '';
    document.getElementById('card-expiry').value = '';
    document.getElementById('card-cvc').value = '';
    document.getElementById('crypto-hash').value = '';
    
    // Preview card resets
    document.getElementById('card-number-display').innerText = '•••• •••• •••• ••••';
    document.getElementById('card-name-display').innerText = 'YOUR NAME';
    document.getElementById('card-expiry-display').innerText = 'MM/YY';
    document.getElementById('card-logo').innerText = 'Card';

    // Set active states on presets and tabs
    document.getElementById('freq-one-time').click();
    document.querySelector('.currency-btn[data-currency="USD"]').click();
    document.querySelector('.payment-tab[data-method="card"]').click();
    document.querySelector('.crypto-coin-btn[data-coin="BTC"]').click();
    
    showStep(1);
  };

  // --- Step 1 Events ---
  // Frequency buttons
  const freqBtns = document.querySelectorAll('.freq-btn');
  freqBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      freqBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      donationFrequency = e.target.id === 'freq-one-time' ? 'One-Time' : 'Monthly';
    });
  });

  // Currency select
  const currencyBtns = document.querySelectorAll('.currency-btn');
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currencyBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      selectedCurrency = e.target.getAttribute('data-currency');
      currencySymbol = e.target.getAttribute('data-symbol');
      
      // Update custom input label symbol
      document.getElementById('current-currency-symbol').innerText = currencySymbol;
      
      // Re-populate presets
      const presets = presetTemplates[selectedCurrency];
      const presetContainer = document.getElementById('preset-amounts');
      presetContainer.innerHTML = '';
      
      presets.forEach((val, idx) => {
        const pBtn = document.createElement('button');
        pBtn.className = 'preset-btn';
        if (idx === 1) pBtn.className += ' active'; // default second value
        pBtn.setAttribute('data-amount', val);
        pBtn.innerText = currencySymbol + val.toLocaleString();
        
        pBtn.addEventListener('click', (ev) => {
          document.querySelectorAll('.preset-btn').forEach(pb => pb.classList.remove('active'));
          ev.target.classList.add('active');
          document.getElementById('custom-amount-input').value = '';
          donationAmount = parseFloat(ev.target.getAttribute('data-amount'));
          updateImpactText(donationAmount);
        });
        presetContainer.appendChild(pBtn);
      });
      
      // Default to the second preset
      donationAmount = presets[1];
      updateImpactText(donationAmount);
    });
  });

  // Custom amount input
  const customAmountInput = document.getElementById('custom-amount-input');
  customAmountInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    
    // Remove active class from preset buttons
    document.querySelectorAll('.preset-btn').forEach(pb => pb.classList.remove('active'));
    
    if (!isNaN(val) && val > 0) {
      donationAmount = val;
    } else {
      donationAmount = 0;
    }
    updateImpactText(donationAmount);
  });

  // Step 1 validation
  btnNext1.addEventListener('click', () => {
    if (donationAmount <= 0) {
      alert('Please select or enter a valid donation amount.');
      return;
    }
    showStep(2);
  });

  // --- Step 2 Events ---
  // Dedicated check
  const dedicatedCheckbox = document.getElementById('donor-dedicated');
  const dedicatedGroup = document.getElementById('dedicated-name-group');
  dedicatedCheckbox.addEventListener('change', (e) => {
    isDedicated = e.target.checked;
    dedicatedGroup.style.display = isDedicated ? 'block' : 'none';
  });

  // Step 2 validation
  btnNext2.addEventListener('click', () => {
    donorName = document.getElementById('donor-name').value.trim();
    donorEmail = document.getElementById('donor-email').value.trim();
    isAnonymous = document.getElementById('donor-anonymous').checked;
    dedicatedName = document.getElementById('donor-dedicated-name').value.trim();

    if (!donorName) {
      alert('Please enter your full name.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(donorEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (isDedicated && !dedicatedName) {
      alert("Please enter the honoree's name.");
      return;
    }

    // Prepare Step 3 details (conversions & bank refs)
    prepareStep3Details();
    showStep(3);
  });

  btnPrev2.addEventListener('click', () => {
    showStep(1);
  });

  // --- Step 3 Events & Payments Configuration ---
  const paymentTabs = document.querySelectorAll('.payment-tab');
  const paymentContents = document.querySelectorAll('.payment-content');

  paymentTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      paymentTabs.forEach(t => t.classList.remove('active'));
      paymentContents.forEach(c => c.classList.remove('active'));
      
      const targetTab = e.currentTarget;
      targetTab.classList.add('active');
      
      selectedPaymentMethod = targetTab.getAttribute('data-method');
      document.getElementById(`payment-content-${selectedPaymentMethod}`).classList.add('active');
    });
  });

  // Credit Card Live Input Formatting
  const cardNumberInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvcInput = document.getElementById('card-cvc');

  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    e.target.value = formattedValue;
    
    // Update preview
    document.getElementById('card-number-display').innerText = formattedValue || '•••• •••• •••• ••••';
    
    // Logo detection
    const logoElement = document.getElementById('card-logo');
    if (value.startsWith('4')) {
      logoElement.innerText = 'Visa';
    } else if (value.startsWith('5')) {
      logoElement.innerText = 'Mastercard';
    } else if (value.startsWith('3')) {
      logoElement.innerText = 'Amex';
    } else {
      logoElement.innerText = 'Card';
    }
  });

  document.getElementById('donor-name').addEventListener('input', (e) => {
    document.getElementById('card-name-display').innerText = e.target.value.toUpperCase() || 'YOUR NAME';
  });

  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
      e.target.value = value;
    }
    document.getElementById('card-expiry-display').innerText = e.target.value || 'MM/YY';
  });

  // Crypto coin switcher
  const cryptoCoinBtns = document.querySelectorAll('.crypto-coin-btn');
  cryptoCoinBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      cryptoCoinBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCoin = e.target.getAttribute('data-coin');
      
      // Update Recipient Address and conversions
      updateCryptoValues();
    });
  });

  const updateCryptoValues = () => {
    // recipient addresses
    const cryptoAddresses = {
      BTC: 'bc1qxy2kgdygjrsqtzq5n0yrf2493p83kkfjhx0wlh',
      ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      USDT: 'TYHC5jU4X85sdsKkF95hRtr93pkkJHSXl023l'
    };

    // Convert donation amount to USD first
    const rate = exchangeRates[selectedCurrency];
    const amountInUSD = donationAmount / rate;
    
    // Converted crypto amount
    const cryptoFactor = cryptoRates[activeCoin];
    const convertedVal = (amountInUSD * cryptoFactor).toFixed(activeCoin === 'USDT' ? 2 : 6);
    
    document.getElementById('crypto-converted-amount').innerText = `${convertedVal} ${activeCoin}`;
    document.getElementById('crypto-address-val').innerText = cryptoAddresses[activeCoin];
  };

  // GTBank official multi-currency accounts mapping
  const gtBankAccounts = {
    NGN: '3001351567',
    USD: '3001351677',
    GBP: '3001351581',
    EUR: '3001351608'
  };

  const updateBankAccountDisplay = (curr) => {
    const targetCurr = gtBankAccounts[curr] ? curr : 'NGN';
    const accNum = gtBankAccounts[targetCurr];
    const accElem = document.getElementById('bank-acc-num');
    const tagElem = document.getElementById('bank-acc-curr-tag');
    if (accElem) accElem.innerText = accNum;
    if (tagElem) tagElem.innerText = targetCurr;

    // Update active state on modal currency tabs
    document.querySelectorAll('.modal-curr-tab').forEach(tab => {
      if (tab.getAttribute('data-bank-curr') === targetCurr) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  };

  // Modal currency switcher tab buttons
  document.querySelectorAll('.modal-curr-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const curr = e.currentTarget.getAttribute('data-bank-curr');
      updateBankAccountDisplay(curr);
    });
  });

  const prepareStep3Details = () => {
    // Generate Bank Ref code
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomRef = 'KESF-';
    for (let i = 0; i < 6; i++) {
      randomRef += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    const bankRefElem = document.getElementById('bank-ref-code');
    const warnRefElem = document.getElementById('warning-ref-code');
    if (bankRefElem) bankRefElem.innerText = randomRef;
    if (warnRefElem) warnRefElem.innerText = randomRef;

    // Sync bank account with selected currency
    updateBankAccountDisplay(selectedCurrency);
    
    // Update crypto rates
    updateCryptoValues();
  };

  // Enhanced Clipboard copy functions with fallback and visual feedback
  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(textarea);
  };

  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-copy-target');
      const targetElem = document.getElementById(targetId);
      if (!targetElem) return;
      const textVal = targetElem.innerText.trim();
      
      const setCopied = () => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>✔️ Copied!</span>';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove('copied');
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textVal).then(setCopied).catch(() => {
          fallbackCopy(textVal);
          setCopied();
        });
      } else {
        fallbackCopy(textVal);
        setCopied();
      }
    });
  });

  // Verify Bank Transfer
  btnVerifyTransfer.addEventListener('click', () => {
    btnVerifyTransfer.disabled = true;
    btnVerifyTransfer.innerText = 'Verifying transfer logs with bank...';
    
    // Simulate automated bank API verification
    setTimeout(() => {
      btnVerifyTransfer.disabled = false;
      btnVerifyTransfer.innerText = 'I Have Made the Transfer';
      
      // Proceeds to step 4 receipt screen
      generateReceipt();
      showStep(4);
    }, 2500);
  });

  // Step 3 Actions
  btnPrev3.addEventListener('click', () => {
    showStep(2);
  });

  btnSubmitPayment.addEventListener('click', () => {
    const errorBox = document.getElementById('checkout-error');
    errorBox.style.display = 'none';

    if (selectedPaymentMethod === 'card') {
      const cardNum = cardNumberInput.value.replace(/\s+/g, '');
      const expiry = cardExpiryInput.value;
      const cvc = cardCvcInput.value;

      if (cardNum.length < 16) {
        errorBox.innerText = 'Please enter a valid 16-digit card number.';
        errorBox.style.display = 'block';
        return;
      }
      
      const expPattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if (!expPattern.test(expiry)) {
        errorBox.innerText = 'Please enter expiration date in MM/YY format.';
        errorBox.style.display = 'block';
        return;
      }

      if (cvc.length < 3) {
        errorBox.innerText = 'Please enter a valid CVC code.';
        errorBox.style.display = 'block';
        return;
      }
    } else if (selectedPaymentMethod === 'crypto') {
      const hash = document.getElementById('crypto-hash').value.trim();
      if (!hash) {
        errorBox.innerText = 'Please enter your Transaction Hash (TxID) to verify payment.';
        errorBox.style.display = 'block';
        return;
      }
    }

    // Simulate payment processing loader
    btnSubmitPayment.disabled = true;
    const prevBtnText = btnSubmitPayment.innerText;
    btnSubmitPayment.innerText = 'Processing Donation...';

    setTimeout(() => {
      btnSubmitPayment.disabled = false;
      btnSubmitPayment.innerText = prevBtnText;
      
      generateReceipt();
      showStep(4);
    }, 2000);
  });

  // --- Step 4 Events ---
  const generateReceipt = () => {
    const receiptNum = 'KESF-REC-' + Math.floor(100000 + Math.random() * 900000);
    const dateObj = new Date();
    const formattedDate = dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
    
    document.getElementById('receipt-num').innerText = receiptNum;
    document.getElementById('receipt-date').innerText = formattedDate;
    document.getElementById('receipt-donor').innerText = isAnonymous ? 'Anonymous Benefactor' : donorName;
    
    let methodText = '';
    if (selectedPaymentMethod === 'card') {
      const logoText = document.getElementById('card-logo').innerText;
      methodText = `Card (${logoText})`;
    } else if (selectedPaymentMethod === 'bank') {
      methodText = 'Bank Transfer';
    } else if (selectedPaymentMethod === 'crypto') {
      methodText = `Crypto (${activeCoin})`;
    }
    
    document.getElementById('receipt-method').innerText = methodText;
    document.getElementById('receipt-freq').innerText = donationFrequency;
    document.getElementById('receipt-amount').innerText = `${currencySymbol}${donationAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };

  btnPrintReceipt.addEventListener('click', () => {
    window.print();
  });

  btnCloseSuccess.addEventListener('click', () => {
    closeDonationModal();
  });

  // =========================================================================
  // Image Lightbox System (Football Academy & Staff Team Gallery)
  // =========================================================================
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentGalleryItems = [];
  let currentImageIndex = 0;

  const openLightbox = (items, index) => {
    currentGalleryItems = items;
    currentImageIndex = index;
    updateLightboxContent();
    lightboxOverlay.classList.add('active');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxOverlay.classList.remove('active');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const updateLightboxContent = () => {
    if (!currentGalleryItems || currentGalleryItems.length === 0) return;
    const item = currentGalleryItems[currentImageIndex];
    const src = item.getAttribute('data-src') || item.querySelector('img')?.src;
    const caption = item.getAttribute('data-caption') || item.querySelector('img')?.alt || '';

    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';

    setTimeout(() => {
      lightboxImg.src = src;
      lightboxCaption.innerHTML = `<strong>(${currentImageIndex + 1}/${currentGalleryItems.length})</strong> ${caption}`;
      lightboxImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 120);

    // Show/hide navigation if single item
    if (currentGalleryItems.length <= 1) {
      lightboxPrev.style.display = 'none';
      lightboxNext.style.display = 'none';
    } else {
      lightboxPrev.style.display = 'flex';
      lightboxNext.style.display = 'flex';
    }
  };

  const showNextImage = () => {
    if (currentGalleryItems.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentGalleryItems.length;
    updateLightboxContent();
  };

  const showPrevImage = () => {
    if (currentGalleryItems.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    updateLightboxContent();
  };

  // Register click listeners for academy gallery
  const academyItems = Array.from(document.querySelectorAll('#academy-gallery .gallery-item'));
  academyItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      openLightbox(academyItems, idx);
    });
  });

  // Register click listeners for staff team pictures
  const teamItems = Array.from(document.querySelectorAll('.team-img-wrapper'));
  teamItems.forEach((item, idx) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      openLightbox(teamItems, idx);
    });
  });

  // Lightbox controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  // Close on backdrop click
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightboxOverlay || !lightboxOverlay.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    }
  });

  // Touch swipe support for Lightbox on mobile
  let touchStartX = 0;
  let touchEndX = 0;
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxOverlay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) {
        showNextImage();
      }
      if (touchEndX > touchStartX + 40) {
        showPrevImage();
      }
    }, { passive: true });
  }
});

