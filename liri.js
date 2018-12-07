
// Begin by requiring dotenv
const env = require('dotenv').config();
const keyChain = require('./keys.js');
const axios = require('axios');
const userEntertainmentChoice = process.argv[2];
const userArtistMovieChoice = process.argv[3];
const moment = require('moment');

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
        BITReachOut();
        break;
        case 'SPOTIFY-THIS-SONG':
        spotifyReachOut();
        break;
        case 'MOVIE-THIS':
        OMDBReachOut();
        break;
        default:
        console.log('Your first argument must be "concert-this", "spotify-this-song", or "movie-this"');
        break;
    };
};

function BITReachOut() {
    axios ({
        method: 'get',
        baseURL: `https://rest.bandsintown.com`,
        url: `/artists/${userArtistMovieChoice}/events?app_id=${keyChain.BIT.id}`,
        responseType: 'json',
    }).then(response => {
        BITToUser(response);
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

function BITToUser(res) {
    for(let i = 0; i < res.data.length; i++) {
        let date = moment(res.data[i].datetime).format('MM/DD/YYYY');
        console.log(`Venue Name: ${res.data[i].venue.name}`);
        console.log(`Venue Location: ${res.data[i].venue.city}, ${res.data[i].venue.country}`);
        console.log(`Date of Event: ${date}`);
        console.log(` `);
    }
};

// OMDB API Call
function OMDBReachOut() {
    axios({
        method: 'get',
        baseURL: '',
        url: `https://www.omdbapi.com/?apikey=${keyChain.OMDB.id}&t=${userArtistMovieChoice}&type=movie`,
        responseType: 'json'
    }).then(response => {
        let res = response.data;
        console.log(`Title: ${res.Title}`);
        console.log(`Year Released: ${res.Year}`);
        console.log(`IMDB Rating: ${res.Ratings[0].Value}`);
        console.log(`Rotten Tomatoes: ${res.Ratings[1].Value}`);
        console.log(`Produced in: ${res.Country}`);
        console.log(`Available Languages: ${res.Language}`);
        console.log(`Plot: ${res.Plot}`);
        console.log(`Actors: ${res.Actors}`);
    }).catch(error => {
        if(error.response) {
            console.log('Response error: ' + error.response.status)
        } else if(error.request) {
            console.log('Request error: ' + error)
        } else {
            console.log('Setup Error: ' + error.message)
        };
    })
};

// Not working yet. Think about combining all three API calls
// function spotifyReachOut() {
//     let client_id = keyChain.spotify.id;
//     let client_secret = keyChain.spotify.secret;
//     axios ({
//         method: 'post',
//         url: 'https://accounts.spotify.com/api/token',
//         headers: {
//             'Autorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//         },
//         form: {
//             grant_type: 'client_credentials'
//         },
//         json: true
//     }).then(response => {
//         console.log(response);
//     }).catch(error => {
//         console.log('This Error' + error.message);
//     });
// };
// //     axios ({
// //         method: 'get',
// //         baseURL: `https://api.spotify.com`,
// //         url: `/v1/search/?q=track:${userArtistMovieChoice}&type-track`,
// //         responseType: 'json',
// //         headers: {
// //             'Authorization': 'Bearer' + token
// //         },
// //         json: true
// //     }).then(response => {
// //         console.log(response);
// //         })
// //         .catch(error => {
// //             if(error.response) {
// //                 console.log('Response error: ' + error.response.status)
// //             } else if(error.request) {
// //                 console.log('Request error: ' + error.request)
// //             } else {
// //                 console.log('Setup Error: ' + error.message)
// //             };
// //             console.log(error.config);
// //         });
// // };



// //     axios.post(authOptions, function(error, response, body) {
// //         if(!error && response.statusCode === 200) {
// //             let token = body.access_token;
// //             let options = {
// //                 baseURL: 'https://api.spotify.com/',
// //                 url: `v1/search/?q=track:${userArtistMovieChoice}&type-track`,
// //                 headers: {
// //                     'Autorization': `Bearer ${token}`
// //                 },
// //                 json: true
// //             };
// //         };
// //     }).catch(error => {
// //         console.log(error);
// //     });
// // };

argCheck();