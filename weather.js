const request = require('request');

const { DARKSKY_API_KEY } = process.env;

var getWeather = (lat, lng, callback) => {
    request({
        url:`https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${lat},${lng}?units=si`,
        json: true
    }, (error, response, body)=>{
        if(error){
            callback('Unable to connect to Forecast.io server');
        }else if (response.statusCode === 400){
            callback('Unable to fetch weather.');
        }else if (!error && response.statusCode === 200){
            callback(undefined,{
                temperature: Math.round(body.currently.temperature)
            })
        }else{
            console.log('Unable to fetch weather.')
        }
        
    });
}

module.exports.getWeather = getWeather;