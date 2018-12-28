// TODO add to portfolio

// Begin by requiring dotenv
const env = require('dotenv').config();
const keyChain = require('./keys.js');
const axios = require('axios');
const moment = require('moment');
const http = require('http');
const inquirer = require('inquirer');
const fs = require('fs');
const port = 80;
const divider = '\n==============================\n';
/**
 * 
 * @param {string} entry
 * @param {string} searchChoice 
 */
function LogBuild(entry, searchChoice) 
    {
    this.divider = `\n==============================\n`;
    this.searchChoice = searchChoice
    this.entry = entry
    };
let logSheet = new LogBuild();

// Setup the server so we can test our Oauth api locally
let server = http.createServer(function() {
}).listen(port);

// Inquirer setup for easier access
(function initialInquiry() {
    console.log(`${divider}If you have any questions, please check the Readme for more information${divider}`);
    inquirer.prompt([
        {
        type: 'list',
        message: 'What would you like to look for\n?',
        choices: ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says'],
        name: 'choice'
        },

        // The user is instructed to enter particular data based on what option they chose in the 'choice' prompt
    ]).then(function(response) {
    inquireTitleArtist(response);
    });
})();

// Evaluates what user is looking for, and asks them to enter appropriate information to continue their search
function inquireTitleArtist(res) {
    let choice = res.choice;
    switch(choice) {
        case 'concert-this':
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the artist or band name here:',
                name: 'userEntry'
            }
        ]).then(function(response) {
            logSheet.searchChoice = 'Bandsintown';
            argCheck(response.userEntry, 'BIT', res);
        });
        break;
        case 'spotify-this-song':
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the song title here:',
                name: 'userEntry'
            }
        ]).then(function(response) {
            logSheet.searchChoice = 'Spotify';
            argCheck(response.userEntry, 'SPOT', res)
        });
        break;
        case 'movie-this':
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the movie title here:',
                name: 'userEntry'
            }
        ]).then(function(response) {
            logSheet.searchChoice = 'OMDB Movie Database';
            argCheck(response.userEntry, 'OMDB', res);
        });
        break;
        case 'do-what-it-says':
        inquirer.prompt([
            {
                type: 'list',
                message: 'I can be used for a simple search using pre-made combinations:',
                name: 'userEntry',
                choices: ['Bandsintown', 'Spotify', 'OMDB']
            }
        ]).then(function(response) {
            switch(response.userEntry) {
                case 'Bandsintown':
                logSheet.searchChoice = 'Bandsintown/random';
                logSheet.entry = 'Passenger';
                randomTxtPull('concert-this', 'BIT');
                break;
                case 'Spotify':
                randomTxtPull('spotify-this-song', 'SPOT');
                logSheet.searchChoice = 'Spotify/random';
                logSheet.entry = 'I Want it That Way';
                break;
                case 'OMDB':
                randomTxtPull('movie-this', 'OMDB');
                logSheet.searchChoice = 'OMDB Movie Database/random';
                logSheet.entry = 'Saving Private Ryan';
                break;
            }
        });
    };
};

    // Check to make sure that both arguments have valid inputs.
function argCheck(res, abbrev, choice) {
    if(res === '' && abbrev === 'OMDB') {
        logSheet.entry = 'Mr. Nobody';
        APIReachOut('Mr.+Nobody', abbrev, 'Mr. Nobody');
    } else if(res === '' && abbrev === 'BIT') {
        console.log(`${divider}       **Warning**\nYou must enter a band or artist${divider}`);
        inquireTitleArtist(choice);
    } else if(res !== '' && abbrev === 'BIT' || res !== '' && abbrev === 'OMDB') {
        logSheet.entry = res;
        let plusRes = res.replace(/\s/g, '+');
        APIReachOut(plusRes, abbrev);
    } else if(abbrev === 'SPOT' && res !== '') {
        logSheet.entry = res;
        let plusRes = res.replace(/\s/g, '+');
        particularArtist(plusRes, abbrev);
    } else if(abbrev === 'SPOT' && res === '') {
        logSheet.entry = 'The Sign';
        spotifyReachOut(res, abbrev);
    };
};

// This function utilizes the fs module to work on the "do-what-it-says" functionality
function randomTxtPull(res, abbrev) {
    let randomArray = [];
    fs.readFile('random.txt', 'utf8', (err, data) => {
        if(err) throw err;
        randomArray = data.split(',');
        let arrayNum = randomArray.indexOf(res);
        let roValue = randomArray[arrayNum + 1].replace(/"/g, '');
        console.log(`${divider}I'll find "${roValue}" for you${divider}`);
        res === 'movie-this' || res === 'concert-this' ? APIReachOut(roValue, abbrev) : spotifyReachOut(roValue, abbrev);
    });
};


// This can perform the API call for both BIT and OMDB
function APIReachOut(res, check, name) {
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
        let resdat = response.data;
        if(resdat.Error === 'Movie not found!') {
            console.log(`${divider}${resdat.Error}\nPlease try again.${divider}`);
            inquireTitleArtist({choice: 'movie-this'});
        } else {
            toUser(response, check, name);
        };
        })
        .catch(error => {
            if(error.response) {
                console.log('Response error: ' + error.response.status)
            } else if(error.request) {
                console.log('Request error: ' + error.request);
            } else {
                console.log('Setup Error: ' + error.message)
            };
            console.log(error.config);
        });
};

