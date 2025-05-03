<template>
	<div class="user-menu" v-if="user">
		<div class="menu-info">
			<p class="mb-0">{{ getFullName(user) }}</p>
		</div>
		<ul class="menu-navigation list-unstyled">
			<li>
				<nuxt-link :to="`/dashboard/users/${ user.id }`">Perfil</nuxt-link>
			</li>
			<li><a href="#" @click.prevent="logout">Cerrar Sesión</a></li>
		</ul>
	</div>
</template>

<script setup>
	import { getFullName } from '~/utils/user.utils';

	const user = useAuthUser();
	const { logout } = useAuth({
		loginUrl: '/users/login',
		logoutUrl: '/login',
	});

	const dashboard = useDashboard();
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.section-dashboard:has(.dashboard-sidebar .user-info:hover), .section-dashboard:has(.user-menu:hover)
		.user-menu
			display: block
			opacity: 1

			@starting-style
				opacity: 0

	.user-menu
		display: none
		background: var(--brand1)
		position: absolute
		left: 100%
		z-index: 1000
		top: 64px
		border-radius: 0 0.5rem 0.5rem 0
		width: 200px
		color: white
		transition: all 0.3s
		transition-behavior: allow-discrete
		opacity: 0

		&:before
			position: absolute
			content: ''
			width: 1rem
			height: 1rem
			background-image: var(--rounded-lb)
			top: -1rem
			left: 0

		&:after
			position: absolute
			content: ''
			width: 1rem
			height: 1rem
			background-image: var(--rounded-lt)
			top: 100%
			left: 0

		.menu-info
			padding: 0.5rem

		.menu-business
			padding: 0.5rem
			color: white
			font-weight: bold

			.business-name
				background: var(--bs-secondary)
				padding: 0.5rem
				border-radius: 0.5rem
				margin: 0

		.menu-navigation
			border-radius: 0 0 0.5rem 0.5rem
			overflow: clip
			margin: 0.5rem

			li
				margin-bottom: 0

				a
					display: block
					padding: 0.5rem 1rem
					color: white
					transition: background 0.3s
					text-decoration: none
					border-radius: 0.5rem

					&:hover
						background: var(--bs-secondary)
						color: white
</style>