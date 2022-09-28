// This is just a backup copy of the actual endpoint running on running on https://runkit.com/ 
const ytdl = require('ytdl-core');
const express = require("@runkit/runkit/express-endpoint/1.0.0");
const cors = require('cors');

const app = express(exports);
app.use(cors());

app.get("/", async (req, res) => {
    const result = await getInfo(req.query.url);
    res.json(result);
})

async function getInfo(url) {
    const videoID = url;
    let info = await ytdl.getInfo(videoID);

    let formats = [...ytdl.filterFormats(info.formats, 'videoandaudio'), ...ytdl.filterFormats(info.formats, 'audioandvideo')];
    
     const captions = info.player_response.captions
    
    const tracks = captions ? captions.playerCaptionsTracklistRenderer.captionTracks : null;
    
    return {formats, tracks};
}