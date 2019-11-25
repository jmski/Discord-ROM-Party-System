const Map = require('collections/map');
const Discord = require('discord.js');
const Party = require('./party.js');
const Party_2 = require('./party_2.js');
const DateTime = require('date-and-time');

const config = require('./config.js');
const client = new Discord.Client();
const parties = new Map();

var schedule = require('node-schedule');

var getItems = require('./scrape.js');

DateTime.setLocales('en', {
    A: ['AM', 'PM']
});

function getFreeID() {
    let found = -1;
    for (let i = 1; i <= 100; i++) {
        if (parties.has(i)) continue;

        found = i;
        break;
    }

    if (found === -1) throw new Error(`Couldn't find a free ID from 1-100 range. Are there 100 parties active?`);
    return found;
}


function handleMessage(message) {

    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    return handleCommand(message, command, args);
}

function handleCommand(message, command, args) {
    switch (command) {
        case 'create':
            handleCreate(message, args);
            break;
        case 'info':
            let id = Number(args[0]);
            if (!id)
                return message.channel.send('Usage: info [id]')

            if (!parties.has(id))
                return message.channel.send(`Couldn't find any parties with the ID ${id}`);

            let party = parties.get(id);

            if (party.type === 'Leader') {
                message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
            }
            else if (party.type === 'Leech') {
                message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
            }
            else if (party.faction) {
                message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
            }
            else {
                message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
            }
            break;
        case 'join':
            handleJoin(message, args);
            break;
        case 'leave':
            handleLeave(message, args);
            break;
        case 'cancel':
            handleCancel(message, args);
            break;
        case 'call':
            handleCall(message, args);
            break;
        case 'help':

            let helpMessages = [];

            helpMessages.push(' ');
            helpMessages.push('                                                                                                                Made by @jmski#7245');
            helpMessages.push(' ');
            helpMessages.push('=================================================================');
            helpMessages.push('                         Create a Party');
            helpMessages.push('=================================================================');
            helpMessages.push('!!Help - Shows all commands. Duh.');
            helpMessages.push(' ');
            helpMessages.push('!!create - Creates a party.');
            helpMessages.push('   !!create [1-11] [MM/DD] [HHmm] | (24-HR miliary format CST)');
            helpMessages.push('                          Example: !!create 1 12/25 2130');
            helpMessages.push('                                            (9:30PM CST)');
            helpMessages.push('    Events:');
            helpMessages.push('    1 - Endless Tower');
			helpMessages.push('    2 - War of Emperium');
            helpMessages.push('    3 - Board Quest + Training Grounds + Rifts');
            helpMessages.push('    4 - Boss Hunt');
            helpMessages.push('    5 - VR40');
            helpMessages.push('    6 - VR60');
            helpMessages.push('    7 - VR80');
            helpMessages.push('    8 - VR100');
            helpMessages.push('    9 - Oracle (Easy)');
            helpMessages.push('    10 - Oracle (Normal)');
            helpMessages.push('    11 - Oracle (Hard)');
            helpMessages.push(' ');
            helpMessages.push('Note: You must have RIPE role for commands to work ');
            helpMessages.push(' ');
            helpMessages.push('=================================================================');
            helpMessages.push('                         Party Commands');
            helpMessages.push('=================================================================');
            helpMessages.push(' ');
            helpMessages.push('!!info [party id] - Displays created event party.');
            helpMessages.push(' ');
            helpMessages.push('!!cancel [party id] - Cancels a previously created event party.');
            helpMessages.push(' ');
            helpMessages.push('!!call [party id] - Sends a notification to the party members.');
            helpMessages.push(' ');
            helpMessages.push('!!join [party id] - Joins a previously created event party.');
            helpMessages.push(' ');
            helpMessages.push('!!leave [party id] -  Leaves a previously joined event party.');
            helpMessages.push(' ');
            helpMessages.push('!!invite [party id] [user] - Adds a user to created event party.');
            helpMessages.push(' ');
            helpMessages.push('!!kick [party id] [user] -  Kick a user that has previously joined an event party.');
            helpMessages.push(' ');
            helpMessages.push('!!list -  Lists all available parties.');
            helpMessages.push(' ');
            helpMessages.push('!!poringlist -  Lists all available items from https://poring.world.');
            helpMessages.push(' ');
            helpMessages.push('!!changedate -  Changes the date and the time of an event.');
            helpMessages.push(' ');

            message.channel.send(`\`\`\`${helpMessages.join('\n')}\`\`\``);
            break;
        case 'kick':
            handleKick(message, args);
            break;
        case 'invite':
            handleInvite(message, args);
            break;
        case 'list':
            let partyList = [];

            parties.forEach((party, id) => {
                partyList.push(`ID: ${id} | Event: ${party.type} | Time: ${DateTime.format(party.time, 'MMM D hh:mm A')} CST`)
            })

            message.channel.send(`Current active parties: \`\`\`${partyList.join('\n')}\`\`\``);
            break;
        case 'changedate':
            handleChangeDate(message, args);
            break;
        case 'poringlist':
            handlePoring(message, args);
            break;
        default:
            break;
    }
}

