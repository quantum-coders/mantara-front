module.exports = {
	apps: [
		{
			name: 'mia-front',
			port: '3000',
			exec_mode: 'cluster',
			instances: 1,
			script: './.output/server/index.mjs',
		},
	],
};
