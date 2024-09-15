# 527-WeatherDashboard

The Cloud-Based Weather Dashboard Application is designed to provide users with accurate and up-to-date weather information, tailored to their specific location. Leveraging modern cloud technologies and comprehensive weather data from the Open-Meteo API, the application aims to offer a seamless and interactive user experience.

# Local setup

- Create `.env` file in root directory, which should contain:
  ```env
  USER_POOL_ID (AWS Cognito User Pool ID)
  CLIENT_ID (AWS Cognito User Pool Client APP ID)
  CLIENT_SECRET (AWS Cognito User Pool Client APP Secret)
  API_KEY (GeoLocation API Key)
  ```
  The properties are shared among group members.
  Please keep them secret only inside the group.
- Run `npm install`
- Run `node app.js` to start the application
- If successful, you can access the application at `localhost:3000`

# Leaflet configuration

- Using Leaflet in [main.js](public%2Fjs%2Fmain.js)
- Default settings in folder [leaflet](public/leaflet)