function handlePoring(message, args) {
    let [option, query] = args;
    //console.log(option, query);

    if (option == '-s' && query == undefined) {
        return message.channel.send('Usage:\n> for search -> poringlist [-s] [search qurey]\n> full list -> poringlist');
    }

    getItems(message, option, query);
}

function handleChangeDate(message, args) {
    let [id, ...datetime] = args;
    datetime = datetime.join(' ');
    id = Number(id);

    let party = parties.get(id);

    if (!id)
        return message.channel.send('Usage: changedate [id] [date] [time]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID: ${id}`);

    if (party.owner.id !== message.member.id && !message.member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(`You are not the owner of this party...`);

    let date = new Date(DateTime.parse(datetime, 'MM/DD HHmm'));
    date.setYear(new Date().getFullYear());

    party.time = date;

    parties.set(id, party);

    if (party.type === 'Leader') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.type === 'Leech') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.faction) {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    else {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
}

function handleCreate(message, args) {

    //console.log(args);
    let description = [];
    let desc_flag = false;
    for (var c = 0; c < args.length; c++) { // 3 is the starting index of the description in the args array
        if (args[c].includes('{')) {
            desc_flag = true;
        }

        if (desc_flag) {
            description.push(args[c]);
        }

        if (args[c].includes('}')) {
            desc_flag = false;
        }
    }
    desc_flag = false;
    description = description.join(' ').replace(/[{}]/g, '');
    //console.log(description);

    let [type, ...datetime] = args;
    datetime = datetime.join(' ').replace(` {${description}}`, '');
    //console.log(datetime);

    let types = [];
    for (let i = 1; i <= config.acceptedEvents.length; i++)
        types.push(`${i} = ${config.acceptedEvents[i - 1]}`);

    if (!type || !datetime || !DateTime.isValid(datetime, 'MM/DD HHmm') || !config.acceptedEvents[Number(type) - 1]) {
        //console.log(type, datetime, DateTime.isValid(datetime, 'MM/DD HHmm'), config.acceptedEvents[Number(type) - 1]);
        return message.channel.send(`**Usage:** create [event] [date] [Time] [optional:{description}]\n**Accepted events:** \`\`${types.join("\`\`, \`\`")}\`\`\n**Accepted time format:** MM/DD HHmm Error 100`);
    }

    let date = new Date(DateTime.parse(datetime, 'MM/DD HHmm'));
    date.setYear(new Date().getFullYear());

    if (date < new Date) {
        //console.log(date, new Date());
        return message.channel.send(`You've entered the **[time/date]** incorrectly. \nPlease make sure **[time/date]** has not yet passed. Error 101`);
    }

    let role;
    let guildMember = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (guildMember.roles.has(config.roles.RIPE)) role = 'RIPE1';

    if (!role)
        return message.channel.send(`You must have the 'RIPE' role to use this bot. Sorry! Error 102`);

    let id = getFreeID();
    let party;

    let player_faction = message.member.roles.find(r => r.name === "Kaizen");
    let faction = player_faction ? message.member.roles.find(r => r.name === "Kaizen") : message.member.roles.find(r => r.name === "Expired");
    //console.log(faction.name);
    if (type == '12' || type == '13') {
        let party_2 = new Party_2(config.acceptedEvents[Number(type) - 1], date, role, guildMember, description);
        party = party_2;
    }
    else {
        let party_5 = new Party(config.acceptedEvents[Number(type) - 1], date, role, guildMember, faction, description);
        party = party_5;
    }

    parties.set(id, party);
    if (party.type === 'Leader') {
        message.channel.send(`@everyone\n${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} is offering to Leech\n${party.RIPE2} (Slot 1)`)
    }
    else if (party.type === 'Leech') {
        message.channel.send(`@everyone\n${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} is requesting to be leeched\n${party.RIPE2} (Slot 1)`)
    }
    else if (party.faction) {
        message.channel.send(`@everyone\n${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    else {
        message.channel.send(`@everyone\n${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }

    party.timer = schedule.scheduleJob(party.time, () => partyStartCallback(id, party, message));
}

function handleCall(message, args) {
    let id = Number(args[0]);
    if (!id)
        return message.channel.send('Usage: call [id]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID ${id}`);

    let party = parties.get(id);
    let member = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (party.owner.id !== member.id)
        return message.channel.send(`You are not the owner of this party...`);

    let players = [];

    if (party.RIPE1 !== undefined && party.RIPE1 !== 'OPEN') players.push(party.RIPE1.toString());
    if (party.RIPE2 !== undefined && party.RIPE2 !== 'OPEN') players.push(party.RIPE2.toString());
    if (party.RIPE3 !== undefined && party.RIPE3 !== 'OPEN') players.push(party.RIPE3.toString());
    if (party.RIPE4 !== undefined && party.RIPE4 !== 'OPEN') players.push(party.RIPE4.toString());
    if (party.RIPE5 !== undefined && party.RIPE5 !== 'OPEN') players.push(party.RIPE5.toString());
    if (party.RIPE6 !== undefined && party.RIPE6 !== 'OPEN') players.push(party.RIPE6.toString());


    message.channel.send(`${players.join(', ')} party **${party.type} (ID: ${id}) (${DateTime.format(party.time, 'MMM D hh:mm A')} CST)** is starting soon... `)
}

function handleCancel(message, args) {
    let id = Number(args[0]);
    if (!id)
        return message.channel.send('Usage: cancel [id]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID ${id}`);

    let party = parties.get(id);
    let member = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (party.owner.id !== member.id && !member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(`You are not the owner of this party...`);

    party.timer.cancel();
    parties.delete(id);
    message.channel.send(`Successfully canceled the party with ID ${id}`);
}

function handleLeave(message, args) {

    let id = Number(args[0]);
    if (!id)
        return message.channel.send('Usage: leave [id]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID: ${id}`);

    let party = parties.get(id);
    let member = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (member.roles.has(config.roles.RIPE)) role = 'RIPE';

    if (!role)
        return message.channel.send(`You must have the 'RIPE' role to use this bot. Sorry! Error 103`);

    if (role === 'RIPE') {
        if (party[role + '1'] === member) role = role + '1';
        else if (party[role + '2'] === member) role = role + '2';
        else if (party[role + '3'] === member) role = role + '3';
        else if (party[role + '4'] === member) role = role + '4';
        else if (party[role + '5'] === member) role = role + '5';
        else if (party[role + '6'] === member) role = role + '6';
        else return message.channel.send(`Party is full! Sorry! Error 104`);
    }

    if (party[role].id !== member.id)
        return message.channel.send(`Party is full! Sorry! Error 105`);

    party[role] = 'OPEN';

    if (party.owner.id === member.id) {
        if (party.RIPE1 !== 'OPEN') party.owner = party.RIPE1;
        else if (party.RIPE2 !== 'OPEN') party.owner = party.RIPE2;
        else if (party.RIPE3 !== 'OPEN') party.owner = party.RIPE3;
        else if (party.RIPE4 !== 'OPEN') party.owner = party.RIPE4;
        else if (party.RIPE5 !== 'OPEN') party.owner = party.RIPE5;
        else if (party.RIPE6 !== 'OPEN') party.owner = party.RIPE6;
        else {
            party.timer.cancel();
            parties.delete(id);
            return message.channel.send(`Successfully canceled the party with ID ${id} due to lack of members.`);
        }
    }

    parties.set(id, party);
    if (party.type === 'Leader') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.type === 'Leech') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.faction) {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    else {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    message.channel.send(`Party owner is: ${party.owner.toString()}`);
}

function handleJoin(message, args) {

    let id = Number(args[0]);
    if (!id)
        return message.channel.send('Usage: join [id]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID ${id}`);

    let party = parties.get(id);
    let member = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (member.roles.has(config.roles.RIPE)) role = 'RIPE';

    if (!role)
        return message.channel.send(`You must have the 'RIPE' role to use this bot. Sorry! Error 106`);

    if (role === 'RIPE') {
        if (party[role + '1'] === 'OPEN') role = role + '1';
        else if (party[role + '2'] === 'OPEN') role = role + '2';
        else if (party[role + '3'] === 'OPEN') role = role + '3';
        else if (party[role + '4'] === 'OPEN') role = role + '4';
        else if (party[role + '5'] === 'OPEN') role = role + '5';
        else if (party[role + '6'] === 'OPEN') role = role + '6';
        else return message.channel.send(`Something went wrong. Sorry! Error 107`);
    }

    if (party[role] !== 'OPEN')
        return message.channel.send(`Party is full! Sorry! Error 108`);

    if (party.faction) {
        let player_faction = message.member.roles.find(r => r.name === "Kaizen");
        let faction = player_faction ? message.member.roles.find(r => r.name === "Kaizen") : message.member.roles.find(r => r.name === "Expired");
        //console.log('Member role: ' + faction.name + ' | ' + party.faction.name);
        if (party.type !== 'Leader' && party.type !== 'Leech' && party.faction.name != faction.name) return message.channel.send(`You cannot join because you're from a different guild. Sorry! Error 109`);
    }

    party[role] = member;

    parties.set(id, party);
    if (party.type === 'Leader') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.type === 'Leech') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.faction) {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    else {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }

    if ((!party.RIPE1 === 'OPEN') && (!party.RIPE2 === 'OPEN') && (!party.RIPE3 === 'OPEN') && (!party.RIPE4 === 'OPEN') && (!party.RIPE5 === 'OPEN') && (!party.RIPE6 === 'OPEN')) {
        let players = [];

        if (party.RIPE1 !== 'OPEN') players.push(party.RIPE1.toString());
        if (party.RIPE2 !== 'OPEN') players.push(party.RIPE2.toString());
        if (party.RIPE3 !== 'OPEN') players.push(party.RIPE3.toString());
        if (party.RIPE4 !== 'OPEN') players.push(party.RIPE4.toString());
        if (party.RIPE5 !== 'OPEN') players.push(party.RIPE5.toString());
        if (party.RIPE6 !== 'OPEN') players.push(party.RIPE6.toString());

        message.channel.send(`${players.join(', ')} party **${party.type} (ID: ${id}) (${DateTime.format(party.time, 'MMM D hh:mm A')} CST)** is full and ready to go.`);
    }
}

function handleInvite(message, args) {

    let user = message.mentions.members.first();
    let id = Number(args[0]);

    if (!id || !user)
        return message.channel.send('Usage: invite [id] [user]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID: ${id}`);

    let party = parties.get(id);
    let member = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (party.owner.id !== member.id && !member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(`You are not the owner of this party...`);

    if (user.roles.has(config.roles.RIPE)) role = 'RIPE';

    if (!role)
        return message.channel.send(`Couldn't find a team role for this user... Error 110`);

    if (role === 'RIPE') {
        if (party[role + '1'] === 'OPEN') role = role + '1';
        else if (party[role + '2'] === 'OPEN') role = role + '2';
        else if (party[role + '3'] === 'OPEN') role = role + '3';
        else if (party[role + '4'] === 'OPEN') role = role + '4';
        else if (party[role + '5'] === 'OPEN') role = role + '5';
        else if (party[role + '6'] === 'OPEN') role = role + '6';
        else return message.channel.send(`Party is full! Sorry! Error 111`);
    }

    if (party[role] !== 'OPEN')
        return message.channel.send(`Party is full! Sorry! Error 112`);

    let faction = user.roles.find(r => r.name === "Kaizen") || user.roles.find(r => r.name === "Expired");
    if (party.faction) {
        if (faction.name !== party.faction.name) return message.channel.send('This event is *guild specific.*\nPlease check to make sure you have the respective guild role **(Kaizen/Expired)**');
    }

    party[role] = user;

    parties.set(id, party);
    if (party.type === 'Leader') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.type === 'Leech') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.faction) {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    else {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }

    if ((!party.RIPE1 === 'OPEN') && (!party.RIPE2 === 'OPEN') && (!party.RIPE3 === 'OPEN') && (!party.RIPE4 === 'OPEN') && (!party.RIPE5 === 'OPEN')) {
        let players = [];

        if (party.RIPE1 !== 'OPEN') players.push(party.RIPE1.toString());
        if (party.RIPE2 !== 'OPEN') players.push(party.RIPE2.toString());
        if (party.RIPE3 !== 'OPEN') players.push(party.RIPE3.toString());
        if (party.RIPE4 !== 'OPEN') players.push(party.RIPE4.toString());
        if (party.RIPE5 !== 'OPEN') players.push(party.RIPE5.toString());
        if (party.RIPE6 !== 'OPEN') players.push(party.RIPE6.toString());

        message.channel.send(`${players.join(', ')} party **${party.type} (ID: ${id}) (${DateTime.format(party.time, 'MMM D hh:mm A')} CST)** is full and ready to go.`);
    }
}

function handleKick(message, args) {

    let user = message.mentions.members.first();
    let id = Number(args[0]);

    if (!id || !user)
        return message.channel.send('Usage: kick [id] [user]')

    if (!parties.has(id))
        return message.channel.send(`Couldn't find any parties with the ID: ${id}`);

    let party = parties.get(id);
    let member = client.guilds.get(message.guild.id).members.get(message.author.id);

    if (party.owner.id !== member.id && !member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(`You are not the owner of this party...`);

    if (user.roles.has(config.roles.RIPE)) role = 'RIPE';

    if (!role)
        return message.channel.send(`Couldn't find a team role for this user... Error 113`);

    if (role === 'RIPE') {
        if (party[role + '1'] === user) role = role + '1';
        else if (party[role + '2'] === user) role = role + '2';
        else if (party[role + '3'] === user) role = role + '3';
        else if (party[role + '4'] === user) role = role + '4';
        else if (party[role + '5'] === user) role = role + '5';
        else if (party[role + '6'] === user) role = role + '6';
        else return message.channel.send(`Party is full! Sorry! Error 114`);
    }

    if (party[role].id !== user.id)
        return message.channel.send(`Party is full! Sorry! Error 115`);

    party[role] = 'OPEN';

    if (party.owner.id === member.id) {
        if (party.RIPE1 !== 'OPEN') party.owner = party.RIPE1;
        else if (party.RIPE2 !== 'OPEN') party.owner = party.RIPE2;
        else if (party.RIPE3 !== 'OPEN') party.owner = party.RIPE3;
        else if (party.RIPE4 !== 'OPEN') party.owner = party.RIPE4;
        else if (party.RIPE5 !== 'OPEN') party.owner = party.RIPE5;
        else if (party.RIPE6 !== 'OPEN') party.owner = party.RIPE6;
        else {
            party.timer.cancel();
            parties.delete(id);
            return message.channel.send(`Successfully canceled the party with ID ${id} due to lack of members.`);
        }
    }

    parties.set(id, party);
    if (party.type === 'Leader') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.type === 'Leech') {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)`)
    }
    else if (party.faction) {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\nFaction: ${party.faction}\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    else {
        message.channel.send(`${party.type} (ID: ${id})\n${DateTime.format(party.time, 'MMM D hh:mm A')} CST\n${party.description}\n\n${party.RIPE1} (Slot 1)\n${party.RIPE2} (Slot 2)\n${party.RIPE3} (Slot 3)\n${party.RIPE4} (Slot 4)\n${party.RIPE5} (Slot 5)\n${party.RIPE6} (Slot 6)`)
    }
    message.channel.send(`Party owner is: ${party.owner.toString()}`);
}

function partyStartCallback(id, party, message) {
    if (!parties.has(id)) return;

    let players = [];

    if (party.RIPE1 !== 'OPEN') players.push(party.RIPE1.toString());
    if (party.RIPE2 !== 'OPEN') players.push(party.RIPE2.toString());
    if (party.RIPE3 !== 'OPEN') players.push(party.RIPE3.toString());
    if (party.RIPE4 !== 'OPEN') players.push(party.RIPE4.toString());
    if (party.RIPE5 !== 'OPEN') players.push(party.RIPE5.toString());
    if (party.RIPE6 !== 'OPEN') players.push(party.RIPE6.toString());

    message.channel.send(`${players.join(', ')} party **${party.type} (ID: ${id}) (${DateTime.format(party.time, 'MMM D hh:mm A')} CST)** is starting now.`);

    setTimeout(() => {
        if (parties.has(id)) parties.delete(id);
    }, 60 * 60 * 1000)
}

client.on('message', handleMessage);
client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));
client.on('error', console.error);

console.log('Initiating the login process...');
client.login(config.token).catch(console.error);