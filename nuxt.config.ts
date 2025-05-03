export default defineNuxtConfig({
	css: [],
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },
	extends: [ '@thewebchimp/chimp-nuxt-layer' ],
	modules: [ '@nuxtjs/google-fonts', 'nuxt-swiper', 'floating-vue/nuxt' ],
	googleFonts: {
		families: {
			'DM+Sans': true,
			'Barlow': true
		}
	},
	app: {
		head: {
			title: 'MIA',
			link: [
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
			],
		},
	},
	imports: {
		dirs: [
			'stores',
		],
	},
	runtimeConfig: {
		public: {
			apiURL: process.env.BASE_URL || 'http://localhost:1337',
			appURL: process.env.APP_URL || 'http://localhost:3000'
		},
	},
	vite: {
		define: { global: 'window' },
		optimizeDeps: {
			// Asegura que 'buffer' se incluya al hacer la optimización de dependencias
			include: [ 'buffer' ],
		},
		resolve: {
			// Alias explícito a la implementación del paquete 'buffer'
			alias: {
				buffer: 'buffer',
			},
		},
	},
})
