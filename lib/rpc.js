const RPC = require("discord-rpc");
const rpc = new RPC.Client({
    transport: "ipc"
});
console.log("RPC loading...");
rpc.on("ready", () => {
    rpc.setActivity({
        details: "SnailFM Music Station.",
        state: "Listening SnailFM live radio!",
        startTimestamp: new Date(),
        largeImageKey: "logo",
        largeImageText: "snaildos.com/snailfm",
        smallImageText: "Check out SnailFM today!"
    });

    console.log("Discord RPC loaded.");
});

rpc.login({
    clientId: "574097225337012225"
});