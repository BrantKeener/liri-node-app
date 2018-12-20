// TO-DO log appropriate data to log.txt with headers
// Handle events when user does not enter a band, song, or movie
// Handle events when user's input does not return a valid datum
// Add 'do-what-it-says' functionality

// Begin by requiring dotenv
const env = require('dotenv').config();
const keyChain = require('./keys.js');
const axios = require('axios');
const moment = require('moment');
const http = require('http');
const inquirer = require('inquirer');
const port = 80;

// Setup the server so we can test our Oauth api locally
let server = http.createServer(function() {
}).listen(port);

// Inquirer setup for easier access
inquirer.prompt([
    {
       type: 'list',
       message: 'What would you like to look for\n?',
       choices: ['Look for a concert', 'Look for a song', 'Look for a movie'],
       name: 'choice'
    },

    // The user is instructed to enter particular data based on what option they chose in the 'choice' prompt
]).then(function(response) {
   inquireTitleArtist(response);
});

// Evaluates what user is looking for, and asks them to enter appropriate information to continue their search
function inquireTitleArtist(res) {
    console.log(res);
    let choice = res.choice;
    switch(choice) {
        case 'Look for a concert':
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the artist or band name here:',
                name: 'userEntry'
            }
        ]).then(function(response) {
            argCheck(response.userEntry, 'BIT', res);
        });
        break;
        case 'Look for a song':
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the song title here:',
                name: 'userEntry'
            }
        ]).then(function(response) {
            argCheck(response.userEntry, 'SPOT', res)
        });
        break;
        case 'Look for a movie':
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the movie title here:',
                name: 'userEntry'
            }
        ]).then(function(response) {
            argCheck(response.userEntry, 'OMDB', res)
        });
        break;
    };
};

    // Check to make sure that both arguments have valid inputs.
function argCheck(res, abbrev, choice) {
    if(res === '' && abbrev === 'OMDB') {
        APIReachOut('Mr.+Nobody', abbrev);
    } else if(res === '' && abbrev === 'BIT') {
        console.log('\n====\nPlease enter a band or artist name\n====\n');
        console.log(res);
        inquireTitleArtist(choice);
    } else if(res !== '' && abbrev === 'BIT' || res !== '' && abbrev === 'OMDB') {
        let plusRes = res.replace(/\s/g, '+');
        APIReachOut(plusRes, abbrev);
    } else if(abbrev === 'SPOT') {
        let plusRes = res.replace(/\s/g, '+');
        spotifyReachOut(plusRes, abbrev)
    };
};

// This can perform the API call for both BIT and OMDB
function APIReachOut(res, check) {
    let queryBase = '';
    let queryURL = '';
    switch(check) {
        case 'BIT':
        queryBase = `https://rest.bandsintown.com`;
        queryURL = `/artists/${res}/events?app_id=${keyChain.BIT.id}`;
        break;
        case 'OMDB':
        queryBase = '';
        queryURL = `https://www.omdbapi.com/?apikey=${keyChain.OMDB.id}&t=${res}&type=movie`;
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

// Spotify API call with Ace of Base default
function spotifyReachOut(res, abbrev, name) {
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
            url: `/v1/search/?q=${res}&type=track`,
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + response.data.access_token,
                'Accept' : 'application/json',
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
        }).then(response => {
            let noRes = response.data.tracks.total;
            if(noRes === 0) {
                spotifyReachOut('The Sign', abbrev, 'Ace of Base');
            } else {
                toUser(response, abbrev, name);
            };
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

// OMDB and BIT console.log build
function toUser(res, check, name) {
    let resdat = res.data;
    if(check === 'BIT') {
        for(let i = 0; i < resdat.length; i++) {
            let date = moment(resdat[i].datetime).format('MM/DD/YYYY');
            console.log(`Venue Name: ${resdat[i].venue.name}`);
            console.log(`Venue Location: ${resdat[i].venue.city}, ${resdat[i].venue.country}`);
            console.log(`Date of Event: ${date}\n`);
        };
    };
    if(check === 'OMDB') {
        console.log(`Title: ${resdat.Title}`);
        console.log(`Year Released: ${resdat.Year}`);
        console.log(`IMDB Rating: ${resdat.Ratings[0].Value}`);
        console.log(`Rotten Tomatoes: ${resdat.Ratings[1].Value}`);
        console.log(`Produced in: ${resdat.Country}`);
        console.log(`Available Languages: ${resdat.Language}`);
        console.log(`Plot: ${resdat.Plot}`);
        console.log(`Actors: ${resdat.Actors}`);
    };
    if(check === 'SPOT') {
        let resTracks = resdat.tracks;
        if(name === undefined) {
            for(let i = 0; i < resTracks.items.length; i++) {
                let resItems = resTracks.items[i];
                console.log(`\nArtist Name: ${resItems.album.artists[0].name}`);
                console.log(`Song Name: ${resItems.name}`);
                console.log(`Preview Link: ${resItems.preview_url}`);
                console.log(`Album Name: ${resItems.album.name}`);
            };
        } else {
            for(let i = 0; i < resTracks.items.length; i++) {
                let resItems = resTracks.items[i];
                if(resItems.album.artists[0].name === 'Ace of Base') {
                    console.log(`\nArtist Name: ${resItems.album.artists[0].name}`);
                    console.log(`Song Name: ${resItems.name}`);
                    console.log(`Preview Link: ${resItems.preview_url}`);
                    console.log(`Album Name: ${resItems.album.name}`);
                };
            };
        };
    };
    server.close(function() {
        process.exit();
    });
};