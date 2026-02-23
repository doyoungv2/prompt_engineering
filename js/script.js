// 스크롤 프로그레스 바
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("progress-bar").style.width = scrolled + "%";
});

// 사이드바 토글 (모바일)
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// 복사 기능
function copyPrompt(button) {
    const pre = button.nextElementSibling;
    const text = pre.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerText;
        button.innerText = 'Copied!';
        button.style.background = 'var(--benz-purple)';
        
        setTimeout(() => {
            button.innerText = originalText;
            button.style.background = 'rgba(255,255,255,0.1)';
        }, 2000);
    });
}

// 검색 기능
function filterContent() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const text = section.innerText.toLowerCase();
        if (text.includes(filter)) {
            section.style.display = "";
        } else {
            section.style.display = "none";
        }
    });
}

// 스크롤 시 사이드바 활성 메뉴 업데이트
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// 맨 위로 가기 버튼
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.style.display = "flex";
    } else {
        backToTop.style.display = "none";
    }
});