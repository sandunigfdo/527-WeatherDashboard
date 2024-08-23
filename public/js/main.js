// main.js

document.addEventListener('DOMContentLoaded', function () {
    // 初始化地图，设置默认的中心位置和缩放级别
    var map = L.map('map').setView([-37.7870, 175.2793], 12);  // 调整缩放级别，10 是一个合适的级别

    // 添加一个Tile Layer到地图中，使用OpenStreetMap的tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 添加一个标记
    var marker = L.marker([-37.7870, 175.2793]).addTo(map);
    marker.bindPopup("<b>Welcome to Hamilton!</b><br>This is Hamilton, New Zealand.").openPopup();
});
