const fs = require('fs');
const game = require('./game');
let config = require('../../app/config.json');
module.exports = {
    checkChannels: (client) => {
        console.log("Checking if all required channels exists.");
        client.guilds.map((guild) => {
            if(!guild.channels.find(x => x.name === config.queuechanneltext.toString().toLowerCase())){  
                guild.createChannel(config.queuechanneltext, { type: 'text' }) 
                .then(() => {
                    let channelid = client.channels.find(x => x.name === config.queuechanneltext.toString().toLowerCase()).id;
                    console.log(channelid);
                    fs.writeFile(`${process.cwd()}/app/data/textchannels.json`, JSON.stringify({queueChannelID: channelid}), (err) => {if(err)throw(err)});
                })
                .catch(console.error); 
            }
            if(!guild.channels.find(x => x.name === config.queuechannelvoice.toString().toLowerCase())){  
                guild.createChannel(config.queuechannelvoice, { type: 'voice' }) 
                .then(() => { 
                    let channelid = client.channels.find(x => x.name === config.queuechannelvoice.toString().toLowerCase()).id;
                    fs.writeFile(`${process.cwd()}/app/data/voicechannels.json`, JSON.stringify({queueChannelID: channelid}), (err) => {if(err)throw(err)});
                })
                .catch(console.error);  
            }
           
            if(!guild.channels.find(x => x.name === "Team 1") && !guild.channels.find(x => x.name === "Team 2")){  
                console.log("Creating and setting up channels for each team.");
                guild.createChannel("Team 1", { type: 'voice' }) 
                .then(() => { 
                    let team1 = client.channels.find(x => x.name === "Team 1");
                    guild.createChannel("Team 2", { type: 'voice' }) 
                    .then(() => { 
                        let team2 = client.channels.find(x => x.name === "Team 2");
                        
                        fs.writeFile(`${process.cwd()}/app/data/teamchannels.json`, JSON.stringify({team1: team1.id, team2: team2.id}), (err) => {if(err)throw(err)});
                    })
                })
                .catch(console.error);  
            }else if(guild.channels.find(x => x.name === "Team 1") && guild.channels.find(x => x.name === "Team 2")){
                fs.writeFile(`${process.cwd()}/app/data/teamchannels.json`, JSON.stringify({team1: client.channels.find(x => x.name === "Team 1").id, team2: client.channels.find(x => x.name === "Team 2").id}), (err) => {if(err)throw(err)});
            }

        });
        console.log("All channels has been setup.");
    },
    switchToTeamChannels: (client, team1, team2) => {
        //GET THE CCHANELS.
        fs.readFile(`${process.cwd()}/app/data/teamchannels.json`, 'utf-8', (err, data) => {
            if(err) throw err;
            data = JSON.parse(data);
            if(data.team1){
                let team1channel = data.team1;
                team1.map((player, index) => {
                    client.fetchUser(player.id).then((res) => {
                        res.lastMessage.member.setVoiceChannel(client.channels.get(team1channel));
                    });
                    //client.fetchUser(player.id).lastMessage.member.setVoiceChannel("Team 1");
                });
            }
            
            if(data.team2){
                let team2channel = data.team2;
                team2.map((player, index) => { 
                    client.fetchUser(player.id).then((res) => {
                        res.lastMessage.member.setVoiceChannel(client.channels.get(team2channel));
                    });
                });
            }

        });
        game.finalizeGameData(client, {teams: {team1: team1, team2: team2}});
    }
}