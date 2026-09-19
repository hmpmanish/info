/**
 * script.js
 * Core logic for HMPManish Ultra Premium Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GLOBAL STATE & SOUNDS ---
    let soundEnabled = false;
    const soundHover = document.getElementById('sound-hover');
    const soundClick = document.getElementById('sound-click');
    
    if (soundHover) soundHover.volume = 0.2;
    if (soundClick) soundClick.volume = 0.4;
    
    function playHoverSound() {
        if (soundEnabled && soundHover) {
            soundHover.currentTime = 0;
            soundHover.play().catch(()=>{});
        }
    }
    
    function playClickSound() {
        if (soundEnabled && soundClick) {
            soundClick.currentTime = 0;
            soundClick.play().catch(()=>{});
        }
    }

    const hoverElements = document.querySelectorAll('.hover-sound, a, button, .cmd-item, .filter-btn, .tab-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
    });

    const clickElements = document.querySelectorAll('.click-sound, button, .cmd-item, .filter-btn, .tab-btn');
    clickElements.forEach(el => {
        el.addEventListener('click', playClickSound);
    });

    // --- 2. LOADER ---
    const loader = document.getElementById('loader');
    const loadPercent = document.getElementById('loading-percent');
    const progress = document.querySelector('.loading-bar .progress');
    const logsContainer = document.getElementById('loading-logs');
    
    const logs = [
        "> Initializing Particle Engine...",
        "> Loading Neural Net Weights...",
        "> Establishing Secure Connection...",
        "> Verifying HMP OS Integrity...",
        "> Rendering UI Components...",
        "> System Ready."
    ];
    let logIdx = 0;

    let percent = 0;
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 8) + 2;
        if (percent > 100) percent = 100;
        
        if (loadPercent) loadPercent.innerText = `${percent}%`;
        if (progress) progress.style.width = `${percent}%`;
        
        if (percent % 20 === 0 && logIdx < logs.length) {
            if (logsContainer) {
                const p = document.createElement('p');
                p.innerText = logs[logIdx];
                logsContainer.appendChild(p);
                logsContainer.scrollTop = logsContainer.scrollHeight;
            }
            logIdx++;
        }
        
        if (percent === 100) {
            clearInterval(interval);
            setTimeout(() => {
                if(loader) {
                    loader.style.opacity = '0';
                    loader.style.visibility = 'hidden';
                }
                document.body.classList.remove('noscroll');
                initHeroAnimations();
            }, 800);
        }
    }, 60);

    // --- 3. CUSTOM CURSOR & MAGNETIC EFFECT ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        requestAnimationFrame(() => {
            if(cursorDot) {
                cursorDot.style.left = `${posX}px`;
                cursorDot.style.top = `${posY}px`;
            }
            setTimeout(() => {
                if(cursorOutline) {
                    cursorOutline.style.left = `${posX}px`;
                    cursorOutline.style.top = `${posY}px`;
                }
            }, 50);
        });
    });

    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const position = btn.getBoundingClientRect();
            const x = e.pageX - position.left - position.width / 2;
            const y = e.pageY - position.top - position.height / 2;
            btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
            document.body.classList.add('cursor-hover');
        });
        btn.addEventListener('mouseout', function() {
            btn.style.transform = 'translate(0px, 0px)';
            document.body.classList.remove('cursor-hover');
        });
    });

    const interactables = document.querySelectorAll('a, button, input, textarea, .tab-btn, .filter-btn, .cmd-item, .ai-close');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // --- 4. SCROLL PROGRESS & HEADER ---
    const progressBar = document.getElementById('scroll-progress');
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(progressBar) progressBar.style.width = scrolled + '%';
        
        if (winScroll > 50) {
            if(header) header.classList.add('scrolled');
        } else {
            if(header) header.classList.remove('scrolled');
        }
    });

    // --- 5. TYPING EFFECT ---
    const typedTextSpan = document.getElementById("typed-text");
    const textArray = ["Reality.", "AI Applications.", "SaaS Products.", "Developer Tools."];
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000;
    let textArrayIndex = 0;
    let charIndex = 0;

    function type() {
        if (!typedTextSpan) return;
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingDelay);
        } else {
            setTimeout(erase, newTextDelay);
        }
    }

    function erase() {
        if (!typedTextSpan) return;
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingDelay);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingDelay + 1100);
        }
    }

    function initHeroAnimations() {
        if (textArray.length && typedTextSpan) setTimeout(type, newTextDelay + 250);
        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.top < window.innerHeight) {
                el.classList.add('active');
                const counters = el.querySelectorAll('.counter');
                if(counters.length > 0) {
                    counters.forEach(counter => animateCounter(counter));
                }
            }
        });
    }
    
    function animateCounter(counter) {
        if (counter.dataset.animated) return;
        counter.dataset.animated = 'true';
        
        const target = +counter.getAttribute('data-target') || 0;
        if (target === 0) return;
        
        const duration = 2000; 
        const stepTime = Math.abs(Math.floor(duration / (target || 1))) || 10;
        let current = 0;
        
        if (counter.dataset.timerId) clearInterval(parseInt(counter.dataset.timerId));
        
        const timer = setInterval(() => {
            current += Math.ceil(target / 100) || 1;
            if (current >= target) {
                counter.innerText = target + '+';
                clearInterval(timer);
            } else {
                counter.innerText = current;
            }
        }, stepTime);
        
        counter.dataset.timerId = timer;
    }

    // --- 6. INTERSECTION OBSERVER FOR REVEALS ---
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("active");
            
            const counters = entry.target.querySelectorAll('.counter');
            if(counters.length > 0) {
                counters.forEach(counter => {
                    animateCounter(counter);
                });
            }
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right").forEach(el => {
        revealObserver.observe(el);
    });

    // --- 7. 3D TILT EFFECT ---
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });
        card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
    });

    // --- 8. TABS & FILTERS ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const skillPanes = document.querySelectorAll('.skill-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            skillPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'flex';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // --- 9. COMMAND PALETTE ---
    const cmdPalette = document.getElementById('cmd-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdBtn = document.querySelector('.cmd-palette-btn');
    const cmdItems = document.querySelectorAll('.cmd-item');
    
    function toggleCmdPalette() {
        if(!cmdPalette) return;
        cmdPalette.classList.toggle('active');
        if (cmdPalette.classList.contains('active')) {
            setTimeout(() => cmdInput.focus(), 100);
        } else {
            if(cmdInput) cmdInput.value = '';
            filterCmds('');
        }
    }
    
    if(cmdBtn) cmdBtn.addEventListener('click', toggleCmdPalette);
    
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCmdPalette();
        }
        if (e.key === 'Escape' && cmdPalette && cmdPalette.classList.contains('active')) {
            toggleCmdPalette();
        }
    });
    
    if(cmdPalette) {
        cmdPalette.addEventListener('click', (e) => {
            if (e.target === cmdPalette) toggleCmdPalette();
        });
    }
    
    if(cmdInput) {
        cmdInput.addEventListener('input', (e) => { filterCmds(e.target.value.toLowerCase()); });
    }
    
    function filterCmds(query) {
        cmdItems.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(query)) item.style.display = 'flex';
            else item.style.display = 'none';
        });
    }
    
    cmdItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const id = item.id;
            const href = item.getAttribute('href');
            
            if (href) {
                toggleCmdPalette();
            } else if (id === 'cmd-theme') {
                document.getElementById('theme-toggle').click();
                toggleCmdPalette();
            } else if (id === 'cmd-color') {
                document.getElementById('color-toggle').click();
                toggleCmdPalette();
            } else if (id === 'cmd-sound') {
                document.getElementById('sound-toggle').click();
                toggleCmdPalette();
            } else if (id === 'cmd-matrix') {
                document.body.classList.toggle('matrix-mode');
                showToast('Matrix Mode Toggled', 'fas fa-code');
                toggleCmdPalette();
            }
        });
    });

    // --- 10. DOCK TOGGLES (Theme, Color, Sound) ---
    const themeToggle = document.getElementById('theme-toggle');
    const colorToggle = document.getElementById('color-toggle');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const htmlEl = document.documentElement;
    
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme');
            if (current === 'dark') {
                htmlEl.setAttribute('data-theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                showToast('Light Theme Enabled', 'fas fa-sun');
            } else {
                htmlEl.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                showToast('Dark Theme Enabled', 'fas fa-moon');
            }
        });
    }
    
    const colors = [
        { primary: '#00E5FF', secondary: '#7C3AED', accent: '#38BDF8' },
        { primary: '#10B981', secondary: '#3B82F6', accent: '#6366F1' },
        { primary: '#F43F5E', secondary: '#8B5CF6', accent: '#EC4899' },
        { primary: '#F59E0B', secondary: '#EF4444', accent: '#F97316' }
    ];
    let colorIdx = 0;
    
    if(colorToggle) {
        colorToggle.addEventListener('click', () => {
            colorIdx = (colorIdx + 1) % colors.length;
            const c = colors[colorIdx];
            document.documentElement.style.setProperty('--primary-color', c.primary);
            document.documentElement.style.setProperty('--secondary-color', c.secondary);
            document.documentElement.style.setProperty('--accent-color', c.accent);
            
            const mesh = document.querySelector('.bg-mesh');
            if(mesh) {
                mesh.style.backgroundImage = `
                    radial-gradient(at 0% 0%, ${c.secondary}22 0px, transparent 50%),
                    radial-gradient(at 100% 0%, ${c.primary}22 0px, transparent 50%),
                    radial-gradient(at 100% 100%, ${c.accent}22 0px, transparent 50%),
                    radial-gradient(at 0% 100%, rgba(34, 197, 94, 0.1) 0px, transparent 50%)
                `;
            }
            showToast('Accent Color Updated', 'fas fa-palette');
        });
    }

    if(soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if(soundEnabled) {
                soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                soundToggleBtn.style.color = 'var(--primary-color)';
                showToast('UI Sounds Enabled', 'fas fa-volume-up');
                playClickSound();
            } else {
                soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                soundToggleBtn.style.color = '';
                showToast('UI Sounds Disabled', 'fas fa-volume-mute');
            }
        });
    }

    // --- 11. CANVAS BACKGROUND & FPS ---
    const canvas = document.getElementById('bg-canvas');
    const fpsVal = document.getElementById('fps-val');
    let lastTime = performance.now();
    let frameCount = 0;
    
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        function initParticles() {
            particles = [];
            const count = window.innerWidth < 768 ? 40 : 120;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }
        
        function animateParticles() {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                if(fpsVal) fpsVal.innerText = frameCount;
                frameCount = 0;
                lastTime = now;
            }

            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        
        initParticles();
        animateParticles();
    }

    // --- 12. GITHUB HEATMAP ---
    const heatmap = document.querySelector('.gh-heatmap');
    if (heatmap) {
        for (let i = 0; i < 364; i++) {
            const cell = document.createElement('div');
            cell.classList.add('heatmap-cell');
            if (Math.random() > 0.6) {
                const level = Math.floor(Math.random() * 4) + 1;
                cell.classList.add(`l${level}`);
            }
            heatmap.appendChild(cell);
        }
    }

    // --- 13. CONTACT FORM & CONFETTI (Google Sheets Integration) ---
    // (Moved to the bottom of the script for the new Google Apps Script integration)

    // --- 14. TOAST NOTIFICATION ---
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, iconClass) {
        if(!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="${iconClass} toast-icon"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);
        void toast.offsetWidth; 
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // --- 15. TERMINAL EASTER EGG ---
    let keys = [];
    const secretCode = 'dev'; 
    window.addEventListener('keydown', (e) => {
        keys.push(e.key.toLowerCase());
        keys.splice(-secretCode.length - 1, keys.length - secretCode.length);
        if (keys.join('').includes(secretCode)) {
            const terminal = document.getElementById('fake-terminal');
            if(terminal) {
                terminal.classList.add('active');
                document.getElementById('term-input').focus();
            }
        }
    });
    
    const termInput = document.getElementById('term-input');
    const termBody = document.getElementById('term-body');
    const termClose = document.querySelector('.term-close');
    
    if(termClose) {
        termClose.addEventListener('click', () => document.getElementById('fake-terminal').classList.remove('active'));
    }
    
    if(termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = termInput.value.trim();
                termInput.value = '';
                const line = document.createElement('p');
                line.innerHTML = `<span class="prompt">guest@hmpmanish:~$</span> ${val}`;
                termBody.insertBefore(line, termBody.lastElementChild);
                
                const response = document.createElement('p');
                if (val === 'help') response.innerHTML = 'Commands: about, clear, github, exit';
                else if (val === 'about') response.innerHTML = 'HMPManish OS v3.0 - Building intelligent software.';
                else if (val === 'clear') {
                    termBody.querySelectorAll('p:not(:last-child)').forEach(l => l.remove());
                    return;
                } else if (val === 'github') {
                    response.innerHTML = 'Opening GitHub...';
                    window.open('https://github.com/hmpmanish', '_blank');
                } else if (val === 'exit') {
                    document.getElementById('fake-terminal').classList.remove('active');
                    return;
                } else if (val !== '') {
                    response.innerHTML = `command not found: ${val}`;
                }
                
                if(val !== '') termBody.insertBefore(response, termBody.lastElementChild);
                termBody.scrollTop = termBody.scrollHeight;
            }
        });
    }

    // --- 16. MOBILE MENU ---
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    if(hamburger) hamburger.addEventListener('click', () => mobileMenu.classList.toggle('active'));
    mobileLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('active')));

    // --- 17. AI ASSISTANT WIDGET (UPGRADED) ---
    const aiToggle = document.getElementById('ai-toggle');
    const aiWidget = document.getElementById('ai-widget');
    const aiClose = document.getElementById('ai-close');
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const aiBody = document.getElementById('ai-body');
    const aiChips = document.querySelectorAll('.ai-chip');

    let aiIsTyping = false;

    if(aiToggle) {
        aiToggle.addEventListener('click', () => {
            aiWidget.classList.toggle('active');
            if(aiWidget.classList.contains('active')) aiInput.focus();
        });
    }
    if(aiClose) aiClose.addEventListener('click', () => aiWidget.classList.remove('active'));

    // AI Knowledge Base (Rule-Based Engine with Hinglish & Typo tolerance)
    function getAiResponse(input) {
        // Remove extra spaces, special chars, and make lowercase
        let q = input.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
        
        // Greetings & Hinglish Hello
        if (q.match(/^(hi|hey|hello|namaste|pranam|helo|hii+)/) || q.includes('kaise ho') || q.includes('kya haal') || q.includes('aur sunao') || q.includes('ki haal')) {
            return "Hello there! 👋 Main ekdum badhiya hu! Aap batayein main aapki kaise madad kar sakta hu? Aap mujhse Manish ke skills, projects, ya contact details ke baare mein puch sakte hain.";
        }
        // Who is Manish
        else if (q.match(/(who|kaun|tell me about) (is )?(manish|hmp|you)/) || q.includes('about yourself') || q.includes('who are you') || q.includes('tum kaun ho')) {
            return "Manish Pandey is a highly skilled **Full Stack Developer** and **AI Enthusiast** based in Mumbai. He specializes in building scalable web applications and intelligent systems. 🚀";
        }
        // Skills & Tech Stack (with typo tolerance: skil, skils, tech stac)
        else if (q.match(/skil|stac|lang|sikh|aata hai|kya kya/)) {
            return "Manish is proficient in:\n<ul><li>**Frontend**: HTML, CSS, JS, React, Tailwind</li><li>**Backend**: Node.js, Python, Django, SQL/NoSQL</li><li>**AI**: Machine Learning, NLP, Computer Vision</li></ul>";
        }
        // Projects & Portfolio (with typo tolerance: proj, portfolo)
        else if (q.match(/proj|portfol|work|kaam/)) {
            return "Some of Manish's top projects include:\n- **Pandey Traders App**: A full-featured E-commerce app\n- **AI Image Generator**: A stable diffusion implementation\n- **Smart Chatbots**: Context-aware AI assistants\nCheck out the Projects section for more!";
        }
        // GitHub
        else if (q.match(/git|repo|code/)) {
            return "You can check out his open-source work on GitHub at [github.com/hmpmanish](https://github.com/hmpmanish). He has dozens of repositories with high-quality code!";
        }
        // Contact (with typo tolerance: conect, coonect, contac, msg, baat)
        else if (q.match(/contact|conect|coonect|email|hire|message|msg|baat/)) {
            return "Aap unhe aasaani se contact kar sakte hain! Ya to niche diye gaye **Contact Form** ka use karein, ya directly type karein **'Send message: [aapka message]'** aur main unhe abhi bhej dunga!";
        }
        // Direct Webhook Messaging
        else if (q.startsWith('send message')) {
            const msg = input.substring(13).trim();
            if(msg.length < 5) return "Please thoda detail mein message likhein taaki Manish samajh sakein!";
            
            const formData = new FormData();
            formData.append('name', 'AI Widget User');
            formData.append('email', 'ai-widget@visitor.com');
            formData.append('subject', 'Message via AI Widget');
            formData.append('message', msg);
            formData.append('language', navigator.language || 'en');
            
            if(typeof WEB_APP_URL !== 'undefined') {
                fetch(WEB_APP_URL, { method: 'POST', body: new URLSearchParams(formData) }).catch(e=>console.error(e));
            }
            return "✅ **Message sent!** Manish will receive this notification on his phone shortly.";
        }
        // Thank you
        else if (q.match(/thank|dhanyawad|shukriya|tnx|thx/)) {
            return "You're welcome! Koi aur sawal ho to zaroor puche.";
        }
        // Fallback
        else {
            return "I'm still learning! 🤖 Mujhe jyadatar Manish ke **Skills**, **Projects**, aur **Contact info** ke baare mein hi pata hai. Aap inme se kuch puch sakte hain, ya directly contact form use kar sakte hain.";
        }
    }

    // Parse simple markdown (bold, links)
    function parseMarkdown(text) {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--accent-color);text-decoration:underline;">$1</a>'); // links
        return html;
    }
    
    function sendAiMsg(customText = null) {
        if(aiIsTyping) return; // Prevent spamming
        
        const text = customText || aiInput.value.trim();
        if(!text) return;
        
        // Add User Message
        const userMsg = document.createElement('div');
        userMsg.className = 'ai-msg ai-user';
        userMsg.innerText = text;
        aiBody.appendChild(userMsg);
        
        if(!customText) aiInput.value = '';
        aiBody.scrollTop = aiBody.scrollHeight;
        aiIsTyping = true;
        
        // Add Typing Indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-msg ai-sys typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        aiBody.appendChild(typingIndicator);
        aiBody.scrollTop = aiBody.scrollHeight;
        
        // Calculate dynamic delay based on response length
        const responseText = getAiResponse(text);
        const delay = Math.max(800, Math.min(2500, responseText.length * 15));
        
        setTimeout(() => {
            // Remove typing indicator
            if(aiBody.contains(typingIndicator)) aiBody.removeChild(typingIndicator);
            
            // Add System Message
            const sysMsg = document.createElement('div');
            sysMsg.className = 'ai-msg ai-sys';
            sysMsg.innerHTML = parseMarkdown(responseText);
            aiBody.appendChild(sysMsg);
            aiBody.scrollTop = aiBody.scrollHeight;
            
            playClickSound(); // notification sound
            aiIsTyping = false;
        }, delay);
    }
    
    // Quick Action Chips
    if (aiChips) {
        aiChips.forEach(chip => {
            chip.addEventListener('click', () => {
                sendAiMsg(chip.innerText);
            });
        });
    }

    if(aiSend) aiSend.addEventListener('click', () => sendAiMsg());
    if(aiInput) aiInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') sendAiMsg(); });

    // --- 18. LIGHTBOX ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryImgs = document.querySelectorAll('.project-img-container img');

    galleryImgs.forEach(img => {
        img.addEventListener('click', () => {
            if(!lightbox) return;
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });

    if(lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    if(lightbox) lightbox.addEventListener('click', (e) => {
        if(e.target === lightbox) lightbox.classList.remove('active');
    });

    // Duplicate tech marquee items
    const track = document.querySelector('.tech-track');
    if (track) track.innerHTML += track.innerHTML;

    // =========================================================================
    // CONTACT FORM GOOGLE APPS SCRIPT INTEGRATION
    // =========================================================================
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzGWiI1eFNtEuF4cRzaW3fZT2SteIBMGvEV1Cvoyrur_aJa0QtZIVPTKtAaucy8SkYY/exec";
    
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const statusMessage = document.getElementById('statusMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showStatusMessage('error', 'Please fill in all required fields.');
                return;
            }

            const formData = new FormData(contactForm);

            submitBtn.disabled = true;
            submitBtnText.textContent = "Sending...";
            statusMessage.style.display = 'none';

            try {
                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showStatusMessage('success', result.message || 'Message sent successfully!');
                    contactForm.reset();
                } else {
                    showStatusMessage('error', result.message || 'Something went wrong.');
                }
            } catch (error) {
                showStatusMessage('error', 'Network error. Please try again later.');
                console.error('Submission Error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtnText.textContent = "Send Transmission";
            }
        });
    }

    function showStatusMessage(type, text) {
        statusMessage.textContent = text;
        statusMessage.style.display = 'block';
        if(type === 'success') {
            statusMessage.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            statusMessage.style.color = '#10b981';
        } else {
            statusMessage.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            statusMessage.style.color = '#ef4444';
        }
    }

    // 15. LIVE GITHUB STATS
    // =========================================================================
    const githubUsername = 'hmpmanish';
    fetch(`https://api.github.com/users/${githubUsername}`)
        .then(response => response.json())
        .then(data => {
            const reposStat = document.getElementById('stat-repos');
            const followersStat = document.getElementById('stat-followers');
            if (reposStat && data.public_repos !== undefined) {
                reposStat.setAttribute('data-target', data.public_repos);
                reposStat.dataset.animated = ''; // Reset animation state
                animateCounter(reposStat);
            }
            if (followersStat && data.followers !== undefined) {
                followersStat.setAttribute('data-target', data.followers);
                followersStat.dataset.animated = ''; // Reset animation state
                animateCounter(followersStat);
            }
        })
        .catch(err => console.error("GitHub Fetch Error:", err));

    // =========================================================================
    // 16. SECRET VISITOR ANALYTICS
    // =========================================================================
    // Check session storage to prevent spamming on every refresh
    if (!sessionStorage.getItem('hmp_visited')) {
        sessionStorage.setItem('hmp_visited', 'true');
        
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                const analyticsData = new URLSearchParams();
                analyticsData.append('action', 'track');
                analyticsData.append('ip', data.ip || 'Unknown');
                analyticsData.append('city', data.city || 'Unknown');
                analyticsData.append('region', data.region || 'Unknown');
                analyticsData.append('country', data.country_name || 'Unknown');
                analyticsData.append('isp', data.org || 'Unknown');
                analyticsData.append('latlong', (data.latitude && data.longitude) ? `${data.latitude}, ${data.longitude}` : 'Unknown');
                
                // OS detection
                let os = 'Unknown OS';
                const ua = navigator.userAgent;
                if (ua.indexOf('Win') !== -1) os = 'Windows';
                if (ua.indexOf('Mac') !== -1) os = 'MacOS';
                if (ua.indexOf('Linux') !== -1) os = 'Linux';
                if (ua.indexOf('Android') !== -1) os = 'Android';
                if (ua.indexOf('like Mac') !== -1) os = 'iOS';
                analyticsData.append('os', os);
                
                // Browser detection
                let browser = 'Unknown Browser';
                if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
                else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
                else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
                else if (ua.indexOf('Edg') !== -1) browser = 'Edge';
                analyticsData.append('browser', browser);
                
                analyticsData.append('screen', `${window.screen.width}x${window.screen.height}`);
                analyticsData.append('referrer', document.referrer || 'Direct');
                analyticsData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown');
                analyticsData.append('language', navigator.language || 'Unknown');

                fetch(WEB_APP_URL, {
                    method: 'POST',
                    body: analyticsData
                }).catch(e => console.error('Analytics Error:', e));
            })
            .catch(e => console.error('IPAPI Error:', e));
    }
});
