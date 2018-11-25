const Dialogflow = require('dialogflow');
const Pusher = require('pusher');

const geocode = require('./geocode');
const weather = require('./weather');

//DialogFlow project Ids
const projectId = 'minds-c37d5'; 
const sessionId = '123456';
const languageCode = 'en-US';

const config = {
    credentials: {
      private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    },
};

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: true
});

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const processMessage = message => {
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode
            },
        },
    };

    sessionClient.detectIntent(request).then(responses => {
        const result = responses[0].queryResult;

        //If the intent matches 'detect-city'
        if (result.intent.displayName === 'detect-city') {
            const city = result.parameters.fields['geo-city'].stringValue;

             // fetch coords with google maps api
             return geocode.geocodeAddress(city, (errorMessage, results) => {
                 if(errorMessage){
                     console.log(errorMessage);
                 }else{
                    weather.getWeather(results.latitude, results.longitude, (errorMessage, weatherResults) => {
                        if(errorMessage){
                            console.log(errorMessage);
                        }else{
                            var message = `The weather in ${city} is ${weatherResults.temperature}°C`;
                            if(weatherResults.temperature < 14){
                                message = `El tiempo en ${city} es ${weatherResults.temperature}°C, hace un puto frio que flipas`
                            }
                            return pusher.trigger('bot', 'bot-response', {
                                message: message
                            });
                        }
                    });
                 }
             });
        }

        return pusher.trigger('bot', 'bot-response', {
            message: result.fulfillmentText,
        });
    }).catch(err => {
        console.error('ERROR', err);
    });
}

module.exports = processMessage;
