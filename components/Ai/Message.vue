<template>
	<div class="message-wrapper" :class="`role-${props.message.role}`">
		<article class="message">
			<icon v-if="message.loading && !props.message.text" name="line-md:loading-twotone-loop" />
			<div class="message-content" v-html="converter.makeHtml(props.message.text)" />

			<!-- Web Search Referencias - se mostrará solo cuando existan resultados -->
			<ai-web-references
				v-if="webSearchResults"
				:results="webSearchResults"
			/>
		</article>

		<p class="timestamp">{{ relativeTime }}</p>
	</div>
</template>

<script setup>
	import showdown from 'showdown';
	import TimeAgo from 'javascript-time-ago';
	import en from 'javascript-time-ago/locale/en';
	const converter = new showdown.Converter({
		simpleLineBreaks: true,
	});

	try {
		TimeAgo.addDefaultLocale(en);
	} catch(e) {
		console.error(e);
	}

	const timeAgo = new TimeAgo('en-US');

	const props = defineProps({
		message: {
			type: Object,
			required: true,
		},
	});

	// Reactive relative time
	const relativeTime = ref(timeAgo.format(new Date(props.message.created)));

	// Analizar las metas si están disponibles
	const parsedMetas = computed(() => {
		if(!props.message.metas) return null;

		// Si metas ya es un objeto, usarlo directamente
		if(typeof props.message.metas === 'object' && !Array.isArray(props.message.metas)) {
			return props.message.metas;
		}

		// Si metas es una cadena, intentar analizarla como JSON
		if(typeof props.message.metas === 'string') {
			try {
				return JSON.parse(props.message.metas);
			} catch(e) {
				console.error('Error parsing message metas:', e);
				return null;
			}
		}

		return null;
	});

	// Analizar toolResults de las metas
	const parsedToolResults = computed(() => {
		if(!parsedMetas.value || !parsedMetas.value.toolResults) return null;

		// Si toolResults ya es un objeto, usarlo directamente
		if(typeof parsedMetas.value.toolResults === 'object' && !Array.isArray(parsedMetas.value.toolResults)) {
			return parsedMetas.value.toolResults;
		}

		// Si toolResults es una cadena, intentar analizarla como JSON
		if(typeof parsedMetas.value.toolResults === 'string') {
			try {
				return JSON.parse(parsedMetas.value.toolResults);
			} catch(e) {
				console.error('Error parsing toolResults:', e);
				return null;
			}
		}

		return null;
	});

	// --- Lógica Unificada para Obtener Resultados de WebSearch ---
	const webSearchResults = computed(() => {
		// 1. Comprobar datos "vivos" del stream (mayor prioridad)
		if(props.message.toolResults && typeof props.message.toolResults.webSearch === 'object' && props.message.toolResults.webSearch !== null) {
			// console.log('Using live toolResults:', props.message.toolResults.webSearch);
			return props.message.toolResults.webSearch;
		}

		// 2. Comprobar datos guardados en metas (menor prioridad)
		if(props.message.metas && props.message.metas.toolResults) {
			try {
				let parsedResults;
				// Si ya es un objeto (menos probable si viene de DB, pero por si acaso)
				if(typeof props.message.metas.toolResults === 'object') {
					parsedResults = props.message.metas.toolResults;
				}
				// Si es una cadena JSON (lo esperado desde la DB)
				else if(typeof props.message.metas.toolResults === 'string') {
					parsedResults = JSON.parse(props.message.metas.toolResults);
				}

				// Verificar si el resultado parseado tiene webSearch
				if(parsedResults && typeof parsedResults.webSearch === 'object' && parsedResults.webSearch !== null) {
					// console.log('Using parsed metas.toolResults:', parsedResults.webSearch);
					return parsedResults.webSearch;
				}
			} catch(e) {
				console.error('Error parsing message.metas.toolResults:', e, props.message.metas.toolResults);
			}
		}

		// 3. Si no se encuentra en ninguna parte
		return null;
	});

	let intervalId;

	onMounted(() => {
		// Update the relative time every 30 seconds
		intervalId = setInterval(() => {
			relativeTime.value = timeAgo.format(new Date(props.message.created));
		}, 30000);
	});

	onUnmounted(() => {
		// Clear the interval when the component is destroyed
		clearInterval(intervalId);
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.message-wrapper
		display: flex
		flex-direction: column
		max-width: 80%
		margin: 0.5rem 0

		&.role-user
			align-items: flex-end
			align-self: flex-end

		&.role-agent
			align-self: flex-start
			background: var(--bs-light-bg-subtle)
			color: var(--bs-dark)

		.message
			display: flex
			flex-direction: column
			padding: 0.5rem
			border-radius: 0.5rem
			background: var(--bs-light-bg-subtle)
			border: 1px solid var(--bs-border-color)
			margin-bottom: 0.25rem

			.message-content
				*:last-child
					margin: 0

			pre
				margin: 0
				white-space: pre-wrap
				word-wrap: break-word

		.timestamp
			margin-bottom: 0
			color: #AAA
			font-size: 0.6rem
			padding: 0 0.25rem

</style>
