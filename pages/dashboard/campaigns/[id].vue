<template>
	<platform-title :title="campaign?.name">
		<template #actions>
			<editor-campaign-navigation />
		</template>
	</platform-title>
	<section class="campaign-wrapper">
		<platform-loading :active="loading" />

		<aside class="campaign-sidebar">
			<ai-chat entity="campaign" :id-entity="useRoute().params.id" />
		</aside>
		<main class="campaign-main">
<!--			<div v-if="campaign?.coverImage" class="campaign-cover-container mb-4"
			>
				<img
					:src="campaign?.coverImage"
					:key="campaign?.coverImage"
					class="rounded campaign-cover-image" alt="Cover de la campaña"
				/>
			</div>-->
			<pre></pre>
			<nuxt-page />
		</main>
		<pre>{{ project }}}</pre>
	</section>
</template>

<script setup>
	import { storeToRefs } from 'pinia';
	const storeProject = useProject();
	const { project } = storeToRefs(storeProject);
	const loading = ref(false);

	onMounted(async () => {
		loading.value = true;
		await storeProject.fetchProject(useRoute().params.id);
		loading.value = false;
	});

</script>

<style lang="sass" scoped>
	.campaign-wrapper
		display: flex
		flex-grow: 1

		.campaign-sidebar
			width: 500px
			flex-shrink: 0
			border-right: 1px solid var(--bs-border-color)
			display: flex
			flex-direction: column

		.campaign-main
			flex-grow: 1
			max-width: calc(100% - 500px)

	.campaign-cover-container
		width: 100%
		max-height: 350px
		overflow: hidden
		position: relative

		.campaign-cover-image
			display: block
			width: 100%
			height: 100%
			object-fit: cover
			object-position: center center
			margin: 0 auto
			// Clase 'rounded' de Bootstrap ya aplicada en el template

			// Efecto desvanecido inferior con máscara
			mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)
			// Prefijo para compatibilidad con Webkit (Chrome, Safari, etc.) - CORREGIDO
			-webkit-mask-image: -webkit-linear-gradient(to bottom, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)
</style>
