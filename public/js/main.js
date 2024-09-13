document.addEventListener('DOMContentLoaded', function () {
    // 初始化地图，设置默认的中心位置和缩放级别
    // Initialize the map and set the default center location and zoom level
    var map = L.map('map').setView([-37.787472, 175.316306], 15);  // 15 是一个适合大学区域的缩放级别

    // 添加一个Tile Layer到地图中，使用OpenStreetMap的tiles
    // Add a Tile Layer to the map, using OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 添加一个标记
    // Add a marker
    var marker = L.marker([-37.787472, 175.316306]).addTo(map);
    marker.bindPopup("<b>Welcome to University of Waikato!</b><br>This is Waikato Uni, New Zealand.").openPopup();

    // 添加搜索控件
    // Add a search control
    var geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
    })
        .on('markgeocode', function(e) {
            var latlng = e.geocode.center;
            L.marker(latlng).addTo(map)
                .bindPopup(e.geocode.name)
                .openPopup();

            fetchWeatherAndShowPopup(marker, [latlng.lat, latlng.lng], e.geocode.name);
            map.setView(latlng, 15); // 根据搜索结果居中地图
        })
        .addTo(map);

    // 获取天气数据并展示在标记的弹出窗口中
    function fetchWeatherAndShowPopup(marker, latlng, placeName) {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latlng[0]}&longitude=${latlng[1]}&current_weather=true`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const weather = data.current_weather;
                const popupContent = `
                <b>${placeName}</b><br>
                <b>Temperature:</b> ${weather.temperature}°C<br>
                <b>Wind Speed:</b> ${weather.windspeed} km/h
            `;
                marker.bindPopup(popupContent).openPopup();
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                marker.bindPopup(`<b>${placeName}</b><br>Weather data not available`).openPopup();
            });
    }
});
