// main.js

document.addEventListener('DOMContentLoaded', function () {
    // 初始化地图，设置默认的中心位置和缩放级别
    var map = L.map('map').setView([-37.787472, 175.316306], 15);  // 调整缩放级别，10 是一个合适的级别

    // 添加一个Tile Layer到地图中，使用OpenStreetMap的tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 添加一个标记
    var marker = L.marker([-37.787472, 175.316306]).addTo(map);
    marker.bindPopup("<b>Welcome to University of Waikato!</b><br>This is Waikato Uni, New Zealand.").openPopup();
});
