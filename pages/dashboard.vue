<template>
	<section class="section-dashboard flex-grow-1" v-if="!dashboard.isOnlyStaff">
		<dashboard-sidebar />
		<main class="dashboard-main">
			<div class="main-wrapper">
				<div class="dashboard-section-wrapper">
					<div class="scroll-wrapper d-flex flex-column">
						<nuxt-page />
					</div>
				</div>
			</div>
		</main>
	</section>
</template>

<script setup>
	const dashboard = useDashboard();
	definePageMeta({ middleware: 'auth', layout: 'dashboard' });
	useHead({ titleTemplate: '%s - MIA' });
	const user = useAuthUser();

	onMounted(async () => {
	});
</script>

<style scoped lang="sass">
	.section-dashboard
		display: flex
		background: #EEE

		.dashboard-main
			flex: 1
			display: flex

			.main-wrapper
				flex: 1
				display: flex
				flex-direction: column
				margin: 0.5rem 0.5rem 0.5rem 0
				background-color: white
				overflow: hidden
				border-radius: 1rem

				.dashboard-section-wrapper
					flex-grow: 1
					z-index: 1
</style>