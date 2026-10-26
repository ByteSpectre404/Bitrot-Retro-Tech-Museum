/**
 * ============================================================================
 * THE BITROT MUSEUM OF RETRO TECHNOLOGY — MASTER JAVASCRIPT ENGINE
 * ============================================================================
 * Modular architecture:
 * 1. Web Audio API 8-Bit Synthesizer Engine
 * 2. Clock & Global System Telemetry
 * 3. Mobile Navigation & Accessibility Traps
 * 4. Page 1: Lobby Interactive Systems (Boot Sequence, Timeline, Visitor Counter, Konami Code)
 * 5. Page 2: Exhibits Catalogue & Accession Modal Dossier
 * 6. Page 3: Visit Cartography, Ticket Generator & Magnetic Guestbook
 * ============================================================================
 */

(function () {
  'use strict';

  /* ========================================================================= */
  /* 0. SAFE STORAGE ENGINE (OFFLINE / FILE:// / PRIVATE MODE RESILIENT)      */
  /* ========================================================================= */
  const SafeStorage = (function () {
    const memory = {};
    return {
      getItem: function (key) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
          }
        } catch (e) {
          // Fallback to memory
        }
        return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
      },
      setItem: function (key, value) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, String(value));
          }
        } catch (e) {
          // Fallback to memory
        }
        memory[key] = String(value);
      },
      removeItem: function (key) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        } catch (e) {
          // Fallback to memory
        }
        delete memory[key];
      }
    };
  })();

  /* ========================================================================= */
  /* 1. WEB AUDIO API 8-BIT SYNTHESIZER ENGINE                                 */
  /* ========================================================================= */
  const AudioEngine = (function () {
    const STORAGE_KEY = 'bitrot_audio_active';
    let isEnabled = SafeStorage.getItem(STORAGE_KEY) === 'true'; // Remember choice
    let audioCtx = null;

    function getContext() {
      try {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        return audioCtx;
      } catch (e) {
        return null;
      }
    }

    /**
     * Synthesize an 8-bit chip tone
     * @param {number} freq - Frequency in Hz
     * @param {string} type - 'square' | 'triangle' | 'sawtooth'
     * @param {number} duration - Seconds
     * @param {number} volume - 0 to 1
     */
    function playTone(freq = 440, type = 'square', duration = 0.05, volume = 0.1) {
      if (!isEnabled) return;
      try {
        const ctx = getContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio policy or context error
      }
    }

    function blipHover() {
      playTone(880, 'triangle', 0.02, 0.04);
    }

    function blipClick() {
      playTone(587, 'square', 0.05, 0.08);
    }

    function blipSuccess() {
      playTone(523, 'square', 0.07, 0.1);
      setTimeout(() => playTone(659, 'square', 0.07, 0.1), 70);
      setTimeout(() => playTone(784, 'square', 0.09, 0.1), 140);
      setTimeout(() => playTone(1046, 'square', 0.18, 0.12), 210);
    }

    function blipError() {
      playTone(160, 'sawtooth', 0.12, 0.15);
      setTimeout(() => playTone(130, 'sawtooth', 0.15, 0.15), 100);
    }

    function blipDriveMotor() {
      playTone(180, 'sawtooth', 0.12, 0.12);
      setTimeout(() => playTone(150, 'triangle', 0.15, 0.12), 100);
      setTimeout(() => playTone(220, 'square', 0.1, 0.08), 220);
    }

    function toggleAudio() {
      isEnabled = !isEnabled;
      SafeStorage.setItem(STORAGE_KEY, isEnabled ? 'true' : 'false');
      if (isEnabled) {
        blipSuccess();
      }
      updateUI();
      return isEnabled;
    }

    function updateUI() {
      const toggleButtons = document.querySelectorAll('.btn-toggle-sound');
      toggleButtons.forEach(btn => {
        const label = btn.querySelector('.sound-label') || btn;
        if (isEnabled) {
          btn.classList.add('sound-on');
          label.textContent = '[AUDIO: ON]';
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('sound-on');
          label.textContent = '[AUDIO: OFF]';
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    }

    return {
      playTone,
      blipHover,
      blipClick,
      blipSuccess,
      blipError,
      blipDriveMotor,
      toggleAudio,
      updateUI,
      isEnabled: () => isEnabled
    };
  })();

  window.AudioEngine = AudioEngine;

  /* ========================================================================= */
  /* 2. CLOCK & GLOBAL SYSTEM TELEMETRY                                        */
  /* ========================================================================= */
  function initMuseumClock() {
    const clockElements = document.querySelectorAll('.museum-live-time');
    function tick() {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      const timeStr = `${h}:${m}:${s} UTC`;
      clockElements.forEach(el => {
        el.textContent = `MUSEUM TIME: ${timeStr}`;
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ========================================================================= */
  /* 3. MOBILE NAVIGATION & ACCESSIBILITY TRAPS                                */
  /* ========================================================================= */
  function initNavigation() {
    const mobileToggle = document.getElementById('btn-mobile-nav-toggle');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileClose = document.getElementById('btn-mobile-nav-close');

    if (mobileToggle && mobileOverlay) {
      mobileToggle.addEventListener('click', function () {
        AudioEngine.blipClick();
        mobileOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (mobileClose && mobileOverlay) {
      mobileClose.addEventListener('click', function () {
        AudioEngine.blipClick();
        mobileOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    }

    // Attach audio to sound toggles
    document.querySelectorAll('.btn-toggle-sound').forEach(btn => {
      btn.addEventListener('click', function () {
        AudioEngine.toggleAudio();
      });
    });
    AudioEngine.updateUI();

    // Attach hover sound to all interactive elements
    document.querySelectorAll('button, a.nav-link, .timeline-node-btn, .filter-toggle-btn, .specimen-card').forEach(el => {
      el.addEventListener('mouseenter', () => AudioEngine.blipHover());
      if (!el.classList.contains('specimen-card')) {
        el.addEventListener('click', () => AudioEngine.blipClick());
      }
    });
  }

  /* ========================================================================= */
  /* 4. PAGE 1: LOBBY INTERACTIVE SYSTEMS                                      */
  /* ========================================================================= */
  function initLobbyPage() {
    // A. CRT Boot Sequence (Memory counter & typed BIOS lines)
    const memCounterEl = document.getElementById('crt-mem-counter');
    if (memCounterEl) {
      let currentMem = 0;
      const targetMem = 640;
      const interval = setInterval(() => {
        currentMem += 64;
        if (currentMem >= targetMem) {
          currentMem = targetMem;
          memCounterEl.textContent = `SYSTEM RAM CHECK: ${currentMem}K OK`;
          clearInterval(interval);
        } else {
          memCounterEl.textContent = `SYSTEM RAM CHECK: ${currentMem}K ...`;
        }
      }, 70);
    }

    // Ping hardware memory button
    const btnPing = document.getElementById('btn-ping-memory');
    if (btnPing) {
      btnPing.addEventListener('click', () => {
        AudioEngine.blipSuccess();
      });
    }

    // Floppy drive motor sound button
    const btnDrive = document.getElementById('btn-drive-sound');
    if (btnDrive) {
      btnDrive.addEventListener('click', () => {
        AudioEngine.blipDriveMotor();
      });
    }

    // B. Interactive Horizontal Timeline
    const timelineData = {
      '1977': {
        title: 'Atari 2600 Video Computer System (1977)',
        accession: 'RTM-1977-001',
        status: 'CARTRIDGE BUS FUNCTIONAL',
        provenance: 'SUNNYVALE, CA // MOS 6507',
        text: 'Popularized microprocessor-based gaming consoles with interchangeable ROM cartridges. Solid faux woodgrain fascia, metal switches, and the iconic single-button CX40 joystick.',
        specs: 'MEDIA: 2KB/4KB ROM // RAM: 128 BYTES // VIDEO: 160×192 TIA'
      },
      '1979': {
        title: 'Sony Walkman TPS-L2 (1979)',
        accession: 'RTM-1979-004',
        status: 'SERVO CALIBRATED',
        provenance: 'TOKYO, JAPAN // DUAL 3.5MM',
        text: 'The blueprint for personal mobile audio. Features distinct blue and silver chassis with a mechanical "Hot Line" microphone override button allowing listeners to speak without removing headphones.',
        specs: 'MEDIA: COMPACT CASSETTE // POWER: 2X AA CELLS // WEIGHT: 390G'
      },
      '1981': {
        title: 'IBM Personal Computer Model 5150 (1981)',
        accession: 'RTM-1981-008',
        status: 'MDA DISPLAY CALIBRATED',
        provenance: 'BOCA RATON, FL // INTEL 8088',
        text: 'The watershed platform that established open architecture standards in business. Launched with PC-DOS 1.0 and mechanical buckling-spring keyboard.',
        specs: 'CLOCK: 4.77 MHZ // RAM: 16KB-640KB // OS: PC-DOS 1.0'
      },
      '1982': {
        title: 'Commodore 64 Home Microcomputer (1982)',
        accession: 'RTM-1982-012',
        status: 'SID 6581 CHIP TESTED OK',
        provenance: 'WEST CHESTER, PA // MOS 6510',
        text: 'The highest-selling single computer model of all time. Celebrated for the MOS Technology 6581 SID sound synthesizer chip, creating a generation of chiptune demoscene musicians and bedroom programmers.',
        specs: 'RAM: 64KB // SOUND: 3-VOICE SID 6581 // GRAPHICS: VIC-II'
      },
      '1984': {
        title: 'Apple Macintosh 128K (1984)',
        accession: 'RTM-1984-001',
        status: 'OPERATIONAL / ORIGINAL BIOS',
        provenance: 'CUPERTINO, CA // MOTOROLA 68000',
        text: 'Brought bitmapped graphical user interface, desktop metaphors, windows, icons, and mouse manipulation into commercial reality. Integrated 9-inch 512×342 monochrome CRT display with zero cooling fans.',
        specs: 'MEDIA FORMAT: 400KB MFM DISK // CLOCK: 7.8336 MHZ // VOLTAGE: 120V AC'
      },
      '1989': {
        title: 'Nintendo Game Boy DMG-01 (1989)',
        accession: 'RTM-1989-009',
        status: 'PEA-SOUP LCD RESTORED',
        provenance: 'KYOTO, JAPAN // SHARP SM83',
        text: 'Engineered by Gunpei Yokoi using the philosophy of "lateral thinking with withered technology." Sacrificed active backlighting for 30-hour battery life on 4 AA cells, conquering global gaming culture.',
        specs: 'LCD: 160×144 STN // BATTERY: 4X AA // CHIP: Z80-DERIVED 4.19 MHZ'
      },
      '1996': {
        title: 'Bandai Tamagotchi Gen 1 (1996)',
        accession: 'RTM-1996-003',
        status: 'PIEZO BUZZER ACTIVE',
        provenance: 'TOKYO, JAPAN // 4-BIT MCU',
        text: 'A cultural phenomenon introducing digital life, emotional bonding, and synthetic grief to millions. Packed a tiny 32x16 pixel matrix LCD into an egg-shaped keychain requiring perpetual maternal vigilance.',
        specs: 'SCREEN: 32×16 MATRIX // BATTERY: CR2032 // CONTROLS: 3 BUTTONS'
      },
      '2000': {
        title: 'Nokia 3310 Cellular Transceiver (2000)',
        accession: 'RTM-2000-001',
        status: 'STRUCTURAL INTEGRITY: INDESTRUCTIBLE',
        provenance: 'ESPOO, FINLAND // DUAL BAND',
        text: 'Famous for extreme chassis durability and the monophonic Snake II game. Shipped over 126 million units with user-swappable Xpress-on fascia covers and an embedded vibrating motor.',
        specs: 'SCREEN: 84×48 MONO // NETWORK: GSM 900/1800 // BATTERY: 900MAH NIMH'
      }
    };

    const timelineNodes = document.querySelectorAll('.timeline-node-btn');
    const pTitle = document.getElementById('timeline-p-title');
    const pAccession = document.getElementById('timeline-p-accession');
    const pProv = document.getElementById('timeline-p-prov');
    const pText = document.getElementById('timeline-p-text');
    const pSpecs = document.getElementById('timeline-p-specs');
    const pStatus = document.getElementById('timeline-p-status');

    function activateTimeline(year) {
      const yearStr = String(year);
      timelineNodes.forEach(n => {
        if (n.getAttribute('data-year') === yearStr) {
          n.classList.add('is-active');
        } else {
          n.classList.remove('is-active');
        }
      });
      const data = timelineData[yearStr];
      if (data) {
        if (pTitle) pTitle.textContent = data.title;
        if (pAccession) pAccession.textContent = `ACCESSION: ${data.accession}`;
        if (pProv) pProv.textContent = data.provenance;
        if (pText) pText.textContent = data.text;
        if (pSpecs) pSpecs.textContent = data.specs;
        if (pStatus) pStatus.textContent = data.status;
      }
    }

    // Expose globally for inline onclick and direct calls
    window.selectTimelineYear = function (year) {
      AudioEngine.blipClick();
      activateTimeline(year);
    };

    timelineNodes.forEach(node => {
      const year = node.getAttribute('data-year');
      node.addEventListener('click', () => {
        AudioEngine.blipClick();
        activateTimeline(year);
      });
      node.addEventListener('focus', () => activateTimeline(year));
    });

    // Document-level event delegation for timeline nodes
    document.addEventListener('click', function (e) {
      const node = e.target.closest('.timeline-node-btn');
      if (node) {
        const year = node.getAttribute('data-year');
        if (year) {
          AudioEngine.blipClick();
          activateTimeline(year);
        }
      }
    });

    // C. Arcade High-Score Table Visitor Counter
    const visitorEl = document.getElementById('visitor-tally-num');
    const btnBump = document.getElementById('btn-bump-visitor');
    const STORAGE_VISITORS = 'bitrot_visitor_count';

    let visitorCount = parseInt(SafeStorage.getItem(STORAGE_VISITORS) || '427', 10);
    if (isNaN(visitorCount)) visitorCount = 427;
    if (visitorEl) visitorEl.textContent = visitorCount;

    if (btnBump) {
      btnBump.addEventListener('click', () => {
        visitorCount += 1;
        SafeStorage.setItem(STORAGE_VISITORS, visitorCount.toString());
        if (visitorEl) visitorEl.textContent = visitorCount;
        AudioEngine.blipSuccess();
      });
    }

    // D. Konami Code Easter Egg
    const konamiSequence = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let konamiIdx = 0;

    window.addEventListener('keydown', (e) => {
      if (e.code === konamiSequence[konamiIdx]) {
        AudioEngine.playTone(300 + konamiIdx * 80, 'square', 0.05, 0.08);
        konamiIdx++;
        if (konamiIdx === konamiSequence.length) {
          konamiIdx = 0;
          triggerKonamiEasterEgg();
        }
      } else {
        konamiIdx = 0;
      }
    });

    function triggerKonamiEasterEgg() {
      AudioEngine.blipSuccess();
      const toast = document.getElementById('konami-toast');
      if (toast) {
        toast.style.display = 'block';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 7000);
      }
    }

    // E. Staggered Stepped Entrance Animation for 'RECORDS // ARCHIVE METRICS'
    const statsRow = document.querySelector('.stats-table-row');
    if (statsRow) {
      if ('IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              statsRow.classList.add('is-revealed');
              const cards = statsRow.querySelectorAll('.stat-score-card');
              cards.forEach((card, index) => {
                setTimeout(() => {
                  AudioEngine.playTone(420 + index * 90, 'triangle', 0.02, 0.03);
                }, 50 + index * 170);
              });
              statsObserver.unobserve(statsRow);
            }
          });
        }, { threshold: 0.15 });
        statsObserver.observe(statsRow);
      } else {
        statsRow.classList.add('is-revealed');
      }
    }
  }

  /* ========================================================================= */
  /* 5. PAGE 2: EXHIBITS CATALOGUE & ACCESSION MODAL DOSSIER                  */
  /* ========================================================================= */
  function initExhibitsPage() {
    // 9 Authenticated Museum Objects Database
    const specimens = {
      atari2600: {
        id: 'atari2600',
        badge: 'SPECIMEN #01',
        title: 'ATARI 2600 VCS (1977)',
        accession: 'RTM-1977-001',
        category: 'COMPUTING',
        decade: '70s',
        provenance: 'SUNNYVALE, CA',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atari-2600-Wood-4Sw-Set.jpg',
        imageAlt: 'Atari 2600 VCS four-switch woodgrain console with CX40 joystick',
        imageSource: 'Wikimedia Commons (Evan-Amos Public Domain Archive)',
        specs: [
          ['CENTRAL PROCESSING:', 'MOS Technology 6507 @ 1.19 MHz'],
          ['SYSTEM RAM:', '128 Bytes (contained in RIOT 6532 chip)'],
          ['GRAPHICS & SOUND:', 'Television Interface Adaptor (TIA)'],
          ['ROM CARTRIDGE BUS:', '2 KB to 4 KB banks standard'],
          ['CONTROLLER PROTOCOL:', 'DE-9 Joystick Port standard (CX40)']
        ],
        whyMattered: 'Pioneered swappable ROM cartridge gaming, freeing consumer video consoles from hardwired single-game architectures and establishing the commercial home game publishing industry.',
        didYouKnow: 'Over 30 million units were sold worldwide; the CX40 joystick with its solitary orange button remains the foundational icon of early digital play.',
        chips: {
          cpu: 'MOS 6507: Cost-reduced version of the 6502 with 28 pins and 8KB addressable memory space.',
          tia: 'TIA: Custom Television Interface Adaptor generating audio and raster graphics on-the-fly scanline by scanline.',
          riot: 'RIOT 6532: Combined RAM, I/O ports, and interval timer in a single monolithic silicon die.'
        }
      },
      walkman: {
        id: 'walkman',
        badge: 'SPECIMEN #02',
        title: 'SONY WALKMAN TPS-L2 (1979)',
        accession: 'RTM-1979-004',
        category: 'AUDIO',
        decade: '70s',
        provenance: 'TOKYO, JAPAN',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Walkman_TPS-L2.jpg',
        imageAlt: 'Sony Walkman TPS-L2 portable stereo cassette player with dual 3.5mm jacks',
        imageSource: 'Wikimedia Commons (Public Educational Archive)',
        specs: [
          ['TAPE TRANSPORT:', '4-track 2-channel stereo cassette mechanism'],
          ['OUTPUT HEADPHONE JACKS:', 'Dual 3.5mm stereo mini jacks ("GUYS & DOLLS")'],
          ['HOT LINE OVERRIDE:', 'Mechanical microphone attenuation switch'],
          ['POWER SUPPLY:', '2x AA alkaline batteries (approx. 8h run time)'],
          ['CHASSIS COMPOSITION:', 'Molded aluminum & ABS casing with faux leather pouch']
        ],
        whyMattered: 'Transformed audio listening from a collective domestic experience into an individualized, mobile soundtrack, establishing modern headphone culture.',
        didYouKnow: 'Engineered in just four months under Akio Morita and Masaru Ibuka; early marketing avoided the word "Walkman" in the US, temporarily calling it the "Sound-About".',
        chips: {
          motor: 'DC Servo Motor: Precision belt drive mechanism maintaining sub-0.15% wow and flutter.',
          amp: 'Stereo Pre-Amp: Dual-channel discrete transistor equalization for Type I ferric tapes.'
        }
      },
      ibmpc: {
        id: 'ibmpc',
        badge: 'SPECIMEN #03',
        title: 'IBM PERSONAL COMPUTER MODEL 5150 (1981)',
        accession: 'RTM-1981-008',
        category: 'COMPUTING',
        decade: '80s',
        provenance: 'BOCA RATON, FL',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/IBM_PC_5150.jpg',
        imageAlt: 'IBM Personal Computer 5150 with 5151 green phosphor monitor and buckling spring keyboard',
        imageSource: 'Wikimedia Commons (B. Rosen Archive)',
        specs: [
          ['PROCESSOR:', 'Intel 8088 @ 4.77 MHz (16-bit internal, 8-bit bus)'],
          ['SYSTEM MEMORY:', '16 KB onboard, expandable to 640 KB'],
          ['MAGNETIC STORAGE:', 'Dual 5.25" 160KB single-sided floppy disk drives'],
          ['EXPANSION SLOTS:', '5x 8-bit ISA architecture slots'],
          ['LAUNCH OPERATING SYSTEM:', 'PC-DOS 1.0 (Microsoft) / Cassette BASIC in ROM']
        ],
        whyMattered: 'Created under Don Estridge with commercial off-the-shelf components, shattering IBM proprietary development traditions and catalyzing the entire PC-compatible clone market.',
        didYouKnow: 'The IBM buckling spring Model F keyboard built for this system weighed over 5 pounds and remains revered for unmatched mechanical tactile feedback.',
        chips: {
          cpu: 'Intel 8088: 4.77 MHz clock rate chosen so inexpensive color burst crystals from TV manufacturing could be repurposed.',
          dma: 'Intel 8237: Programmable DMA controller handling direct memory transfers without halting the processor.'
        }
      },
      c64: {
        id: 'c64',
        badge: 'SPECIMEN #04',
        title: 'COMMODORE 64 (1982)',
        accession: 'RTM-1982-012',
        category: 'COMPUTING',
        decade: '80s',
        provenance: 'WEST CHESTER, PA',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Commodore-64-Computer-FL.jpg',
        imageAlt: 'Commodore 64 breadbin microcomputer with mechanical keyboard',
        imageSource: 'Wikimedia Commons (Evan-Amos VOGM Archive)',
        specs: [
          ['CENTRAL PROCESSING:', 'MOS Technology 6510 @ 1.023 MHz (NTSC) / 0.985 MHz (PAL)'],
          ['SYSTEM MEMORY:', '64 KB RAM + 20 KB ROM (BASIC 2.0 & KERNAL)'],
          ['SOUND GENERATOR:', 'MOS 6581 SID (3 Oscillators, 4 Waveforms, Resonant Multi-mode Filter)'],
          ['DISPLAY CONTROLLER:', 'MOS 6567/6569 VIC-II (320x200 Hi-Res, 16 Colors, 8 Sprites)'],
          ['PRIMARY STORAGE:', 'Commodore 1541 5.25" Floppy Disk Drive / Datasette C2N Tape']
        ],
        whyMattered: 'The Commodore 64 altered the technological landscape by bypassing specialty computer boutiques entirely—sold directly through department stores, discount warehouses, and toy retailers.',
        didYouKnow: 'Holds the undisputed Guinness World Record for the highest-selling single computer model of all time, with lifetime production estimated between 12.5 and 17 million units between 1982 and 1994.',
        chips: {
          cpu: 'MOS 6510: 8-bit CPU clocked at 1.023 MHz with an on-chip 6-bit parallel I/O port used for tape motor control & bank switching.',
          sid: 'MOS 6581 SID: 3 independently programmable analog audio voices, 4 waveforms, programmable resonant multi-mode analog filter designed by Bob Yannes.',
          vic: 'MOS 6567 VIC-II: Video Interface Chip providing 16 colors, 8 hardware sprites with collision detection, and smooth hardware scrolling.'
        }
      },
      floppy: {
        id: 'floppy',
        badge: 'SPECIMEN #05',
        title: 'SONY 3.5" MICROFLOPPY DISKETTE (1983)',
        accession: 'RTM-1983-002',
        category: 'COMPUTING',
        decade: '80s',
        provenance: 'TOKYO, JAPAN',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Floppy_disk_2009_G1.jpg',
        imageAlt: 'Sony 3.5-inch microfloppy diskette with stamped aluminum protective shutter',
        imageSource: 'Wikimedia Commons (George Shuklin Archive)',
        specs: [
          ['RECORDING MEDIUM:', 'High-coercivity gamma-ferric oxide flexible magnetic substrate'],
          ['FORMATTED CAPACITY:', '720 KB (Double Density) / 1.44 MB (High Density)'],
          ['PROTECTIVE SHUTTER:', 'Spring-loaded stamped aluminum auto-sliding shutter'],
          ['ROTATIONAL SPEED:', '300 RPM Direct Drive spindle interface'],
          ['WRITE PROTECTION:', 'Mechanical sliding aperture tab (open = write protected)']
        ],
        whyMattered: 'Replaced fragile, exposed 5.25-inch paper diskettes with a durable shirt-pocket format that became the universal software distribution standard throughout the 80s and 90s.',
        didYouKnow: 'Though physical production ceased for mainstream computers decades ago, the 3.5" diskette remains permanently immortalized as the universal virtual save icon across digital interfaces worldwide.',
        chips: {
          shutter: 'Auto-shutter: Spring-loaded stamped aluminum protector prevents fingerprints and dust accumulation.',
          notch: 'Write-Protect Notch: Mechanical slide hole detected by microswitch or optical sensor in drive bay.'
        }
      },
      mac128k: {
        id: 'mac128k',
        badge: 'SPECIMEN #06',
        title: 'APPLE MACINTOSH 128K (1984)',
        accession: 'RTM-1984-001',
        category: 'COMPUTING',
        decade: '80s',
        provenance: 'CUPERTINO, CA',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Macintosh_128k_transparency.png',
        imageAlt: 'Apple Macintosh 128K computer with 9-inch monochrome CRT and 400KB floppy slot',
        imageSource: 'Wikimedia Commons (All-About-Apple Museum)',
        specs: [
          ['CENTRAL PROCESSING:', 'Motorola 68000 @ 7.83 MHz (32-bit internal architecture)'],
          ['SYSTEM MEMORY:', '128 KB DRAM (non-expandable) + 64 KB ROM (QuickDraw)'],
          ['INTERNAL DISPLAY:', '9-inch 512x342 1-bit monochrome CRT (72 PPI square pixels)'],
          ['PRIMARY INPUT:', 'Single-button optomechanical DB-9 mouse & mechanical keyboard'],
          ['ACOUSTIC PROFILE:', 'Zero cooling fans; silent convection airflow cooling']
        ],
        whyMattered: 'Brought the bitmapped graphical user interface, desktop metaphors, windows, icons, and mouse manipulation into commercial reality, establishing desktop publishing standards.',
        didYouKnow: 'Molded directly into the interior plastic of the rear case are the cast relief signatures of Steve Jobs, Steve Wozniak, Bill Atkinson, and the original Mac team.',
        chips: {
          cpu: 'Motorola 68000: Powerful 32-bit internal register architecture capable of rendering bitmapped UI primitives at high speed.',
          rom: '64KB ROM: Encoded Bill Atkinson QuickDraw graphics routines directly into firmware for instant window blitting.'
        }
      },
      gameboy: {
        id: 'gameboy',
        badge: 'SPECIMEN #07',
        title: 'NINTENDO GAME BOY DMG-01 (1989)',
        accession: 'RTM-1989-009',
        category: 'HANDHELD',
        decade: '80s',
        provenance: 'KYOTO, JAPAN',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Game-Boy-Original.jpg',
        imageAlt: 'Original Nintendo Game Boy DMG-01 with reflective 4-shade LCD screen',
        imageSource: 'Wikimedia Commons (Evan-Amos VOGM Collection)',
        specs: [
          ['CENTRAL PROCESSING:', 'Sharp SM83 custom 8-bit core (Z80/8080 hybrid) @ 4.19 MHz'],
          ['DISPLAY MATRIX:', '160x144 STN reflective monochrome LCD (4 shades of olive)'],
          ['AUDIO HARDWARE:', '4-channel stereo PSG (2 pulse, 1 wave, 1 pseudo-random noise)'],
          ['POWER ENDURANCE:', '30+ continuous hours on 4x AA alkaline cells'],
          ['MEDIA FORMAT:', 'Game Pak ROM cartridge (32 KB to 8 MB with MBC mapper)']
        ],
        whyMattered: 'Gunpei Yokoi philosophy of "Lateral Thinking with Withered Technology" prioritized extreme battery life and physical durability over backlit color, triumphing over all technologically superior rivals.',
        didYouKnow: 'A Game Boy survived a barracks bombing during the 1991 Gulf War; though charred and blistered, its motherboard still booted Tetris perfectly.',
        chips: {
          sm83: 'Sharp SM83: Efficient 8-bit hybrid microprocessor combining Z80 registers with Intel 8080 instruction timing.',
          link: 'Game Link Port: Serial communications port allowing 2 to 4 consoles to connect for multiplayer sessions.'
        }
      },
      tamagotchi: {
        id: 'tamagotchi',
        badge: 'SPECIMEN #08',
        title: 'BANDAI TAMAGOTCHI GEN 1 (1996)',
        accession: 'RTM-1996-003',
        category: 'HANDHELD',
        decade: '90s',
        provenance: 'TOKYO, JAPAN',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamagotchis.jpg',
        imageAlt: 'Authentic first-generation Bandai Tamagotchi keychains with dot-matrix LCDs',
        imageSource: 'Wikimedia Commons (Public Archive)',
        specs: [
          ['SCREEN MATRIX:', '32 x 16 Dot Matrix monochrome LCD with icon status borders'],
          ['CONTROLLER INPUTS:', '3 microswitch tactile dome buttons (A: Select, B: Execute, C: Cancel)'],
          ['PROCESSING UNIT:', '4-bit low-power CMOS RISC microcontroller'],
          ['AUDIO OUTPUT:', 'Piezoelectric buzzer alert transducer'],
          ['POWER CELL:', '1x CR2032 or 2x LR44 alkaline coin cells']
        ],
        whyMattered: 'The first mass-market emotional computing experience; proved that humans form deep empathetic bonds with rudimentary pixel state machines that demand recurring attention.',
        didYouKnow: 'Invented by Aki Maita and Akihiro Yokoi; over 82 million units were sold globally, leading schools in multiple nations to ban keychains during class hours.',
        chips: {
          mcu: '4-Bit MCU: Ultra-low power state machine maintaining real-time internal age counters and hunger variables.',
          piezo: 'Piezo Buzzer: Emits high-frequency alarm beeps when disciplinary or feeding states require user intervention.'
        }
      },
      nokia3310: {
        id: 'nokia3310',
        badge: 'SPECIMEN #09',
        title: 'NOKIA 3310 CELLULAR TRANSCEIVER (2000)',
        accession: 'RTM-2000-001',
        category: 'HANDHELD',
        decade: '00s',
        provenance: 'ESPOO, FINLAND',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nokia-3310.png',
        imageAlt: 'Classic blue Nokia 3310 mobile phone with monochrome display',
        imageSource: 'Wikimedia Commons (Foxbeefly Public Archive)',
        specs: [
          ['CELLULAR BANDS:', 'GSM 900 / GSM 1800 Dual Band Phase 2+'],
          ['DISPLAY RESOLUTION:', '84 x 48 Monochrome Green LED backlighting'],
          ['INTERNAL FIRMWARE:', 'Embedded Snake II, Space Impact, Bantumi, Pairs II'],
          ['CHASSIS SYSTEM:', 'Xpress-on interchangeable snap-on front & rear fascias'],
          ['STANDBY ENDURANCE:', 'Up to 260 hours (over 10 days) on 900 mAh NiMH battery']
        ],
        whyMattered: 'Sold 126 million units, cementing mobile telephony into universal youth culture through SMS text messaging, custom ringtones, and indestructible industrial design.',
        didYouKnow: 'Celebrated as an internet folk hero for surviving drops onto concrete without breaking, earning it the affectionate moniker "The Indestructible Brick".',
        chips: {
          rf: 'GSM Transceiver: Dual-band RF amplifier with internal stamped brass antenna.',
          flash: 'Internal ROM: Stored SMS messages, ringtone composer notes, and high score matrices.'
        }
      }
    };

    const specimenOrder = ['atari2600', 'walkman', 'ibmpc', 'c64', 'floppy', 'mac128k', 'gameboy', 'tamagotchi', 'nokia3310'];

    // Filtering & Terminal Search
    let activeFilter = 'all';
    let searchQuery = '';

    const filterButtons = document.querySelectorAll('.filter-toggle-btn');
    const searchInput = document.getElementById('terminal-search');
    const clearBtn = document.getElementById('clear-search-btn');
    const specimenCards = document.querySelectorAll('.specimen-card');
    const countDisplay = document.getElementById('specimen-matched-count');
    const noResults = document.getElementById('no-results-panel');

    function updateExhibitsDisplay() {
      let visibleCount = 0;
      const q = searchQuery.trim().toLowerCase();

      specimenCards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const decade = (card.getAttribute('data-decade') || '').toLowerCase();
        const text = card.innerText.toLowerCase();

        let matchesFilter = false;
        if (activeFilter === 'all') {
          matchesFilter = true;
        } else if (activeFilter === '70s' || activeFilter === '80s' || activeFilter === '90s' || activeFilter === '00s') {
          matchesFilter = (decade === activeFilter);
        } else {
          matchesFilter = (cat === activeFilter);
        }

        const matchesQuery = (q === '') || text.includes(q);

        if (matchesFilter && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countDisplay) countDisplay.textContent = visibleCount;
      if (noResults) {
        if (visibleCount === 0) {
          noResults.style.display = 'flex';
        } else {
          noResults.style.display = 'none';
        }
      }
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        filterButtons.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('is-active');
        this.setAttribute('aria-pressed', 'true');
        activeFilter = (this.getAttribute('data-filter') || 'all').toLowerCase();
        AudioEngine.blipClick();
        updateExhibitsDisplay();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        AudioEngine.playTone(700, 'triangle', 0.02, 0.03);
        if (clearBtn) {
          clearBtn.style.display = searchQuery.length > 0 ? 'inline-block' : 'none';
        }
        updateExhibitsDisplay();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        clearBtn.style.display = 'none';
        AudioEngine.blipClick();
        updateExhibitsDisplay();
        if (searchInput) searchInput.focus();
      });
    }

    // Modal Dossier Inspector
    const modalBackdrop = document.getElementById('accession-modal');
    const modalCloseBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalBadge = document.getElementById('modal-specimen-badge');
    const modalSpecsTable = document.getElementById('modal-specs-table');
    const modalWhyMattered = document.getElementById('modal-why-mattered');
    const modalDidYouKnow = document.getElementById('modal-annotation');
    const modalPagination = document.getElementById('modal-pagination-label');
    const btnPrev = document.getElementById('modal-btn-prev');
    const btnNext = document.getElementById('modal-btn-next');

    let currentSpecimenId = 'c64';

    function openModal(id) {
      if (!specimens[id]) return;
      currentSpecimenId = id;
      loadModalData(id);
      if (modalBackdrop) {
        const alreadyOpen = modalBackdrop.classList.contains('is-open');
        modalBackdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (modalCloseBtn) modalCloseBtn.focus();
        if (!alreadyOpen) {
          AudioEngine.blipSuccess();
        }
      }
    }

    function closeModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove('is-open');
        document.body.style.overflow = '';
      }
      AudioEngine.blipClick();
    }

    // Expose modal controls globally for inline onclick and external callers
    window.openSpecimenModal = function (id) {
      openModal(id);
    };

    window.closeSpecimenModal = function () {
      closeModal();
    };

    function loadModalData(id) {
      const data = specimens[id] || specimens.c64;
      const idx = specimenOrder.indexOf(id);
      const total = specimenOrder.length;

      if (modalBadge) modalBadge.textContent = data.badge;
      if (modalTitle) modalTitle.textContent = `${data.title} // ACC: ${data.accession}`;
      if (modalWhyMattered) modalWhyMattered.textContent = data.whyMattered;
      if (modalDidYouKnow) modalDidYouKnow.textContent = `"${data.didYouKnow}"`;
      if (modalPagination) modalPagination.textContent = `SPECIMEN ${String(idx + 1).padStart(2, '0')} OF ${String(total).padStart(2, '0')}`;

      // Real Specimen Image in Modal
      const modalImg = document.getElementById('modal-specimen-img');
      const modalPhotoCaption = document.getElementById('modal-photo-caption');
      const modalPhotoSource = document.getElementById('modal-photo-source');
      if (modalImg && data.image) {
        modalImg.src = data.image;
        modalImg.alt = data.imageAlt || data.title;
      }
      if (modalPhotoCaption && data.imageAlt) {
        modalPhotoCaption.textContent = data.imageAlt;
      }
      if (modalPhotoSource && data.imageSource) {
        modalPhotoSource.textContent = `SOURCE: ${data.imageSource}`;
      }

      if (modalSpecsTable && data.specs) {
        modalSpecsTable.innerHTML = data.specs.map(row => `
          <tr style="border-bottom: 1px solid var(--ink);">
            <td style="padding: 6px 12px; background-color: var(--shade); font-weight: bold; width: 40%; font-family: var(--font-pixel); font-size: 9px;">${row[0]}</td>
            <td style="padding: 6px 12px; font-family: var(--font-mono); font-size: 13px;">${row[1]}</td>
          </tr>
        `).join('');
      }

      // Update Prev / Next buttons
      const prevIdx = (idx - 1 + total) % total;
      const nextIdx = (idx + 1) % total;
      if (btnPrev) {
        btnPrev.textContent = `< PREV: ${specimens[specimenOrder[prevIdx]].badge}`;
        btnPrev.onclick = () => {
          AudioEngine.blipClick();
          loadModalData(specimenOrder[prevIdx]);
        };
      }
      if (btnNext) {
        btnNext.textContent = `NEXT: ${specimens[specimenOrder[nextIdx]].badge} >`;
        btnNext.onclick = () => {
          AudioEngine.blipClick();
          loadModalData(specimenOrder[nextIdx]);
        };
      }
    }

    // Direct event bindings on specimen cards & open triggers
    document.querySelectorAll('.specimen-card, [data-open-modal]').forEach(trigger => {
      trigger.addEventListener('click', function (e) {
        if (e.target.closest('#accession-modal')) return;
        const id = this.getAttribute('data-open-modal') || this.getAttribute('data-object-id');
        if (id && specimens[id]) {
          openModal(id);
        }
      });
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('#accession-modal')) return;
          const id = this.getAttribute('data-open-modal') || this.getAttribute('data-object-id');
          if (id && specimens[id]) {
            e.preventDefault();
            openModal(id);
          }
        }
      });
    });

    // Document-level event delegation for clicks anywhere on specimen cards or inspect buttons
    document.addEventListener('click', function (e) {
      if (e.target.closest('#accession-modal')) return;
      const trigger = e.target.closest('.specimen-card, [data-open-modal], [data-object-id]');
      if (trigger) {
        const id = trigger.getAttribute('data-open-modal') || trigger.getAttribute('data-object-id');
        if (id && specimens[id]) {
          openModal(id);
        }
      }
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Chip audit helper (retired with schematic removal, maintained as safe stub)
    window.selectChipAudit = function () {};
  }

  /* ========================================================================= */
  /* 6. PAGE 3: VISIT CARTOGRAPHY, TICKET GENERATOR & MAGNETIC GUESTBOOK      */
  /* ========================================================================= */
  function initVisitPage() {
    // A. 3-Floor Blueprint Cartography & Room Telemetry
    const sectorTelemetry = {
      '101': {
        code: 'SEC-101-PL',
        title: 'ROOM 101: 8-BIT MICROCOMPUTERS',
        desc: 'Interactive assembly floor containing operational domestic microcomputers between 1977 and 1985. Mechanical keyboard clatter is encouraged; floppy drives spin upon authorized button press.',
        temp: '18.4°C (STABLE)',
        hum: '38.2% RH',
        lum: '124 NIT (P31 GREEN)',
        deg: 'EVERY 24 HOURS',
        rigs: ['Commodore 64 (Breadbin rev. 2, 6581 SID)', 'Apple IIe (65C02 CPU, DuoDisk Unit)', 'BBC Micro Model B (Acorn OS 1.20)']
      },
      '102': {
        code: 'SEC-102-AUD',
        title: 'ROOM 102: ANALOG SYNTHESIS & TAPE',
        desc: 'Magnetic reel archives and voltage-controlled synthesizer racks. Visitors can route patch cables between modular oscillator units and acoustic couplers.',
        temp: '17.1°C (COOLED)',
        hum: '34.0% RH',
        lum: '65 NIT (AMBER INDICATOR)',
        deg: 'COIL ISOLATED',
        rigs: ['Moog System 55 Modular Re-issue', 'Otari MX-5050 2-Track 1/4" Tape Machine', 'Roland TR-808 (Serial #01442)']
      },
      '103': {
        code: 'SEC-103-FLUX',
        title: 'ROOM 103: CRT DEGAUSSING CHAMBER',
        desc: 'Heavy shielding enclosure dedicated to eliminating residual magnetic coloration on shadow-mask color monitors. Warning: High electromagnetic flux during demonstration pulses.',
        temp: '21.0°C (COIL HEAT)',
        hum: '41.5% RH',
        lum: '210 NIT (P22 TRINITRON)',
        deg: 'CONTINUOUS PULSE BENCH',
        rigs: ['Sony Trinitron PVM-20M4U Medical Monitor', 'Barco CRT Studio Color Matcher', 'Industrial 19" Handheld Degaussing Ring']
      },
      '104': {
        code: 'SEC-104-ARCH',
        title: 'ROOM 104: VAULT ARCHIVE & COLD STORAGE',
        desc: 'Nitrogen-purged storage drawers preserving original floppy master platters, boxed documentation, and NOS (new old stock) MOS 6502 ceramic microprocessors.',
        temp: '14.0°C (CRITICAL PRESERVE)',
        hum: '25.0% RH',
        lum: '0 NIT (DARK STORAGE)',
        deg: 'ZERO FIELD SHIELDED',
        rigs: ['5.25" and 8" Magnetic Master Disks (12,000 items)', 'Ceramic DIP Package Vault Drawer', 'Original Bell Labs Unix Documentation Binders']
      }
    };

    window.inspectFloorRoom = function (roomId) {
      AudioEngine.blipClick();
      const data = sectorTelemetry[roomId];
      if (!data) return;

      const codeEl = document.getElementById('inspect-code');
      const titleEl = document.getElementById('inspect-title');
      const descEl = document.getElementById('inspect-desc');
      const tempEl = document.getElementById('inspect-temp');
      const humEl = document.getElementById('inspect-hum');
      const lumEl = document.getElementById('inspect-lum');
      const degEl = document.getElementById('inspect-deg');
      const rigsList = document.getElementById('inspect-rigs-list');

      if (codeEl) codeEl.textContent = data.code;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
      if (tempEl) tempEl.textContent = data.temp;
      if (humEl) humEl.textContent = data.hum;
      if (lumEl) lumEl.textContent = data.lum;
      if (degEl) degEl.textContent = data.deg;

      if (rigsList && data.rigs) {
        rigsList.innerHTML = data.rigs.map(r => `
          <li style="display: flex; align-items: center; gap: 6px; font-family: var(--font-body); font-size: 20px;">
            <span style="display:inline-block; width:6px; height:6px; background-color: var(--ink);"></span>
            <span>${r}</span>
          </li>
        `).join('');
      }
    };

    window.switchFloorLevel = function (level) {
      AudioEngine.blipClick();
      const btn00 = document.getElementById('btn-floor-00');
      const btn01 = document.getElementById('btn-floor-01');
      const btn02 = document.getElementById('btn-floor-02');
      const title = document.getElementById('floor-title-display');

      [btn00, btn01, btn02].forEach(b => {
        if (b) b.className = 'btn-pixel btn-shade';
      });

      if (level === 'lvl00') {
        if (btn00) btn00.className = 'btn-pixel btn-signal';
        if (title) title.textContent = 'LEVEL 00: BASEMENT SILICON VAULT (MAINFRAMES & DRUM MEMORY)';
      } else if (level === 'lvl01') {
        if (btn01) btn01.className = 'btn-pixel btn-signal';
        if (title) title.textContent = 'LEVEL 01: THE PERSONAL COMPUTING BOOM (1975–1989)';
      } else if (level === 'lvl02') {
        if (btn02) btn02.className = 'btn-pixel btn-signal';
        if (title) title.textContent = 'LEVEL 02: HANDHELD & EMBEDDED MEMORY (1989–2001)';
      }
    };

    // B. Interactive Ticket Builder & Stub Generator
    const ticketCounts = {
      adult: 1,
      student: 0,
      junior: 0,
      senior: 0
    };

    const ticketPrices = {
      adult: 14.0,
      student: 8.0,
      junior: 5.0,
      senior: 8.0
    };

    const SURCHARGE = 1.5;

    window.stepTicket = function (tier, delta) {
      if (ticketCounts[tier] + delta >= 0) {
        ticketCounts[tier] += delta;
        const countEl = document.getElementById(`qty-${tier}`);
        if (countEl) countEl.textContent = ticketCounts[tier];
        AudioEngine.blipClick();
        calculateTicket();
      }
    };

    function calculateTicket() {
      const sub = (ticketCounts.adult * ticketPrices.adult) +
                  (ticketCounts.student * ticketPrices.student) +
                  (ticketCounts.junior * ticketPrices.junior) +
                  (ticketCounts.senior * ticketPrices.senior);
      const totalPassengers = ticketCounts.adult + ticketCounts.student + ticketCounts.junior + ticketCounts.senior;
      const appliedLevy = totalPassengers > 0 ? SURCHARGE : 0.0;
      const grandTotal = sub + appliedLevy;

      const subEl = document.getElementById('calc-subtotal');
      const levyEl = document.getElementById('calc-levy');
      const totalEl = document.getElementById('calc-total');
      const stubPassengers = document.getElementById('stub-passengers');
      const stubFee = document.getElementById('stub-fee');

      if (subEl) subEl.textContent = `$${sub.toFixed(2)}`;
      if (levyEl) levyEl.textContent = `$${appliedLevy.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;

      if (stubPassengers) stubPassengers.textContent = `${totalPassengers} OBSERVER${totalPassengers === 1 ? '' : 'S'}`;
      if (stubFee) stubFee.textContent = `$${grandTotal.toFixed(2)}`;
    }

    window.printTicketStub = function () {
      AudioEngine.blipSuccess();
      const hex = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
      const sub = Math.floor(Math.random() * 90 + 10);
      const newSerial = `TKT-2025-${sub}-${hex}`;

      const serialEl = document.getElementById('stub-serial');
      if (serialEl) serialEl.textContent = newSerial;

      const stubBox = document.getElementById('physical-ticket-stub');
      if (stubBox) {
        stubBox.style.transform = 'scale(0.98)';
        setTimeout(() => {
          stubBox.style.transform = 'none';
        }, 150);
      }
    };

    // C. Magnetic Guestbook with Terminal Diagnostics & SafeStorage
    const STORAGE_GUESTBOOK = 'bitrot_guestbook_entries';
    const guestbookForm = document.getElementById('guestbook-form');
    const guestbookStream = document.getElementById('guestbook-stream');
    const terminalStatus = document.getElementById('guestbook-status');

    function loadGuestbookEntries() {
      if (!guestbookStream) return;
      const raw = SafeStorage.getItem(STORAGE_GUESTBOOK);
      let entries = [];
      if (raw) {
        try { entries = JSON.parse(raw); } catch (e) { entries = []; }
      }

      // Default historical seed entries if empty
      if (entries.length === 0) {
        entries = [
          {
            handle: 'SYSOP_KENNY',
            decade: '1980s',
            msg: 'Still smelling the warm ozone rising off the Commodore 1541 drive motor in Room 101. Brought my grandson to show him how we loaded games in fifteen painstaking minutes. 10/10.',
            station: 'NODE #04',
            time: '13:48:19 UTC'
          },
          {
            handle: 'CIRCUIT_QUEEN_91',
            decade: '1990s',
            msg: 'Room 103 degaussing demo gave my steel wristwatch quite a buzz. Delighted to see the Amiga 1200 running tracker modules without modern clock jitter.',
            station: 'NODE #02',
            time: '11:14:02 UTC'
          },
          {
            handle: 'PUNCHCARD_PETE',
            decade: '1970s',
            msg: 'Please do not press the buttons. I pressed the buttons. The teletype printer obeyed instantly. Thank you for preserving the tactile click.',
            station: 'REMOTE ARCHIVE',
            time: '09:32:55 UTC'
          }
        ];
        SafeStorage.setItem(STORAGE_GUESTBOOK, JSON.stringify(entries));
      }

      guestbookStream.innerHTML = entries.map(item => `
        <div class="guestbook-sticky">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: var(--border-thin); padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: var(--font-pixel); font-size: 11px; font-weight: bold; color: var(--ink);">${item.handle}</span>
            <span style="font-family: var(--font-pixel); font-size: 8px; background-color: var(--signal); color: #fff; padding: 2px 6px;">EPOCH: ${item.decade}</span>
          </div>
          <p style="font-family: var(--font-body); font-size: 20px; line-height: 1.35; color: var(--ink); margin-bottom: 8px;">
            "${item.msg}"
          </p>
          <div style="display: flex; justify-content: space-between; font-family: var(--font-pixel); font-size: 8px; color: #635E4E;">
            <span>STATION: ${item.station || 'TERMINAL VT-220'}</span>
            <span>TIME: ${item.time}</span>
          </div>
        </div>
      `).join('');
    }

    if (guestbookForm) {
      guestbookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const handleInput = document.getElementById('guest-handle');
        const msgInput = document.getElementById('guest-msg');
        const decadeInput = document.querySelector('input[name="decade"]:checked');

        const handle = (handleInput ? handleInput.value.trim() : '');
        const msg = (msgInput ? msgInput.value.trim() : '');
        const decade = decadeInput ? decadeInput.value : '1980s';

        if (!handle) {
          AudioEngine.blipError();
          if (terminalStatus) terminalStatus.textContent = 'ERR: NAME / CALLSIGN REQUIRED.';
          if (handleInput) handleInput.focus();
          return;
        }

        if (!msg) {
          AudioEngine.blipError();
          if (terminalStatus) terminalStatus.textContent = 'ERR: EMPTY BUFFER DETECTED. MESSAGE REQUIRED.';
          if (msgInput) msgInput.focus();
          return;
        }

        const now = new Date();
        const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;

        const newEntry = {
          handle: handle.toUpperCase(),
          decade: decade,
          msg: msg,
          station: 'NODE #09 CONSOLE',
          time: timeStr
        };

        let current = [];
        try {
          current = JSON.parse(SafeStorage.getItem(STORAGE_GUESTBOOK) || '[]');
        } catch (err) { current = []; }

        current.unshift(newEntry);
        SafeStorage.setItem(STORAGE_GUESTBOOK, JSON.stringify(current));

        AudioEngine.blipSuccess();
        if (handleInput) handleInput.value = '';
        if (msgInput) msgInput.value = '';
        if (terminalStatus) terminalStatus.textContent = 'STATUS: TRANSMISSION COMMITTED TO MAGNETIC TAPE LOG // WRITE OK.';

        loadGuestbookEntries();
      });
    }

    window.clearGuestbook = function () {
      if (confirm('CLEAR ALL MAGNETIC GUESTBOOK RECORDS FROM LOCAL STORAGE?')) {
        SafeStorage.removeItem(STORAGE_GUESTBOOK);
        AudioEngine.blipClick();
        loadGuestbookEntries();
        if (terminalStatus) terminalStatus.textContent = 'STATUS: GUESTBOOK STORAGE SECTOR INITIALIZED.';
      }
    };

    loadGuestbookEntries();
  }

  /* ========================================================================= */
  /* 7. LIFECYCLE DISPATCH                                                     */
  /* ========================================================================= */
  function runApplication() {
    initMuseumClock();
    initNavigation();

    const pageId = (document.body && document.body.getAttribute('data-page')) || '';
    if (pageId === 'lobby' || document.getElementById('timeline-heading') || document.querySelector('.timeline-track')) {
      initLobbyPage();
    }
    if (pageId === 'exhibits' || document.getElementById('gallery-grid') || document.getElementById('accession-modal')) {
      initExhibitsPage();
    }
    if (pageId === 'visit' || document.getElementById('cartography-heading') || document.getElementById('tickets-heading') || document.getElementById('guestbook-form')) {
      initVisitPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApplication);
  } else {
    runApplication();
  }

})();
