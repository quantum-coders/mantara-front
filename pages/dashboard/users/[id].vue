<template>
	<platform-loading :active="loading" :is-full-page="true" />
	<platform-upsert-screen :item="item" :entity="entity" v-if="item" />
</template>

<script setup>
	import entity from './entity';
	const route = useRoute();
	const item = ref(null);
	const loading = ref(true);

	const fetchItem = async () => {
		const { data, error } = await useBaseFetch(`/${ entity.plural }/${ route.params.id }`, { method: 'GET' });
		if(error.value) {
			usePrettyToast().errorToast(error.message);
		}
		return data.value.data;
	};

	onMounted(async () => {
		if(useRoute().params.id === 'new') {
			console.log('new');

			item.value = { ...entity.default };

		} else {

			const data = await fetchItem();
			delete data.password;
			item.value = { ...data };
		}

		loading.value = false;

	});

</script>

<style lang="sass" scoped>
</style>