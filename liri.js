
// Begin by requiring dotenv
const env = require('dotenv').config();
const keyChain = require('./keys.js');
const axios = require('axios');
const moment = require('moment');
const http = require('http');
const hostname = '127.0.0.1';
const port = 80;
const userEntertainmentChoice = process.argv[2];
const userArtistMovieChoice = process.argv[3];

// Setup the server so we can test our Oauth api locally
http.createServer(function(request, response) {
    response.writeHead(200, {'content-type': 'text/plain'});
    response.write('Hello World');
    response.end();
}).listen(80);

// Check to make sure that both arguments have valid inputs
function argCheck() {
    if(userEntertainmentChoice === undefined || userArtistMovieChoice === undefined) {
        console.log('First argument: 1)"concert-this", 2)"spotify-this-song", or 3)"movie-this"');
        console.log('Second argment: 1)"artist/band name", 2)"song title", or 3)"movie title"');
    } else {
        reachOut();
    };
};

// Find the user input arguments to decide whether to reach out to Spotify, BIT, or OMDB
function reachOut() {
    switch(userEntertainmentChoice.toUpperCase()) {
        case 'CONCERT-THIS':
        APIReachOut('BIT');
        break;
        case 'SPOTIFY-THIS-SONG':
        spotifyReachOut();
        break;
        case 'MOVIE-THIS':
        APIReachOut('OMDB');
        break;
        default:
        console.log('Your first argument must be "concert-this", "spotify-this-song", or "movie-this"');
        break;
    };
};

function APIReachOut(check) {
    let queryBase = '';
    let queryURL = '';
    switch(check) {
        case 'BIT':
        console.log('bit');
        queryBase = `https://rest.bandsintown.com`;
        queryURL = `/artists/${userArtistMovieChoice}/events?app_id=${keyChain.BIT.id}`;
        break;
        case 'OMDB':
        console.log('omdb');
        queryBase = '';
        queryURL = `https://www.omdbapi.com/?apikey=${keyChain.OMDB.id}&t=${userArtistMovieChoice}&type=movie`;
        break;
    };
    axios ({
        method: 'get',
        baseURL: queryBase,
        url: queryURL,
        responseType: 'json',
    }).then(response => {
        toUser(response, check);
        })
        .catch(error => {
            if(error.response) {
                console.log('Response error: ' + error.response.status)
            } else if(error.request) {
                console.log('Request error: ' + error.request)
            } else {
                console.log('Setup Error: ' + error.message)
            };
            console.log(error.config);
        });
};

// OMDB and BIT console.log build
function toUser(res, check) {
    if(check === 'BIT') {
        for(let i = 0; i < res.data.length; i++) {
            let date = moment(res.data[i].datetime).format('MM/DD/YYYY');
            console.log(`Venue Name: ${res.data[i].venue.name}`);
            console.log(`Venue Location: ${res.data[i].venue.city}, ${res.data[i].venue.country}`);
            console.log(`Date of Event: ${date}`);
            console.log(` `);
        };
    };
    if(check === 'OMDB') {
        console.log(`Title: ${res.data.Title}`);
        console.log(`Year Released: ${res.data.Year}`);
        console.log(`IMDB Rating: ${res.data.Ratings[0].Value}`);
        console.log(`Rotten Tomatoes: ${res.data.Ratings[1].Value}`);
        console.log(`Produced in: ${res.data.Country}`);
        console.log(`Available Languages: ${res.data.Language}`);
        console.log(`Plot: ${res.data.Plot}`);
        console.log(`Actors: ${res.data.Actors}`);
    };
};

// Not working yet. Think about combining all three API calls
let options = {
    hostname: 'accounts.spo9tify'
}





function spotifyReachOut() {
    let client_id = keyChain.spotify.id;
    let client_secret = keyChain.spotify.secret;
    axios ({
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        params: {
            grant_type: 'client_credentials'
        },
        headers: {
            'Accept' : 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
            username: client_id,
            password: client_secret
        }
    }).then(response => {
        axios ({
            baseURL: `https://api.spotify.com`,
            url: `/v1/search/?q=${userArtistMovieChoice}&type=track`,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + response.data.access_token,
                'Accept' : 'application/json',
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
        }).then(response => {
            console.log(response.data);
            })
            .catch(error => {
                if(error.response) {
                    console.log('Response error: ' + error.response.status)
                } else if(error.request) {
                    console.log('Request error: ' + error.request)
                } else {
                    console.log('Setup Error: ' + error.message)
                };
                console.log(error.config);
            });
    }).catch(error => {
        console.log('This Error' + error);
    });
};
   



//     axios.post(authOptions, function(error, response, body) {
//         if(!error && response.statusCode === 200) {
//             let token = body.access_token;
//             let options = {
//                 baseURL: 'https://api.spotify.com/',
//                 url: `v1/search/?q=track:${userArtistMovieChoice}&type-track`,
//                 headers: {
//                     'Autorization': `Bearer ${token}`
//                 },
//                 json: true
//             };
//         };
//     }).catch(error => {
//         console.log(error);
//     });
// };

argCheck();