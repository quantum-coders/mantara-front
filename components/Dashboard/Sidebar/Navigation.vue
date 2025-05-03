<template>
	<nav class="sidebar-navigation" v-if="user">
		<ul class="sidebar-list list-unstyled">
			<li v-for="item in navigation" :key="item.to">
				<nuxt-link :to="item.to" v-tooltip.right="item.tooltip" :exact-active-class="'active'">
					<icon :name="item.icon" />
				</nuxt-link>

				<ul v-if="item.submenu" class="list-unstyled">
					<li v-for="sub in item.submenu" :key="sub.to">
						<nuxt-link :to="sub.to" :exact-active-class="'active'">
							{{ sub.label }}
						</nuxt-link>
					</li>
				</ul>
			</li>
		</ul>
	</nav>
</template>

<script setup>

	const user = useAuthUser();

	const navigation = [
		{ to: '/dashboard', icon: 'hugeicons:dashboard-browsing', tooltip: 'Panel de control' },
		{ to: '/dashboard/users', icon: 'hugeicons:user', tooltip: 'Usuarios' },
		{ to: '/dashboard/campaigns', icon: 'hugeicons:warehouse', tooltip: 'Campañas' },
	];
</script>

<style scoped lang="sass">
	.sidebar-navigation
		text-align: center
		font-size: 1.6rem

		& > ul > li

			margin-bottom: 0.5rem

			& > a
				padding: 0 0.5rem
				color: white

			&.active
				color: var(--light)

		.sidebar-list
			& li:has(ul):hover
				ul
					display: block

			& > li > ul
				position: absolute
				left: 100%
				top: -0.7rem
				background: var(--brand1)
				text-align: left
				border-radius: 0 1rem 1rem 0
				display: none
				padding: 0.5rem 0.5rem 0.5rem 0

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

				li
					font-size: 1rem

					a
						padding: 0.5rem 1rem
						text-decoration: none
						display: block
						white-space: nowrap
						border-radius: 0.5rem
						color: white

						&.active
							background: var(--brand2)
							color: white
</style>