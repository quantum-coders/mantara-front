<template>
	<div class="sidebar-user" v-if="user">
		<div class="user-info">
			<div class="avatar">
				<img :src="`${ useRuntimeConfig().public.apiURL }/users/${ user.id }/avatar`" alt="">
			</div>
		</div>
	</div>
</template>

<script setup>
	const user = useAuthUser();
</script>

<style lang="sass" scoped>
	.sidebar-user
		padding: 0 0 1rem 0

		.user-info
			display: flex
			padding: 0.5rem 0
			align-items: center
			gap: 1rem

			.avatar
				width: 30px
				margin: 0 auto
				flex-shrink: 0
				aspect-ratio: 1
				border-radius: 50%
				background: white
				overflow: clip

				img
					width: 100%

			p
				margin-bottom: 0
				color: white
</style>