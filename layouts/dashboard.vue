<template>
	<nuxt-page />
</template>

<script setup>
	const dashboard = useDashboard();

	useHead({
		titleTemplate: `${ dashboard.title } - %s`,
	});

	const user = useAuthUser();
</script>

<style lang="sass" scoped>
</style>