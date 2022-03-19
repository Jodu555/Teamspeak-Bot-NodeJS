const { TeamSpeak, QueryProtocol } = require('ts3-nodejs-library');

//create a new connection
TeamSpeak.connect({
    host: "rooti.jodu555.de",
    protocol: QueryProtocol.RAW, //optional
    queryport: 10011, //optional
    serverport: 9987,
    username: "serveradmin",
    password: "",
    nickname: "NodeJS Query Framework"
}).then(async teamspeak => {
    const clients = await teamspeak.clientList({ clientType: 0 })
    clients.forEach(client => {
        console.log("Sending 'Hello!' Message to", client.nickname)
        client.message("Hello!")
    })
}).catch(e => {
    console.log("Catched an error!")
    console.error(e)
})

const channel = await teamspeak.getChannelById(10)
if (!channel) throw new Error("could not find channel with id 10")
//with version < 3.0
channel.edit({
    channel_name: "foo",
    channel_password: "bar",
    channel_description: "lorem ipsum"
})
//with version >= 3.0
channel.edit({
    channelName: "foo",
    channelPassword: "bar",
    channelDescription: "lorem ipsum"
})