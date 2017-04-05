'use strict';

const fs = require('fs');
const crypto = require('crypto');

var key;
try {
	key = fs.readFileSync('./key').toString();
} catch (err) {
	console.log('Generating key');
	key = crypto.randomBytes(64).toString('hex');
	fs.writeFileSync('./key', key);
}

var token;

try {
	let tk = fs.readFileSync('./token').toString();
	if (tk.indexOf('mfa') === 0) {
		token = tk;
		let cipher = crypto.createCipher('aes-256-cbc', key);
		let encrypted = cipher.update(tk, 'utf8', 'hex') + cipher.final('hex');
		fs.writeFileSync('./token', encrypted);
	} else if (tk.indexOf('-') == -1) {
		let decipher = crypto.createDecipher('aes-256-cbc', key);
		token = decipher.update(tk, 'hex', 'utf8') + decipher.final('utf8');
	} else {
		throw 'Invalid token format';
	}
} catch (err) {
	console.error(err);
	process.exit(1);
}


const Discord = require('discord.js');
const client = new Discord.Client();
const moment = require('moment');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`);
});

client.on('message', msg => {
	if (msg.author.id != client.user.id) {
		return;
	}
	var reply = msg.content.match(/^>>(\d+)(#[0123456789abcdefABCDEF]{6})?\b(.*)/);
	if (reply) {
		msg.channel.fetchMessages({ around: reply[1]}).then(msgs => {
			let orig = msgs.get(reply[1]);
			let rich = new Discord.RichEmbed();

			rich.setAuthor(orig.member.displayName || orig.author.username, orig.author.avatarURL);
			rich.setColor(reply[2] || '#222222');
			rich.setDescription(orig.content);
			rich.setFooter(moment(orig.createdAt).format('YYYY-MM-DD HH:mm:ss Z'));

			msg.delete();
			msg.channel.sendEmbed(rich);
			msg.channel.sendMessage(reply[3]);
		}, err => {
			console.log(err);
		});
	}
});

client.login(token);