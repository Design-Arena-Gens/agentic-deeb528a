// Applications
window.Apps = {
    calculator: {
        init(windowEl) {
            const content = windowEl.querySelector('.window-content');
            content.innerHTML = `
                <div class="calculator">
                    <div class="calculator-display">0</div>
                    <button class="calc-btn function">C</button>
                    <button class="calc-btn function">±</button>
                    <button class="calc-btn function">%</button>
                    <button class="calc-btn operator">÷</button>
                    <button class="calc-btn">7</button>
                    <button class="calc-btn">8</button>
                    <button class="calc-btn">9</button>
                    <button class="calc-btn operator">×</button>
                    <button class="calc-btn">4</button>
                    <button class="calc-btn">5</button>
                    <button class="calc-btn">6</button>
                    <button class="calc-btn operator">−</button>
                    <button class="calc-btn">1</button>
                    <button class="calc-btn">2</button>
                    <button class="calc-btn">3</button>
                    <button class="calc-btn operator">+</button>
                    <button class="calc-btn zero">0</button>
                    <button class="calc-btn">.</button>
                    <button class="calc-btn operator">=</button>
                </div>
            `;

            windowEl.style.width = '360px';
            windowEl.style.height = 'auto';

            let currentValue = '0';
            let previousValue = '';
            let operation = null;
            let shouldResetDisplay = false;

            const display = content.querySelector('.calculator-display');
            const buttons = content.querySelectorAll('.calc-btn');

            const updateDisplay = () => {
                display.textContent = currentValue;
            };

            const handleNumber = (num) => {
                if (shouldResetDisplay) {
                    currentValue = num;
                    shouldResetDisplay = false;
                } else {
                    currentValue = currentValue === '0' ? num : currentValue + num;
                }
                updateDisplay();
            };

            const handleOperator = (op) => {
                if (operation && !shouldResetDisplay) {
                    calculate();
                }
                previousValue = currentValue;
                operation = op;
                shouldResetDisplay = true;
            };

            const calculate = () => {
                const prev = parseFloat(previousValue);
                const current = parseFloat(currentValue);

                if (isNaN(prev) || isNaN(current)) return;

                switch (operation) {
                    case '+':
                        currentValue = (prev + current).toString();
                        break;
                    case '−':
                        currentValue = (prev - current).toString();
                        break;
                    case '×':
                        currentValue = (prev * current).toString();
                        break;
                    case '÷':
                        currentValue = current !== 0 ? (prev / current).toString() : 'Error';
                        break;
                }

                operation = null;
                shouldResetDisplay = true;
                updateDisplay();
            };

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const value = button.textContent;

                    if (button.classList.contains('operator')) {
                        if (value === '=') {
                            calculate();
                        } else {
                            handleOperator(value);
                        }
                    } else if (button.classList.contains('function')) {
                        if (value === 'C') {
                            currentValue = '0';
                            previousValue = '';
                            operation = null;
                            shouldResetDisplay = false;
                        } else if (value === '±') {
                            currentValue = (parseFloat(currentValue) * -1).toString();
                        } else if (value === '%') {
                            currentValue = (parseFloat(currentValue) / 100).toString();
                        }
                        updateDisplay();
                    } else {
                        handleNumber(value);
                    }
                });
            });
        }
    },

    notepad: {
        init(windowEl) {
            const content = windowEl.querySelector('.window-content');
            const savedContent = localStorage.getItem('notepad-content') || '';

            content.innerHTML = `
                <div class="notepad">
                    <div class="notepad-toolbar">
                        <button class="notepad-btn" id="notepad-clear">Clear</button>
                        <button class="notepad-btn" id="notepad-save">Save</button>
                        <button class="notepad-btn" id="notepad-load">Load</button>
                        <button class="notepad-btn" id="notepad-download">Download</button>
                    </div>
                    <textarea class="notepad-textarea" placeholder="Start typing...">${savedContent}</textarea>
                </div>
            `;

            const textarea = content.querySelector('.notepad-textarea');
            const clearBtn = content.querySelector('#notepad-clear');
            const saveBtn = content.querySelector('#notepad-save');
            const loadBtn = content.querySelector('#notepad-load');
            const downloadBtn = content.querySelector('#notepad-download');

            // Auto-save
            let saveTimeout;
            textarea.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    localStorage.setItem('notepad-content', textarea.value);
                }, 500);
            });

            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all text?')) {
                    textarea.value = '';
                    localStorage.removeItem('notepad-content');
                }
            });

            saveBtn.addEventListener('click', () => {
                localStorage.setItem('notepad-content', textarea.value);
                alert('Note saved!');
            });

            loadBtn.addEventListener('click', () => {
                const content = localStorage.getItem('notepad-content') || '';
                textarea.value = content;
            });

            downloadBtn.addEventListener('click', () => {
                const blob = new Blob([textarea.value], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'note.txt';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    },

    terminal: {
        init(windowEl) {
            const content = windowEl.querySelector('.window-content');
            content.innerHTML = `
                <div class="terminal">
                    <div class="terminal-output"></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">guest@webos:~$</span>
                        <input type="text" class="terminal-input" autofocus>
                    </div>
                </div>
            `;

            const output = content.querySelector('.terminal-output');
            const input = content.querySelector('.terminal-input');

            const commands = {
                help: () => 'Available commands: help, clear, date, echo, whoami, neofetch, ls, pwd, about',
                clear: () => {
                    output.innerHTML = '';
                    return '';
                },
                date: () => new Date().toString(),
                echo: (args) => args.join(' '),
                whoami: () => 'guest',
                pwd: () => '/home/guest',
                ls: () => 'Desktop  Documents  Downloads  Pictures  Music  Videos',
                neofetch: () => `
                    <span style="color: #00ff00;">         ___          guest@webos
                    <span style="color: #00ff00;">    .--.  )        -----------
                    <span style="color: #00ff00;"> .'_\\/_.'         OS: WebOS 1.0
                    <span style="color: #00ff00;">  '. /.'          Shell: websh
                    <span style="color: #00ff00;">    | |           Resolution: ${window.innerWidth}x${window.innerHeight}
                    <span style="color: #00ff00;">    | |           WM: WebOS Window Manager
                    <span style="color: #00ff00;">    | |           Theme: macOS-inspired
                    <span style="color: #00ff00;">  .-'-'-.         Terminal: WebTerminal
                `.replace(/\n\s+/g, '\n'),
                about: () => 'WebOS - A macOS-inspired web-based operating system built with vanilla HTML, CSS, and JavaScript.',
                version: () => 'WebOS version 1.0.0',
                uptime: () => {
                    const uptime = Math.floor((Date.now() - startTime) / 1000);
                    const minutes = Math.floor(uptime / 60);
                    const seconds = uptime % 60;
                    return `up ${minutes} minutes, ${seconds} seconds`;
                }
            };

            const startTime = Date.now();

            const addOutput = (text, isCommand = false) => {
                const line = document.createElement('div');
                line.className = 'terminal-line';
                if (isCommand) {
                    line.innerHTML = `<span class="terminal-prompt">guest@webos:~$</span> ${text}`;
                } else {
                    line.innerHTML = text;
                }
                output.appendChild(line);
                content.querySelector('.terminal').scrollTop = content.querySelector('.terminal').scrollHeight;
            };

            // Welcome message
            addOutput('Welcome to WebOS Terminal');
            addOutput('Type "help" for available commands');
            addOutput('');

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = input.value.trim();
                    if (command) {
                        addOutput(command, true);

                        const [cmd, ...args] = command.split(' ');
                        const handler = commands[cmd.toLowerCase()];

                        if (handler) {
                            const result = handler(args);
                            if (result) addOutput(result);
                        } else {
                            addOutput(`Command not found: ${cmd}`);
                        }
                    }
                    input.value = '';
                }
            });
        }
    },

    finder: {
        init(windowEl) {
            const content = windowEl.querySelector('.window-content');

            const fileSystem = {
                '/': {
                    type: 'folder',
                    children: {
                        'Home': {
                            type: 'folder',
                            children: {
                                'Desktop': { type: 'folder', children: {} },
                                'Documents': {
                                    type: 'folder',
                                    children: {
                                        'notes.txt': { type: 'file', size: '2.3 KB' },
                                        'todo.txt': { type: 'file', size: '1.1 KB' },
                                        'work': { type: 'folder', children: {} }
                                    }
                                },
                                'Downloads': {
                                    type: 'folder',
                                    children: {
                                        'image.png': { type: 'file', size: '456 KB' },
                                        'video.mp4': { type: 'file', size: '12.5 MB' }
                                    }
                                },
                                'Pictures': { type: 'folder', children: {} },
                                'Music': { type: 'folder', children: {} },
                                'Videos': { type: 'folder', children: {} }
                            }
                        },
                        'Applications': {
                            type: 'folder',
                            children: {
                                'Calculator.app': { type: 'file', size: '5.2 MB' },
                                'Notepad.app': { type: 'file', size: '3.1 MB' },
                                'Terminal.app': { type: 'file', size: '4.8 MB' }
                            }
                        }
                    }
                }
            };

            let currentPath = ['/', 'Home'];
            let history = [['/', 'Home']];
            let historyIndex = 0;

            const render = () => {
                let current = fileSystem['/'];
                for (let i = 1; i < currentPath.length; i++) {
                    current = current.children[currentPath[i]];
                }

                const items = Object.entries(current.children || {})
                    .sort((a, b) => {
                        if (a[1].type === b[1].type) return a[0].localeCompare(b[0]);
                        return a[1].type === 'folder' ? -1 : 1;
                    });

                content.innerHTML = `
                    <div class="finder">
                        <div class="finder-toolbar">
                            <button class="finder-btn" id="finder-back" ${historyIndex === 0 ? 'disabled' : ''}>←</button>
                            <button class="finder-btn" id="finder-forward" ${historyIndex === history.length - 1 ? 'disabled' : ''}>→</button>
                            <div class="finder-path">${currentPath.join(' / ')}</div>
                        </div>
                        <div class="finder-content">
                            ${items.map(([name, item]) => `
                                <div class="finder-item" data-name="${name}" data-type="${item.type}">
                                    <div class="finder-icon">
                                        ${item.type === 'folder' ?
                                            '<svg viewBox="0 0 24 24" fill="#4A90E2"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>' :
                                            '<svg viewBox="0 0 24 24" fill="#999"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/></svg>'
                                        }
                                    </div>
                                    <div class="finder-name">${name}</div>
                                    ${item.size ? `<div class="finder-size">${item.size}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Event listeners
                content.querySelector('#finder-back')?.addEventListener('click', () => {
                    if (historyIndex > 0) {
                        historyIndex--;
                        currentPath = [...history[historyIndex]];
                        render();
                    }
                });

                content.querySelector('#finder-forward')?.addEventListener('click', () => {
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        currentPath = [...history[historyIndex]];
                        render();
                    }
                });

                content.querySelectorAll('.finder-item').forEach(item => {
                    item.addEventListener('click', () => {
                        content.querySelectorAll('.finder-item').forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                    });

                    item.addEventListener('dblclick', () => {
                        if (item.dataset.type === 'folder') {
                            currentPath.push(item.dataset.name);
                            history = history.slice(0, historyIndex + 1);
                            history.push([...currentPath]);
                            historyIndex++;
                            render();
                        }
                    });
                });
            };

            render();
        }
    },

    settings: {
        init(windowEl) {
            const content = windowEl.querySelector('.window-content');

            const settings = {
                general: {
                    darkMode: false,
                    animations: true,
                    soundEffects: false
                },
                desktop: {
                    showIcons: true,
                    snapToGrid: false,
                    iconSize: 'medium'
                },
                dock: {
                    autoHide: false,
                    magnification: true,
                    position: 'bottom'
                }
            };

            let activeSection = 'general';

            const render = () => {
                content.innerHTML = `
                    <div class="settings">
                        <div class="settings-sidebar">
                            <div class="settings-item ${activeSection === 'general' ? 'active' : ''}" data-section="general">General</div>
                            <div class="settings-item ${activeSection === 'desktop' ? 'active' : ''}" data-section="desktop">Desktop</div>
                            <div class="settings-item ${activeSection === 'dock' ? 'active' : ''}" data-section="dock">Dock</div>
                            <div class="settings-item ${activeSection === 'about' ? 'active' : ''}" data-section="about">About</div>
                        </div>
                        <div class="settings-content">
                            ${renderSection()}
                        </div>
                    </div>
                `;

                // Section switching
                content.querySelectorAll('.settings-item').forEach(item => {
                    item.addEventListener('click', () => {
                        activeSection = item.dataset.section;
                        render();
                    });
                });

                // Toggle switches
                content.querySelectorAll('.settings-toggle').forEach(toggle => {
                    toggle.addEventListener('click', () => {
                        toggle.classList.toggle('active');
                        const section = toggle.dataset.section;
                        const key = toggle.dataset.key;
                        if (settings[section]) {
                            settings[section][key] = toggle.classList.contains('active');
                        }
                    });
                });
            };

            const renderSection = () => {
                if (activeSection === 'about') {
                    return `
                        <div class="settings-section">
                            <h2>About WebOS</h2>
                            <p style="margin-bottom: 16px; color: #666;">Version 1.0.0</p>
                            <p style="color: #666;">A macOS-inspired web-based operating system built with vanilla HTML, CSS, and JavaScript.</p>
                            <p style="margin-top: 24px; color: #666;">© 2024 WebOS. All rights reserved.</p>
                        </div>
                    `;
                }

                const sectionSettings = settings[activeSection];
                if (!sectionSettings) return '';

                return `
                    <div class="settings-section">
                        <h2>${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Settings</h2>
                        ${Object.entries(sectionSettings).map(([key, value]) => {
                            if (typeof value === 'boolean') {
                                return `
                                    <div class="settings-option">
                                        <label>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                        <div class="settings-toggle ${value ? 'active' : ''}" data-section="${activeSection}" data-key="${key}"></div>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}
                    </div>
                `;
            };

            render();
        }
    }
};
