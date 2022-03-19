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
    const checkIfSelf = (cl) => {
        return !(cl.clientNickname.includes('BOT')
            || cl.clientVersion.includes('ServerQuery')
            || cl.clientUniqueIdentifier.includes('clientUniqueIdentifier'));
    }
    const editOnlineChannels = async () => {
        const clients = await teamspeak.clientList({ clientType: 0 });
        const teamMembers = clients.filter(c => !c.servergroups.includes(noTeamGroups));
        let channel = await teamspeak.getChannelById('33');
        let text = `[cspacer]Derzeit ${clients.length == 1 ? 'ist' : 'sind'} ${clients.length} Spieler Online`
        if (channel.name !== text)
            channel.edit({
                channelName: text,
            })

        channel = await teamspeak.getChannelById('34');
        text = `[cspacer]Davon ${clients.length == 1 ? 'ist' : 'sind'} ${teamMembers.length} im Team`;
        if (channel.name !== text)
            channel.edit({
                channelName: text,
            })
    }

    const bannerStuff = ['[cspacer]» Jodu555.de «', '[cspacer]» Editfusee.de «']
    let bannerIDX = 0;
    const changeBanner = async () => {
        if (bannerIDX == bannerStuff.length)
            bannerIDX = 0;
        channel = await teamspeak.getChannelById('5');
        channel.edit({
            channelName: bannerStuff[bannerIDX],
        })
        bannerIDX++;
    }

    const clients = await teamspeak.clientList({ clientType: 0 });
    clients.forEach(client => {
        console.log('Online:', client.nickname);

    })



    teamspeak.on('clientconnect', async (cl) => {
        const client = await teamspeak.getClientByUid(cl.client.propcache.clientUniqueIdentifier);
        if (client.nickname == 'Jodu555')
            client.message('Im Here!');
        editOnlineChannels();
    });

    teamspeak.on('clientdisconnect', () => {
        editOnlineChannels();
    });

    teamspeak.on('textmessage', async ({ invoker: inv, msg, targetmode }) => {
        console.log('Happend');
        if (checkIfSelf(inv.propcache)) {
            const invoker = await teamspeak.getClientByUid(inv.propcache.clientUniqueIdentifier);
        }
    });


    // (await teamspeak.getClientByName('Jodu555')).message('Hello There!')

    editOnlineChannels();

    changeBanner();

    const bannerChanger = setInterval(changeBanner, 1000 * 60 * 5) // Every 5 minutes




}).catch(e => {
    console.log("Catched an error!")
    console.error(e)
});

