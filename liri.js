
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
        // case 'SPOTIFY-THIS-SONG':
        // spotifyReachOut();
        // break;
        // case 'MOVIE-THIS':
        // OMDBReachOut();
        // break;
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

argCheck();