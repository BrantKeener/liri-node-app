
**Note: If you would like to see a demo, go here: https://brantkeener.github.io/Backend-Demos/**
**Note: The .env file structure is easiest to copy by opening this readme in VS Code, and copying the structure between the ==========**

# Liri the Bot

*Entertainment built for Node.js*
**Liri the Bot** allows users to perform three different types of searches, all of which are entertainment related.
The user may:
1. Search [Bandsintown](https://www.bandsintown.com) for available tour dates/venues for an artist or band.
2. Search [OMDB Movie Database](www.omdbapi.com) for a movie title.
3. Search [Spotify](https://www.spotify.com) for a song.
    1. This can be performed with or without a band or artist name.

## Motivation

Creating **Liri the Bot** allowed for exploration of multiple APIs, including the Oauth (Client Credentials Flow) of Spotify's API with the http npm. Working in Node.js and the command line interface allowed this developer to gain familiarity with both.

## Build Status

Complete

## Code Style

Standard

## Demo

To view the demonstration video, please go to https://brantkeener.github.io/Backend-Demos/

## Tech/framework Used

Built entirely utilizing Node.js

## Features

A clean and user-friendly command line interface with robust error handling and frequent commentary to the user allows this app to be utilized bye users that are completely new to working in the CLI. By commenting the user through the project within the command line, a straight forward user experience is possible within an aspect of computing (the CLI) that is often very intimidating for users.

## Installation

Perform either a clone or a fork by visiting [Liri Bot](https://github.com/BrantKeener/liri-node-app). This will give you access to everything except the **.env** file. The **.env** file contains the following information laid out exactly as written:

**====================**
# Spotify API keys

SPOTIFY_ID=_Put your spotify CLIENT ID here_
SPOTIFY_SECRET=_Put your CLIENT SECRET here_

# Bands In Town API keys

BIT_ID=_Put your Bandsintown API Key here_

# OMDB API keys

OMDB_ID=_Put your OMDB API Key here_ 
**====================**

The user must provide all of their own keys and secrets as seen above for this app to work properly. They can be obtained in the following places: 
1. [Spotify](HTTPS://developer.spotify.com/dashboard)
2. [Bandsintown](https://manager.bandsintown.com/support/bandsintown-api)
3. [OMDB](www.omdbapi.com/apikey.aspx)

After you have the appropriate API keys, you will just need to install the appropriate npm files, which are included in the package.json as dependencies. Perform an npm install, and you are ready! You may also perform the following installs manually if you choose:
1. axios
2. dotenv
3. fs
4. inquirer
5. moment

## How to Use

After installation, launch your favorite terminal, head over to the folder the project is installed into, and run node liri.js.
The user will immediately be greeted, and a multiple choice menu will appear. Navigate the menus following the prompts as needed.
The **do-what-it-says** command will pull a pre-made API call from random.txt and run it for you. This is useful during testing, or if you aren't sure what you want.

## Credits

Written and maintained by Brant Keener.
