/**
 * PROMPT ENGINEERING MASTER GUIDE - CORE SCRIPTS
 */

// 1. Floating Copy Button Logic
function copyPrompt(btn) {
    const textToCopy = btn.nextElementSibling.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "COPIED!";
        btn.style.background = "var(--benz-blue)";
        
        setTimeout(() => { 
            btn.innerText = originalText; 
            btn.style.background = "rgba(255,255,255,0.1)";
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

// 2. Tab Switching Logic
function switchTab(evt, tabId) {
    const section = evt.currentTarget.closest('section');
    const tabs = section.querySelectorAll('.tab-content');
    const btns = section.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    btns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// 3. Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// 4. Quick Search / Filter
function filterContent() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let items = document.querySelectorAll('.searchable');
    items.forEach(item => {
        let text = item.innerText.toLowerCase();
        item.style.display = text.includes(input) ? "block" : "none";
    });
}

// 5. Scroll Progress & Back to Top
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progress-bar');
    const backToTopBtn = document.getElementById('back-to-top');
    
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    
    if (progressBar) progressBar.style.width = scrolled + "%";
    if (backToTopBtn) {
        backToTopBtn.style.display = winScroll > 500 ? "flex" : "none";
    }
});

// 6. Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Variable Auto-Highlighting (Regex)
    const promptBoxes = document.querySelectorAll('pre');
    promptBoxes.forEach(box => {
        let html = box.innerHTML;
        // Match {text} or [text]
        html = html.replace(/(\{[^{}]+\}|\[[^\[\]]+\])/g, '<span class="var-highlight">$1</span>');
        box.innerHTML = html;
    });

    // Mark active nav link based on current page
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
