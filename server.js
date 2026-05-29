const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const { WebcastPushConnection } = require('tiktok-live-connector');
const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// TikTok hasabyňyzyň ady awtomatiki goşuldy
const TIKTOK_USERNAME = "hamancik01"; 

let tiktokConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokConnection.connect().then(state => {
    console.log(`TikTok göni efirine birikdi Room ID: ${state.roomId}`);
}).catch(err => {
    console.error('TikTok-a birigip bolmady:', err);
});

tiktokConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return; 

    const giftName = data.giftName;
    const count = data.repeatCount;
    let team = null;

    if (giftName === 'Rose') {
        team = 'TM'; 
    } else if (giftName === 'Finger Heart' || giftName === 'Balloon') {
        team = 'TR'; 
    }

    if (team) {
        io.emit('tiktok-gift', {
            team: team,
            count: count,
            user: data.uniqueId
        });
    }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Serwer ${PORT} portunda işläp başlady.`);
});
