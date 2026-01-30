// Sidebar toggle and resize functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const resizeHandle = document.querySelector('.sidebar-resize-handle');
    const scrollTopBtn = document.querySelector('#sidebar-scroll-top');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const body = document.body;
    
    // Toggle sidebar
    if (toggle) {
        toggle.addEventListener('click', function() {
            body.classList.toggle('sidebar-collapsed');
            
            // Save state
            if (body.classList.contains('sidebar-collapsed')) {
                localStorage.setItem('sidebar-collapsed', 'true');
            } else {
                localStorage.removeItem('sidebar-collapsed');
            }
        });
    }
    
    // Restore sidebar state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
        body.classList.add('sidebar-collapsed');
    }
    
    // Sidebar resizing
    if (resizeHandle) {
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        
        resizeHandle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(sidebar).width, 10);
            resizeHandle.classList.add('resizing');
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            
            const delta = e.clientX - startX;
            let newWidth = startWidth + delta;
            
            // Clamp to min/max
            const minWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-min-width'), 10);
            const maxWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-max-width'), 10);
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            
            document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
            
            // Save to localStorage
            localStorage.setItem('sidebar-width', newWidth);
        });
        
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                resizeHandle.classList.remove('resizing');
            }
        });
    }
    
    // Restore sidebar width
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth) {
        document.documentElement.style.setProperty('--sidebar-width', savedWidth + 'px');
    }
    
    // Scroll to top button
    if (scrollTopBtn && sidebarNav) {
        sidebarNav.addEventListener('scroll', function() {
            if (sidebarNav.scrollTop > 100) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', function() {
            sidebarNav.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Highlight current page in sidebar
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    
    sidebarLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
});
