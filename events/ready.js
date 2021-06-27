module.exports = {
	name: 'ready',
	once: true,
	execute() {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};