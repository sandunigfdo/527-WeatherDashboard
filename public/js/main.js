document.addEventListener('DOMContentLoaded', function () {
    // 初始化地图，设置默认的中心位置和缩放级别
    // Initialize the map and set the default center location and zoom level
    var map = L.map('map').setView([-37.787472, 175.316306], 15);

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
            var newMarker = L.marker(latlng).addTo(map) // 创建一个新的标记
                .bindPopup(e.geocode.name)
                .openPopup();

            fetchWeatherAndShowPopup(newMarker, [latlng.lat, latlng.lng], e.geocode.name); // 传递新标记
            map.setView(latlng, 15); // 根据搜索结果居中地图

            // 获取天气数据并添加时间轴图层
            fetchWeatherData(latlng.lat, latlng.lng)
                .then(weatherData => {
                    var geojsonData = createGeoJSON(weatherData, latlng.lat, latlng.lng);
                    addTimelineLayer(geojsonData);
                });
        })
        .addTo(map);

    // 默认加载初始位置的天气数据
    fetchWeatherData(-37.787472, 175.316306)
        .then(weatherData => {
            var geojsonData = createGeoJSON(weatherData, -37.787472, 175.316306);
            addTimelineLayer(geojsonData);
        });

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



    function fetchWeatherData(lat, lon) {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&start=${new Date().toISOString().split('T')[0]}&timezone=UTC`;

        return fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // 返回小时级的温度数据
                return data.hourly;
            });
    }

    function createGeoJSON(weatherData, lat, lon) {
        const features = weatherData.time.map((time, index) => {
            return {
                type: "Feature",
                properties: {
                    time: new Date(time).getTime(), // 时间戳，单位为毫秒
                    temperature: weatherData.temperature_2m[index]
                },
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                }
            };
        });

        return {
            type: "FeatureCollection",
            features: features
        };
    }

    function addTimelineLayer(geojsonData) {
        var timelineLayer = L.timeline(geojsonData, {
            getInterval: function(feature) {
                return {
                    start: feature.properties.time,
                    end: feature.properties.time + 3600 * 1000 // 每个时间段为1小时
                };
            },
            pointToLayer: function(feature, latlng) {
                var temperature = feature.properties.temperature;
                var color = getColorByTemperature(temperature);

                return L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: color,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup(
                    `<b>Time:</b> ${new Date(feature.properties.time).toUTCString()}<br><b>Temperature:</b> ${temperature}°C`
                );
            }
        });

        timelineLayer.addTo(map);

        // 添加时间控件
        var timelineControl = L.timelineSliderControl({
            formatOutput: function(date) {
                return new Date(date).toUTCString();
            }
        });

        timelineControl.addTo(map);
        timelineControl.addTimelines(timelineLayer);
    }

    function getColorByTemperature(temperature) {
        return temperature > 30 ? '#FF0000' :
            temperature > 20 ? '#FFA500' :
                temperature > 10 ? '#FFFF00' :
                    temperature > 0  ? '#00FF00' :
                        '#00FFFF';
    }

});
