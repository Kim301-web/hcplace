// 데이터 로드
let locationData = {
    restaurant: [],
    hidden: []
};

// 로컬 스토리지에서 데이터 로드
function loadData() {
    const saved = localStorage.getItem('locationData');
    if (saved) {
        locationData = JSON.parse(saved);
    } else {
        // 기본 샘플 데이터
        locationData = {
            restaurant: [
                {
                    id: 'r1',
                    name: '핏제리아509도씨',
                    category: '홍천읍',
                    lat: 37.6917,
                    lng: 127.8863,
                    info: '홍천에서 즐기는 정통 이탈리안 수제 피자입니다. 신선한 재료와 장인의 정성으로 만든 피자를 맛볼 수 있습니다.',
                    address: '강원특별자치도 홍천군 홍천읍 갈마로 3길 2 2층',
                    image: 'https://via.placeholder.com/300x200?text=핏제리아509도씨'
                },
                {
                    id: 'r2',
                    name: '원조왔다다슬기해장국',
                    category: '홍천읍',
                    lat: 37.6976,
                    lng: 127.9171,
                    info: '홍천의 신선한 다슬기를 사용한 전통 해장국입니다. 뜨겁하고 개운한 맛이 특징입니다.',
                    address: '강원특별자치도 홍천군 홍천읍 홍천로 756',
                    image: 'https://via.placeholder.com/300x200?text=다슬기해장국'
                }
            ],
            hidden: [
                {
                    id: 'h1',
                    name: '홍천 생명건강과학관',
                    category: '박물관',
                    lat: 37.69,
                    lng: 127.88,
                    info: '아이들이 체험하기 좋은 과학관입니다. 다양한 생명과학 체험과 교육 프로그램을 제공합니다.',
                    address: '강원특별자치도 홍천군 홍천읍 생명과학관길 78',
                    image: 'https://via.placeholder.com/300x200?text=생명건강과학관'
                }
            ]
        };
        saveData();
    }
}

// 데이터 저장
function saveData() {
    localStorage.setItem('locationData', JSON.stringify(locationData));
}

// 지도 초기화
const map = L.map('map').setView([37.68, 127.90], 13);

// Leaflet 타일 레이어 설정
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// 마커 관리
let currentMarkers = [];

// 페이지 로드
window.addEventListener('load', () => {
    loadData();
    renderMenu();
    
    // 카테고리 버튼 이벤트
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const submenu = e.target.nextElementSibling;
            submenu.classList.toggle('active');
        });
    });
    
    // 닫기 버튼
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('infoPanel').style.display = 'none';
    });
});

// 메뉴 렌더링
function renderMenu() {
    const restaurantMenu = document.getElementById('restaurant-menu');
    const hiddenMenu = document.getElementById('hidden-menu');
    restaurantMenu.innerHTML = '';
    hiddenMenu.innerHTML = '';

    // 맛집 카테고리
    const restaurantCategories = [...new Set(locationData.restaurant.map(r => r.category))];
    restaurantCategories.forEach(cat => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'submenu-btn';
        btn.textContent = cat;
        btn.addEventListener('click', () => showMarkers('restaurant', cat));
        li.appendChild(btn);
        restaurantMenu.appendChild(li);
    });

    // 숨은 장소 카테고리
    const hiddenCategories = [...new Set(locationData.hidden.map(h => h.category))];
    hiddenCategories.forEach(cat => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'submenu-btn';
        btn.textContent = cat;
        btn.addEventListener('click', () => showMarkers('hidden', cat));
        li.appendChild(btn);
        hiddenMenu.appendChild(li);
    });
}

// 마커 표시
function showMarkers(type, category) {
    // 기존 마커 제거
    currentMarkers.forEach(m => map.removeLayer(m));
    currentMarkers = [];

    // 해당 카테고리의 마커 데이터
    const data = type === 'restaurant' ? locationData.restaurant : locationData.hidden;
    const filtered = data.filter(item => item.category === category);

    // 마커 추가
    filtered.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
            .addTo(map)
            .on('click', () => showInfo(location));
        currentMarkers.push(marker);
    });

    // 마커 전체가 보이도록 지도 줌 조정
    if (currentMarkers.length > 0) {
        const group = new L.featureGroup(currentMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// 정보 팝업 표시
function showInfo(location) {
    const panel = document.getElementById('infoPanel');
    let imageHtml = '';
    if (location.image) {
        imageHtml = `<img src="${location.image}" alt="${location.name}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px; max-height: 200px; object-fit: cover;">`;
    }
    
    panel.querySelector('.info-content').innerHTML = `
        ${imageHtml}
        <h2>${location.name}</h2>
        <p class="category-badge">${location.category}</p>
        <p>${location.info}</p>
        <p style="margin-top: 15px; color: #666;">📍 ${location.address}</p>
    `;
    panel.style.display = 'block';
}

// 다른 탭에서 데이터 변경 감지
window.addEventListener('storage', (e) => {
    if (e.key === 'locationData') {
        loadData();
        renderMenu();
    }
});