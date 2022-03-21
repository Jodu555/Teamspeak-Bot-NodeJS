require('dotenv').config();
const { CommandManager, Command } = require('@jodu555/commandmanager');
//                                              Pass here the standard pipe you want to use
const commandManager = CommandManager.createCommandManager(process.stdin, process.stdout);
const { TeamSpeak, QueryProtocol } = require('ts3-nodejs-library');

const noTeamGroups = ['10', '17', '16', '15', '11']

//create a new connection
TeamSpeak.connect({
    host: process.env.QUERY_HOST,
    protocol: QueryProtocol.RAW, //optional
    queryport: 10011, //optional
    serverport: 9987,
    username: process.env.QUERY_USERNAME,
    password: process.env.QUERY_PASSWORD,
    nickname: process.env.QUERY_NICKNAME
}).then(async teamspeak => {
    commandManager.registerCommand(
        new Command(
            ['changeBanner', 'cb'], // The Command
            'changeBanner', // A Usage Info with arguments
            'Shuffles the Banner Change!', // A Description what the command does
            async (command, [...args], scope) => {
                await changeBanner();
                return 'Changed Banner!';
            }
        )
    );

    commandManager.registerCommand(
        new Command(
            ['info', 'i'], // The Command
            'info', // A Usage Info with arguments
            'Prints Informations', // A Description what the command does
            async (command, [...args], scope) => {
                const clients = await teamspeak.clientList({ clientType: 0 });
                return (await Promise.all(clients.map(async e => {
                    const servergroups = await Promise.all(e.servergroups.map(async id => {
                        const group = await teamspeak.getServerGroupById(id);
                        return group.propcache.name;
                    }));
                    const output = ['Name: ' + e.nickname,
                    '  IP: ' + e.connectionClientIp,
                    '  UID: ' + e.uniqueIdentifier,
                    '  Country: ' + e.country,
                    '  Platform: ' + e.platform,
                    '  Server-Gruppen: ' + servergroups.join(', ')
                    ]
                    return output;
                }))).flat();
            }
        )
    );
    const checkIfSelf = (cl) => {
        return !(cl.clientNickname.includes('BOT')
            || cl.clientVersion.includes('ServerQuery')
            || cl.clientUniqueIdentifier.includes('clientUniqueIdentifier'));
    }
    const editOnlineChannels = async () => {
        const clients = await teamspeak.clientList({ clientType: 0 });
        const teamMembers = clients.filter(c => c.servergroups.some(g => !noTeamGroups.includes(g)));
        let channel = await teamspeak.getChannelById('33');
        let text = `[cspacer]Derzeit ${clients.length == 1 ? 'ist' : 'sind'} ${clients.length} Spieler Online`
        if (channel.name !== text)
            channel.edit({
                channelName: text,
            })

        channel = await teamspeak.getChannelById('34');
        text = `[cspacer]Davon ${teamMembers.length == 1 ? 'ist' : 'sind'} ${teamMembers.length} im Team`;
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

    // const bannerChanger = setInterval(changeBanner, 1000 * 60 * 5) // Every 5 minutes




}).catch(e => {
    console.log("Catched an error!")
    console.error(e)
});

