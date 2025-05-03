<template>
	<section class="magic-wrapper">
		<p>Validando liga de recuperación</p>
	</section>
</template>

<script setup>

	const { setUser } = useAuth();
	const route = useRoute();
	const { errorToast } = usePrettyToast();

	// get route query
	const { query } = route;

	// validate Link
	const validateLink = async () => {

		const res = await useBaseFetch('/users/recover/validate', {
			method: 'POST',
			body: JSON.stringify({
				key: query.k,
				token: query.t,
			}),
		});

		console.log(res.error.value, res.data.value);

		if(!!res.error.value) {
			// send to home
			await navigateTo('/');
		}

		// send to dashboard
		setUser(res.data.value.data, res.data.value.accessToken);
		await navigateTo('/reset');
	};

	onMounted(() => {
		validateLink();
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.magic-wrapper
		display: flex
		flex: 1
		justify-content: center
		align-items: center
		font-size: 1.5rem
		color: #333
</style>