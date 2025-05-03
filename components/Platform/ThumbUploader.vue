<template>
	<platform-file-upload
		class="file-uploader"
		:multiple="false"
		accept="image/jpg,image/jpeg,image/png"
		ref="thumbUploader"
		@update="upload"
		:is-loading="loading"
	>
		<template #default>
			<img v-if="url" :src="url" alt="">
			<img v-else-if="model" :src="`${ useRuntimeConfig().public.apiURL }/attachments/${ model }`" alt="">
		</template>
	</platform-file-upload>
</template>

<script setup>
	const loading = ref(false);
	const url = ref(null);
	const model = defineModel();

	const upload = async (files) => {

		loading.value = true;

		if(files.length) {
			// Create new form data
			const formData = new FormData();
			formData.append('file', files[0]);
			// Call upload api endpoint
			const { data, error } = await useBaseFetch('/upload', {
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			url.value = data.value.data.url;
			model.value = data.value.data.id;

			usePrettyToast().successToast('Archivo cargado exitosamente');
		}

		loading.value = false;
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.file-uploader
		.file
			border-bottom: 1px solid var(--bs-gray-300)
			padding: 0.25rem
			font-size: 0.85rem

		:deep(.upload-file)
			width: 100%
			margin-bottom: 1rem
			aspect-ratio: 1.5
			border: 1px dashed var(--bs-gray-300)
			border-radius: 0.5rem

		:deep(.drop-zone)
			aspect-ratio: 1.5
			padding: 0.5rem

			.file-overlay
				border-radius: 0.5rem

			& > span:not(.file-overlay)
				max-width: 90%
				white-space: nowrap
				overflow: hidden
				text-overflow: ellipsis

			:deep(.file-overlay)
				border-radius: 50%

			img
				width: 100%
				aspect-ratio: 1.5
				object-fit: cover
				border-radius: 0.5rem
				padding: 0.25rem
</style>