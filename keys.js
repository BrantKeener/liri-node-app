
console.log('this is loaded');

exports.spotify = {
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
};

exports.BIT = {
    id: process.env.BIT_ID
};

exports.OMDB = {
    id: process.env.OMDB_ID
};