const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});

const roles = {
  jeunePousse: '1091396472265785375',
  babyGroot: '1091399524758605834',
  groot: '1091400324666896504',
  piplette: '1091706525699035216',
  vipEco: '1091401396366102609',
  vipBusiness: '1091403409061597194',
  cdd: '1122126562481950770',
  EnAttente: '1166288511721275482',
  kingGroot: '1128340373899575327'
};

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{
      name: "vec Coco de chez Conder"
    }],
    status: "dnd"
  });

  updateRoles();
});

function removeOldRole(member, oldRoleId) {
  const oldRole = member.guild.roles.cache.get(oldRoleId);
  if (member.roles.cache.has(oldRoleId)) {
    member.roles.remove(oldRole);
  }
}

async function updateRoles() {
  console.log("Mise à jour des rôles...");

  const guild = client.guilds.cache.first();
  const members = await guild.members.fetch();

  const kingGrootRole = guild.roles.cache.get(roles.kingGroot);
  const grootRole = guild.roles.cache.get(roles.groot);
  const babyGrootRole = guild.roles.cache.get(roles.babyGroot);
  const jeunePousseRole = guild.roles.cache.get(roles.jeunePousse);
  const enAttenteRole = guild.roles.cache.get(roles.EnAttente);

  members.each(async (member) => {
    if (member.user.bot) return;
    if (member.roles.cache.has(roles.EnAttente)) return;
    if (member.roles.cache.has(roles.vipEco) || member.roles.cache.has(roles.vipBusiness) || member.roles.cache.has(roles.piplette)) return;

    const now = new Date();
    const joined = member.joinedAt;
    const days = (now - joined) / (1000 * 60 * 60 * 24);

    if (member.roles.cache.has(roles.cdd)) {
      if (days >= 7 && !member.roles.cache.has(roles.EnAttente)) {
        console.log(`Attribution du rôle EnAttente à ${member.user.tag}`);
        await member.roles.add(enAttenteRole);
        await removeOldRole(member, roles.cdd);
        return; 
      }
    } else if (days >= 90) {
      if (!member.roles.cache.has(roles.kingGroot)) {
        console.log(`Attribution du rôle kingGroot à ${member.user.tag}`);
        await member.roles.add(kingGrootRole);
      }
      await removeOldRole(member, roles.groot);
      await removeOldRole(member, roles.babyGroot);
      await removeOldRole(member, roles.jeunePousse);
    } else if (days >= 60) {
      if (!member.roles.cache.has(roles.groot)) {
        console.log(`Attribution du rôle groot à ${member.user.tag}`);
        await member.roles.add(grootRole);
      }
      await removeOldRole(member, roles.babyGroot);
      await removeOldRole(member, roles.jeunePousse);
    } else if (days >= 30) {
      if (!member.roles.cache.has(roles.babyGroot)) {
        console.log(`Attribution du rôle babyGroot à ${member.user.tag}`);
        await member.roles.add(babyGrootRole);
      }
      await removeOldRole(member, roles.jeunePousse);
    } else if (!member.roles.cache.has(roles.jeunePousse)) {
      console.log(`Attribution du rôle jeunePousse à ${member.user.tag}`);
      await member.roles.add(jeunePousseRole);
    }
  });
}

client.on('guildMemberAdd', async (member) => {
  console.log(`Nouveau membre : ${member.user.tag}`);
  if (!member.roles.cache.has(roles.EnAttente)) {
    member.roles.add(jeunePousseRole);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const member = message.member;
  const pipletteRole = member.guild.roles.cache.get(roles.piplette);
  const messageCount = member.user.flags.messageCount;

  if (!member.roles.cache.has(roles.vipEco) && !member.roles.cache.has(roles.vipBusiness) && !member.roles.cache.has(roles.cdd)) {
    if (messageCount >= 500 && !member.roles.cache.has(roles.piplette)) {
      console.log(`Attribution du rôle piplette à ${member.user.tag}`);
      member.roles.add(pipletteRole);
      removeOldRole(member, roles.jeunePousse);
    }
  }
});

setInterval(async () => {
  updateRoles();
}, 43200000);

client.login(process.env.token);
