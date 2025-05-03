<template>
	<multiselect
		v-model="model"
		:options="groupedExercises"
		group-values="exercises"
		group-label="title"
		track-by="id"
		label="title"
		placeholder="Buscar ejercicio"
	/>
</template>

<script setup>
	import Multiselect from 'vue-multiselect';
	import 'vue-multiselect/dist/vue-multiselect.min.css';

	const exercises = ref([]);

	const model = defineModel();

	// compute the exercises
	// Group exercises by core category
	const groupedExercises = computed(() => {
		const groups = {};

		exercises.value.forEach(exercise => {
			const coreCategory = exercise.categories.find(cat => cat.type === 'core');
			if(coreCategory) {
				if(!groups[coreCategory.title]) {
					groups[coreCategory.title] = [];
				}
				groups[coreCategory.title].push(exercise);
			}
		});

		return Object.keys(groups).map(title => ({
			title,
			exercises: groups[title],
		}));
	});

	const fetchExercises = async (query) => {
		const { data, error } = await useBaseFetch(`/exercises`, { method: 'GET' });

		if(error.value) {
			console.error(error.value);
			usePrettyToast().errorToast(error.value.message);
			return;
		}

		exercises.value = data.value.data;
	};

	onMounted(async () => {
		await fetchExercises();
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
</style>