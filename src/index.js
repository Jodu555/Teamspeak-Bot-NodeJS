require('dotenv').config();
const { TeamSpeak, QueryProtocol } = require('ts3-nodejs-library');

//create a new connection
TeamSpeak.connect({
    host: "rooti.jodu555.de",
    protocol: QueryProtocol.RAW, //optional
    queryport: 10011, //optional
    serverport: 9987,
    username: "serveradmin",
    password: process.env.QUERY_PASSWORD,
    nickname: "NodeJS-BOT"
}).then(async teamspeak => {
    const buildThereString = async () => {
        const clients = await teamspeak.clientList({ clientType: 0 });
        return `[cspacer]Derzeit ${clients.length == 1 ? 'ist' : 'sind'} ${clients.length} Spieler Online`
    }

    const clients = await teamspeak.clientList({ clientType: 0 });
    clients.forEach(client => {
        console.log("Sending 'Hello!' Message to", client.nickname);
        // client.message("Hello!")
    })

    const channel = await teamspeak.getChannelById('33');
    console.log(channel);
    channel.edit({
        channelName: await buildThereString(),
    })



}).catch(e => {
    console.log("Catched an error!")
    console.error(e)
});

