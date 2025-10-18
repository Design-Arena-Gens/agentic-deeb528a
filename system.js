// WebOS System Core
class WebOS {
    constructor() {
        this.windows = new Map();
        this.zIndexCounter = 1000;
        this.activeWindow = null;
        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.setupEventListeners();
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        document.getElementById('clock').textContent = `${displayHours}:${minutes} ${ampm}`;
    }

    setupEventListeners() {
        // Desktop icon clicks
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.openApp(appName);
            });
        });

        // Dock icon clicks
        document.querySelectorAll('.dock-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.openApp(appName);
            });
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    openApp(appName) {
        // Check if window already exists
        if (this.windows.has(appName)) {
            const existingWindow = this.windows.get(appName);
            if (existingWindow.classList.contains('minimized')) {
                existingWindow.classList.remove('minimized');
            }
            this.focusWindow(existingWindow);
            return;
        }

        const windowEl = this.createWindow(appName);
        this.windows.set(appName, windowEl);
        document.getElementById('windows-container').appendChild(windowEl);
        this.focusWindow(windowEl);

        // Initialize app
        if (window.Apps && window.Apps[appName]) {
            window.Apps[appName].init(windowEl);
        }
    }

    createWindow(appName) {
        const window = document.createElement('div');
        window.className = 'window';
        window.dataset.app = appName;

        // Random position
        const x = Math.max(50, Math.random() * (window.innerWidth - 500));
        const y = Math.max(80, Math.random() * (window.innerHeight - 400));
        window.style.left = `${x}px`;
        window.style.top = `${y}px`;
        window.style.width = '600px';
        window.style.height = '500px';

        // Titlebar
        const titlebar = document.createElement('div');
        titlebar.className = 'window-titlebar';

        const controls = document.createElement('div');
        controls.className = 'window-controls';

        const closeBtn = document.createElement('div');
        closeBtn.className = 'window-control close';
        closeBtn.addEventListener('click', () => this.closeWindow(appName));

        const minimizeBtn = document.createElement('div');
        minimizeBtn.className = 'window-control minimize';
        minimizeBtn.addEventListener('click', () => this.minimizeWindow(window));

        const maximizeBtn = document.createElement('div');
        maximizeBtn.className = 'window-control maximize';
        maximizeBtn.addEventListener('click', () => this.maximizeWindow(window));

        controls.appendChild(closeBtn);
        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);

        const title = document.createElement('div');
        title.className = 'window-title';
        title.textContent = appName.charAt(0).toUpperCase() + appName.slice(1);

        titlebar.appendChild(controls);
        titlebar.appendChild(title);

        const content = document.createElement('div');
        content.className = 'window-content';

        window.appendChild(titlebar);
        window.appendChild(content);

        // Make draggable
        this.makeDraggable(window, titlebar);

        // Make resizable
        this.makeResizable(window);

        // Focus on click
        window.addEventListener('mousedown', () => this.focusWindow(window));

        return window;
    }

    makeDraggable(window, handle) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        handle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-control')) return;
            if (window.classList.contains('maximized')) return;

            isDragging = true;
            initialX = e.clientX - window.offsetLeft;
            initialY = e.clientY - window.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Constrain to viewport
            currentY = Math.max(28, currentY);

            window.style.left = `${currentX}px`;
            window.style.top = `${currentY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    makeResizable(window) {
        const resizer = document.createElement('div');
        resizer.style.width = '10px';
        resizer.style.height = '10px';
        resizer.style.position = 'absolute';
        resizer.style.right = '0';
        resizer.style.bottom = '0';
        resizer.style.cursor = 'nwse-resize';
        window.appendChild(resizer);

        let isResizing = false;
        let initialWidth;
        let initialHeight;
        let initialX;
        let initialY;

        resizer.addEventListener('mousedown', (e) => {
            if (window.classList.contains('maximized')) return;
            isResizing = true;
            initialWidth = window.offsetWidth;
            initialHeight = window.offsetHeight;
            initialX = e.clientX;
            initialY = e.clientY;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const width = initialWidth + (e.clientX - initialX);
            const height = initialHeight + (e.clientY - initialY);

            window.style.width = `${Math.max(400, width)}px`;
            window.style.height = `${Math.max(300, height)}px`;
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    focusWindow(window) {
        this.activeWindow = window;
        window.style.zIndex = ++this.zIndexCounter;

        // Remove focus from other windows
        document.querySelectorAll('.window').forEach(w => {
            w.style.opacity = w === window ? '1' : '0.95';
        });
    }

    closeWindow(appName) {
        const window = this.windows.get(appName);
        if (window) {
            window.remove();
            this.windows.delete(appName);
        }
    }

    minimizeWindow(window) {
        window.classList.add('minimized');
    }

    maximizeWindow(window) {
        if (window.classList.contains('maximized')) {
            window.classList.remove('maximized');
            window.style.width = window.dataset.prevWidth || '600px';
            window.style.height = window.dataset.prevHeight || '500px';
            window.style.left = window.dataset.prevLeft || '100px';
            window.style.top = window.dataset.prevTop || '100px';
        } else {
            window.dataset.prevWidth = window.style.width;
            window.dataset.prevHeight = window.style.height;
            window.dataset.prevLeft = window.style.left;
            window.dataset.prevTop = window.style.top;
            window.classList.add('maximized');
        }
    }
}

// Initialize WebOS
const webOS = new WebOS();
