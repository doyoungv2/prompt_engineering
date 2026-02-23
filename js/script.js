document.addEventListener('DOMContentLoaded', () => {
    // 1. 사이드바 API Key UI 주입
    injectApiKeyUI();
    
    // 2. 각 섹션별 AI 생성기 UI 주입
    injectAIGenerators();

    // 3. 로컬 스토리지에서 API Key 불러오기
    loadApiKey();
});

/* --- API Key 관리 --- */
function injectApiKeyUI() {
    const sidebarNav = document.querySelector('#sidebar nav');
    if (!sidebarNav) return;

    const apiKeyHtml = `
        <div class="api-key-box">
            <label class="api-key-label">🔑 OpenAI API Key 설정</label>
            <div class="api-key-input-group">
                <input type="password" id="userApiKey" placeholder="sk-..." autocomplete="off">
                <button id="saveKeyBtn" onclick="saveApiKey()">저장</button> 
            </div>
            <div id="keyStatus" style="font-size:11px; color:#48bb78; margin-top:5px; display:none;">저장되었습니다!</div>
        </div>
    `;
    
    // 네비게이션 메뉴 이전에 삽입
    sidebarNav.insertAdjacentHTML('beforebegin', apiKeyHtml);
}

function saveApiKey() {
    const input = document.getElementById('userApiKey');
    const key = input.value.trim();
    const status = document.getElementById('keyStatus');

    if (!key) {
        alert("API Key를 입력해주세요.");
        return;
    }

    if (!key.startsWith("sk-")) {
        alert("유효한 OpenAI API Key 형식이 아닙니다. (sk-로 시작해야 함)");
        return;
    }

    localStorage.setItem('openai_api_key', key);
    
    // 저장 완료 피드백
    status.style.display = 'block';
    status.innerText = "저장되었습니다! ✅";
    input.value = ""; // 보안상 입력창 비우기
    input.placeholder = "API Key가 저장됨 (수정 시 입력)";
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

function loadApiKey() {
    const savedKey = localStorage.getItem('openai_api_key');
    const input = document.getElementById('userApiKey');
    if (savedKey && input) {
        input.placeholder = "API Key가 저장됨 (수정 시 입력)";
    }
}

/* --- AI 생성기 관리 --- */
function injectAIGenerators() {
    // '.searchable' 클래스를 가진 모든 섹션 하단에 AI 생성기 추가
    const sections = document.querySelectorAll('section.searchable');
    
    sections.forEach(section => {
        // 섹션 ID가 없으면 임의 생성 (필요시)
        const sectionId = section.id || 'default';
        
        // 해당 섹션의 제목 추출 (h2 텍스트)
        const title = section.querySelector('h2') ? section.querySelector('h2').innerText : 'AI 프롬프트 생성';

        const aiHtml = `
            <div class="ai-generator-ui" id="ai-box-${sectionId}">
                <h4>✨ AI 실시간 프롬프트 생성기</h4>
                <p style="font-size:13px; color:#718096; margin-top:-8px; margin-bottom:12px;">
                    이 섹션의 학습 내용(${title})을 기반으로 최적화된 프롬프트를 생성합니다.
                </p>
                <div class="ai-input-wrapper">
                    <input type="text" class="ai-input" placeholder="키워드나 주제를 입력하세요 (예: 40대 타겟 마케팅, 베트남 수출 등)...">
                    <button class="ai-gen-btn" onclick="generatePrompt(this, '${sectionId}')">생성하기</button>
                </div>
                <div class="ai-result-area" style="display:none;">
                    <textarea class="ai-textarea" readonly></textarea>
                    <button class="ai-copy-btn" onclick="copyToClipboard(this)">복사하기</button>
                </div>
            </div>`;
        
        section.insertAdjacentHTML('beforeend', aiHtml);
    });
}

async function generatePrompt(btn, sectionId) {
    // 1. API Key 확인
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        alert("사이드바에 OpenAI API Key를 먼저 입력하고 저장해주세요!");
        document.getElementById('userApiKey').focus();
        return;
    }

    // 2. 입력값 확인
    const container = btn.closest('.ai-generator-ui');
    const input = container.querySelector('.ai-input');
    const resultArea = container.querySelector('.ai-result-area');
    const textarea = container.querySelector('.ai-textarea');
    const userKeyword = input.value.trim();

    if (!userKeyword) {
        alert("생성할 프롬프트의 키워드를 입력해주세요.");
        input.focus();
        return;
    }

    // 3. 로딩 상태 표시
    const originalBtnText = btn.innerText;
    btn.innerText = "생성 중... ⏳";
    btn.disabled = true;
    textarea.value = ""; // 초기화

    try {
        // 4. 서버리스 함수 호출 (경로를 /api/generate로 변경하여 더 안정적으로 호출)
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: apiKey, 
                section_id: sectionId,
                user_keywords: userKeyword
            })
        });

        let data;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // JSON이 아닌 경우 (405 에러 페이지 등)
            const text = await response.text();
            console.error("Server Error Response:", text);
            throw new Error(`서버 응답 오류 (${response.status}): 서비스가 일시적으로 중단되었거나 경로가 잘못되었습니다.`);
        }

        if (response.ok && data.success) {
            textarea.value = data.generated_prompt;
            resultArea.style.display = 'block';
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            throw new Error(data.error_message || `요청 실패 (Error ${response.status})`);
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        alert(`오류 발생: ${error.message}\nAPI Key가 올바른지, 잔액이 있는지 확인해주세요.`);
    } finally {
        // 6. 상태 복구
        btn.innerText = originalBtnText;
        btn.disabled = false;
    }
}

function copyToClipboard(btn) {
    const textarea = btn.previousElementSibling;
    textarea.select();
    textarea.setSelectionRange(0, 99999); // 모바일 대응

    try {
        document.execCommand('copy');
        const originalText = btn.innerText;
        btn.innerText = "복사 완료! ✅";
        btn.style.background = "#2f855a";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "#48bb78";
        }, 2000);
    } catch (err) {
        alert("복사에 실패했습니다.");
    }
}

// 기존 사이드바 토글 기능 (혹시 script.js가 덮어씌워졌을 경우를 대비해 유지)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

// 기존 검색 기능
function filterContent() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const sections = document.querySelectorAll('section.searchable'); // 검색 가능한 섹션만

    sections.forEach(section => {
        const text = section.innerText.toLowerCase();
        if (text.includes(filter)) {
            section.style.display = "";
        } else {
            section.style.display = "none";
        }
    });
}