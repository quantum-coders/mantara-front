<template>
	<aside class="dashboard-sidebar">
		<div class="sidebar-wrapper">
			<dashboard-sidebar-brand />
			<dashboard-sidebar-user-info />
			<dashboard-sidebar-user-menu />
			<dashboard-sidebar-navigation />
		</div>
	</aside>
</template>

<script setup>
</script>

<style scoped lang="sass">
	.dashboard-sidebar
		width: 100px
		display: flex
		z-index: 10

		.sidebar-wrapper
			width: 100%
			margin: 0.5rem
			background-color: var(--brand1)
			border-radius: 1rem

			.sidebar-navigation
				text-align: center
				font-size: 1.6rem

				a
					color: white
</style>