// Giving the user the option to limit to a particular performer
function particularArtist(res, abbrev) {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Would you like to search for a particular artist or band?',
            choices: ['Yes', 'No'],
            name: 'bandyesorno'
        }
    ]).then(response => {
        if(response.bandyesorno === 'Yes') {
            inquirer.prompt([
                {
                    input: 'input',
                    message: 'Please enter the band or artist name:',
                    name: 'artistname'
                }
            ]).then(response => {
                spotifyReachOut(res, abbrev, response.artistname);
                logSheet.artist = response.artistname;
            });
        } else {
            spotifyReachOut(res, abbrev);
        };
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
                    spotifyReachOut('The+Sign', abbrev, 'Ace of Base');
                } else if(error.request) {
                    console.log('Request error: ' + error.request)
                } else {
                    console.log('Setup Error: ' + error.message)
                };
            });
    }).catch(error => {
        console.log('This Error' + error);
    });
};

// OMDB and BIT console.log build
function toUser(res, check, name) {
    let nodat = `No Data Returned`;
    let resdat = res.data;
    if(check === 'BIT') {
        if(resdat.errorMessage === '[NotFound] The artist was not found' || resdat.length === 0 || resdat === `{warn=Not found}\n`) {
            if(resdat.errorMessage === '[NotFound] The artist was not found' || resdat === `{warn=Not found}\n`) {
                console.log(`${divider}Band or artist is not recognized${divider}`);
                inquireTitleArtist({choice: 'concert-this'});
                return res;
            } else if(resdat.length === 0) {
                console.log(`${divider}That artist or band is not currently touring${divider}`);
                logSheet.error = 'That artist or band is not currently touring';
                logVariableset();
                return res;
            };
        };
        for(let i = 0; i < resdat.length; i++) {
            let date = ((resdat[i].datetime) ? moment(resdat[i].datetime).format('MM/DD/YYYY') : nodat);
            let vName = (resdat[i].venue.name) ? resdat[i].venue.name : nodat;
            let vLoc = (resdat[i].venue.city && resdat[i].venue.country) ? `${resdat[i].venue.city}, ${resdat[i].venue.country}` : nodat;
            console.log(`\nVenue Name: ${vName}`);
            console.log(`Venue Location: ${vLoc}`);
            console.log(`Date of Event: ${date}`);
            logSheet[`vName${i}`] = vName;
            logSheet[`vLoc${i}`] = vLoc;
            logSheet[`date${i}`] = date;
        };
    };
    if(check === 'OMDB') {
        if(name === 'Mr. Nobody') {
            console.log(`${divider}No movie title provided, perhaps you would like to see the following movie${divider}`)
        };
        let title = (resdat.Title) ? resdat.Title : nodat;
        let year = (resdat.Year) ? resdat.Year : nodat;
        let ratingIMDB = (resdat.Ratings[0]) ? resdat.Ratings[0].Value : nodat;
        let ratingRotten = (resdat.Ratings[1]) ? resdat.Ratings[1].Value : nodat;
        let country = (resdat.Country) ? resdat.Country : nodat;
        let language = (resdat.Language) ? resdat.Language : nodat; 
        let plot = (resdat.Plot) ? resdat.Plot : nodat;
        let actors = (resdat.Actors) ? resdat.Actors : nodat;
        console.log(`Title: ${title}`);
        console.log(`Year: ${year}`);
        console.log(`IMDB Rating ${ratingIMDB}`);
        console.log(`Rotten Tomatoes Rating: ${ratingRotten}`);
        console.log(`Produced in: ${country}`);
        console.log(`Available Languages: ${language}`);
        console.log(`Plot: ${plot}`);
        console.log(`Actors: ${actors}`);
        logSheet.year = year;
        logSheet.ratingIMDB = ratingIMDB;
        logSheet.ratingRotten = ratingRotten;
        logSheet.country = country;
        logSheet.language = language;
        logSheet.plot = plot;
        logSheet.actors = actors;
    };
    if(check === 'SPOT') {
        let resTracks = resdat.tracks;
        let nameArray = [];
        for(let i = 0; i < resTracks.items.length; i++) {
            let resItems = resTracks.items[i];
            nameArray.push(resItems.album.artists[0].name);
        };
        if(name === undefined || nameArray.indexOf(name) === -1) {
            console.log(`${divider}Band or artist is either not recognized, or no band/artist was provided${divider}`);
            for(let i = 0; i < resTracks.items.length; i++) {
                let resItems = resTracks.items[i];
                let artist = (resItems.album.artists[0].name) ? resItems.album.artists[0].name : nodat; 
                let song = (resItems.name) ? resItems.name : nodat;
                let preview = (resItems.preview_url) ? resItems.preview_url : nodat;
                let album = (resItems.album.name) ? resItems.album.name : nodat;
                console.log(`\nArtist Name: ${artist}`);
                console.log(`Song Name: ${song}`);
                console.log(`Preview Link: ${preview}`);
                console.log(`Album Name: ${album}`);
                logSheet[`artist${i}`] = artist;
                logSheet[`song${i}`] = song;
                logSheet[`preview${i}`] = preview;
                logSheet[`album${i}`] = album;
            };
        } else {
            for(let i = 0; i < resTracks.items.length; i++) {
                let resItems = resTracks.items[i]
                if(resItems.album.artists[0].name === name) {
                    if(name === 'Ace of Base') {
                        console.log(`${divider}Song title was either not recognized, or no song title was provided\nCheck out this song from Ace of Base${divider}`);
                    };
                    let resItems = resTracks.items[i];
                    let artist = (resItems.album.artists[0].name) ? resItems.album.artists[0].name : nodat; 
                    let song = (resItems.name) ? resItems.name : nodat;
                    let preview = (resItems.preview_url) ? resItems.preview_url : nodat;
                    let album = (resItems.album.name) ? resItems.album.name : nodat;
                    console.log(`\nArtist Name: ${artist}`);
                    console.log(`Song Name: ${song}`);
                    console.log(`Preview Link: ${preview}`);
                    console.log(`Album Name: ${album}`);
                    logSheet.artist = artist;
                    logSheet.song = song;
                    logSheet.preview = preview;
                    logSheet.album = album;
                };
            };
        };
    };
    logVariableset();
};

