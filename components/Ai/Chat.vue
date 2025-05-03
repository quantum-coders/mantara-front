<template>
	<div class="ai-chat flex-grow-1 d-flex">
		<platform-loading :active="loading" />

		<div class="flex-grow-1 d-flex flex-column">
			<ai-thread class="flex-grow-1" />
			<div class="p-3">
				<ai-input class="w-100" />
			</div>
		</div>
	</div>
</template>

<script setup>

	const loaded = ref(false);
	const loading = ref(false);
	const ai = useAi();
	const chat = useChat();

	const props = defineProps({
		entity: {
			type: String,
			default: 'agent',
		},
		idEntity: {
			type: [String, Number],
			default: null,
		},
	});

	onMounted(async () => {

		loading.value = true;
		//await ai.fetchAgents();
		await chat.initChat(props.entity, props.idEntity);

		loading.value = false;
		loaded.value = true;
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.ai-chat
		display: flex
		flex-direction: column

		&.is-empty
			justify-content: center
			align-items: center

		.empty
			img
				width: 50%
				display: block
				margin: 2rem auto
</style>