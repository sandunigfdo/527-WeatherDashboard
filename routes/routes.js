const express = require('express');
const router = express.Router();
const axios = require('axios');

// Define your routes here
// router.get('/', (req, res) => {
//     res.render('home', {
//         title: 'Weather Dashboard', // Title for the main page
//         // You can add more data here to pass to the handlebars template
//     });
// });

router.get('/', async (req, res) => {
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-37.7898&longitude=175.319&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Pacific%2FAuckland';
        const response = await axios.get(url);
        console.log(response.data);
        const data = response.data;


        const temperature = data.current.temperature_2m;
        const humidity = data.current.relative_humidity_2m;
        const windSpeed = data.current.wind_speed_10m;

        res.render('home', {
            temperature: `${temperature}°C`,
            humidity: `${humidity}%`,
            windSpeed: `${windSpeed} km/h`
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.render('home', {
            error: 'Unable to load weather data'
        });
    }
});



