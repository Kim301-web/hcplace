// 데이터 로드
let locationData = {
    restaurant: [],
    hidden: []
};

let adminMap;

function loadData() {
    const saved = localStorage.getItem('locationData');
    if (saved) {
        locationData = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem('locationData', JSON.stringify(locationData));
}

// 관리자 지도 초기화
function initAdminMap() {
    adminMap = L.map('adminMap').setView([37.68, 127.90], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(adminMap);

    // 지도 클릭 시 좌표 입력
    adminMap.on('click', (e) => {
        document.getElementById('locationLat').value = e.latlng.lat.toFixed(4);
        document.getElementById('locationLng').value = e.latlng.lng.toFixed(4);
    });
}

// 페이지 로드
window.addEventListener('load', () => {
    loadData();
    initAdminMap();
    renderCategories();
    renderLocationsList();
    updateCategorySelect();

    // 유형 변경 시 카테고리 업데이트
    document.getElementById('locationType').addEventListener('change', updateCategorySelect);
});

// 카테고리 표시
function renderCategories() {
    const restaurantCats = document.getElementById('restaurant-categories');
    const hiddenCats = document.getElementById('hidden-categories');
    restaurantCats.innerHTML = '';
    hiddenCats.innerHTML = '';

    const restaurantCategories = [...new Set(locationData.restaurant.map(r => r.category))];
    restaurantCategories.forEach(cat => {
        const tag = document.createElement('span');
        tag.className = 'category-tag';
        tag.innerHTML = `${cat} <button onclick="deleteCategory('restaurant', '${cat}')">✕</button>`;
        restaurantCats.appendChild(tag);
    });

    const hiddenCategories = [...new Set(locationData.hidden.map(h => h.category))];
    hiddenCategories.forEach(cat => {
        const tag = document.createElement('span');
        tag.className = 'category-tag';
        tag.innerHTML = `${cat} <button onclick="deleteCategory('hidden', '${cat}')">✕</button>`;
        hiddenCats.appendChild(tag);
    });
}

// 카테고리 추가
function addCategory(type) {
    const inputId = type === 'restaurant' ? 'new-restaurant-cat' : 'new-hidden-cat';
    const input = document.getElementById(inputId);
    const name = input.value.trim();

    if (!name) {
        alert('카테고리 이름을 입력하세요');
        return;
    }

    // 중복 체크
    const existing = locationData[type].map(item => item.category);
    if (existing.includes(name)) {
        alert('이미 존재하는 카테고리입니다');
        return;
    }

    input.value = '';
    renderCategories();
    updateCategorySelect();
}

// 카테고리 삭제
function deleteCategory(type, category) {
    if (!confirm(`'${category}' 카테고리를 삭제하시겠습니까?`)) return;

    locationData[type] = locationData[type].filter(item => item.category !== category);
    saveData();
    renderCategories();
    updateCategorySelect();
}

// 카테고리 선택 업데이트
function updateCategorySelect() {
    const type = document.getElementById('locationType').value;
    const select = document.getElementById('locationCategory');
    const categories = [...new Set(locationData[type].map(item => item.category))];

    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

// 장소 추가
function addLocation() {
    const type = document.getElementById('locationType').value;
    const category = document.getElementById('locationCategory').value;
    const name = document.getElementById('locationName').value.trim();
    const info = document.getElementById('locationInfo').value.trim();
    const address = document.getElementById('locationAddress').value.trim();
    const lat = parseFloat(document.getElementById('locationLat').value);
    const lng = parseFloat(document.getElementById('locationLng').value);
    const image = document.getElementById('locationImage').value.trim();

    if (!category || !name || !info || !address || !lat || !lng) {
        alert('모든 필드를 입력하세요');
        return;
    }

    const location = {
        id: Date.now().toString(),
        name,
        category,
        lat,
        lng,
        info,
        address,
        image: image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`
    };

    locationData[type].push(location);
    saveData();

    // 폼 초기화
    document.getElementById('locationName').value = '';
    document.getElementById('locationInfo').value = '';
    document.getElementById('locationAddress').value = '';
    document.getElementById('locationLat').value = '';
    document.getElementById('locationLng').value = '';
    document.getElementById('locationImage').value = '';

    renderLocationsList();
    alert('장소가 추가되었습니다!');
}

// 장소 목록 표시
function renderLocationsList() {
    const list = document.getElementById('locationsList');
    list.innerHTML = '';

    const allLocations = [
        ...locationData.restaurant.map(item => ({ ...item, type: 'restaurant' })),
        ...locationData.hidden.map(item => ({ ...item, type: 'hidden' }))
    ];

    if (allLocations.length === 0) {
        list.innerHTML = '<p style="color: #999;">등록된 장소가 없습니다</p>';
        return;
    }

    allLocations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
            <div class="location-item-content">
                <h4>${location.name}</h4>
                <p><strong>카테고리:</strong> ${location.category}</p>
                <p><strong>주소:</strong> ${location.address}</p>
                <p><strong>설명:</strong> ${location.info}</p>
                <p><strong>좌표:</strong> ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
            </div>
            <div class="location-item-actions">
                <button onclick="deleteLocation('${location.type}', '${location.id}')" class="btn-danger">삭제</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// 장소 삭제
function deleteLocation(type, id) {
    if (!confirm('이 장소를 삭제하시겠습니까?')) return;

    locationData[type] = locationData[type].filter(item => item.id !== id);
    saveData();
    renderLocationsList();
    alert('장소가 삭제되었습니다');
}

// 현재 위치 스타일
const style = document.createElement('style');
style.textContent = `
    .category-tag {
        display: inline-block;
        background: #1a5f3f;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        margin: 5px 5px 5px 0;
    }
    .category-tag button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: 5px;
        font-weight: bold;
    }
    .location-item {
        background: #f9f9f9;
        border: 1px solid #ddd;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: start;
    }
    .location-item-content {
        flex: 1;
    }
    .location-item-content h4 {
        margin-top: 0;
    }
    .location-item-content p {
        margin: 5px 0;
        font-size: 14px;
    }
    .location-item-actions {
        margin-left: 20px;
    }
    .btn-danger {
        background: #dc3545;
        color: white;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .btn-danger:hover {
        background: #c82333;
    }
`;
document.head.appendChild(style);