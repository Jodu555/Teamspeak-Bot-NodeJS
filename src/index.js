require('dotenv').config();
const { TeamSpeak, QueryProtocol } = require('ts3-nodejs-library');

const noTeamGroups = ['10', '17', '16', '15', '11']

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
    const editOnlineChannels = async () => {
        const clients = await teamspeak.clientList({ clientType: 0 });
        const teamMembers = clients.filter(c => !c.servergroups.includes(noTeamGroups));
        let channel = await teamspeak.getChannelById('33');
        channel.edit({
            channelName: `[cspacer]Derzeit ${clients.length == 1 ? 'ist' : 'sind'} ${clients.length} Spieler Online`,
        })

        channel = await teamspeak.getChannelById('34');
        channel.edit({
            channelName: `[cspacer]Davon ${clients.length == 1 ? 'ist' : 'sind'} ${teamMembers.length} im Team`,
        })
    }

    const clients = await teamspeak.clientList({ clientType: 0 });
    clients.forEach(client => {
        console.log('Online:', client.nickname);
    })



    teamspeak.on('clientconnect', () => {
        editOnlineChannels();
    });

    teamspeak.on('clientdisconnect', () => {
        editOnlineChannels();
    });


    editOnlineChannels();


}).catch(e => {
    console.log("Catched an error!")
    console.error(e)
});