function logVariableset() {
    let ls = logSheet;
    let logEntryOMDB = `${ls.divider}
    API Called: ${ls.searchChoice}
    User Search: ${ls.entry}
    Year: ${ls.year}
    IMDB Rating: ${ls.ratingIMDB}
    Rotten Tomatoe Rating: ${ls.ratingRotten}
    Production Country: ${ls.country}
    Languages: ${ls.language}
    Plot: ${ls.plot}
    Actors: ${ls.actors}\n`;
    let logEntryBIT = `${ls.divider}
    API Called: ${ls.searchChoice}
    User Search: ${ls.entry}\n`
    let logEntrySPOT = `${ls.divider}
    API Called: ${ls.searchChoice}
    User Search: ${ls.entry}\n`;
    if(ls.searchChoice === 'OMDB Movie Database' || ls.searchChoice === 'OMDB Movie Database/random') {
        omdbAppendFile(logEntryOMDB);
    };
    if(ls.searchChoice === 'Bandsintown' || ls.searchChoice === 'Bandsintown/random') {
        bitAppendFile(logEntryBIT);
    };
    if(ls.searchChoice === 'Spotify' || ls.searchChoice === 'Spotify/random') {
        spotAppendFile(logEntrySPOT);
    }
};

function omdbAppendFile(log) {
    fs.appendFile('log.txt', log, (err) => {
        if(err) throw err;
        serverClose();
    });
};

function bitAppendFile(log) {
    let length = ((Object.keys(logSheet).length - 3) / 3);
    if(length < 1) {
        fs.appendFileSync('log.txt', log);
        fs.appendFile('log.txt', `${divider}That artist or band is not currently touring${divider}`, (err) => {
            if(err) throw err;
        });
    } else {
        fs.appendFile('log.txt', log, (err) => {
            if(err) throw err;
            for(let i = 0; i < length; i++) {
                let venueName = '\nVenue Name: ' + logSheet[`vName${i}`] + '\n';
                let venueLocation = 'Venue Location: ' + logSheet[`vLoc${i}`] + '\n';
                let venueDate = 'Date: ' + logSheet[`date${i}`] + '\n'
                fs.appendFileSync('log.txt', venueName);
                fs.appendFileSync('log.txt', venueLocation);
                fs.appendFileSync('log.txt', venueDate);
            };
        });
    };
    setTimeout(serverClose, 100);
};

function spotAppendFile(log) {
    let length = ((Object.keys(logSheet).length - 3) / 4);
    fs.appendFile('log.txt', log, (err) => {
        if(err) throw err;
        for(let i = 0; i < length; i++) {
            let artistName = '\nArtist Name: ' + logSheet[`artist${i}`] + '\n';
            let songName = 'Song Name: ' + logSheet[`song${i}`] + '\n';
            let preview = 'Preview: ' + logSheet[`preview${i}`] + '\n';
            let album = 'Album: ' + logSheet[`album${i}`] + '\n';
            fs.appendFileSync('log.txt', artistName);
            fs.appendFileSync('log.txt', songName);
            fs.appendFileSync('log.txt', preview);
            fs.appendFileSync('log.txt', album);
        };
    });
    setTimeout(serverClose, 100);
};

function serverClose() {
    server.close(function() {
        process.exit();
    });
};
