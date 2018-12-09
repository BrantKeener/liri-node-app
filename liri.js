// TO DO: Make sure user inputs data when prompted, otherwise ask again
// TO DO: Parse through spotify JSON data

// Maybe try json.stringify for spotify return!!!
// Add inquirer functionality?

// Begin by requiring dotenv
const env = require('dotenv').config();
const keyChain = require('./keys.js');
const axios = require('axios');
const moment = require('moment');
const http = require('http');
const inquirer = require('inquirer');
const port = 80;
const userEntertainmentChoice = process.argv[2];
const userArtistMovieChoice = process.argv[3];

// Setup the server so we can test our Oauth api locally
let server = http.createServer(function(request, response) {
    response.writeHead(200, {'content-type': 'text/plain'});
    response.write('Hello World');
    response.end();
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
            reachOut(response.userEntry, 'CONCERT-THIS', res)
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
}

    // Check to make sure that both arguments have valid inputs. This should be retooled.
function argCheck(res, abbrev, choice) {
    if(res === '') {
        console.log('\n***\nPlease read the message carefully and try again\n***\n');
        inquireTitleArtist(choice);
    } else {
        APIReachOut(res, abbrev);
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

    // OMDB and BIT console.log build
    function toUser(res, check) {
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
        server.close(function() {
            process.exit();
        });
    };

    // Not working yet. Think about combining all three API calls
    let options = {
        hostname: 'accounts.spo9tify'
    };

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
                console.log(JSON.stringify(response.data.tracks.items, null, 2));
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