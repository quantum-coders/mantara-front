<template>
	<div class="custom-select">
		<select @change="navigateToSection" v-model="currentSection">
			<option value="overview">Overview</option>
			<option value="brief">Brief</option>
			<option value="market-analysis">Análisis de Mercado</option>
			<option value="target-audience">Público Objetivo</option>
			<option value="strategy">Estrategia</option>
			<option value="creative-suite">Suite Creativa</option>
			<option value="channel-plan">Plan de Canales</option>
			<option value="execution-assets">Recursos de Ejecución</option>
			<option value="budget-outline">Esquema de Presupuesto</option>
			<option value="roadmap-timeline">Cronograma</option>
			<option value="kpi-framework">Marco de KPIs</option>
		</select>
	</div>
</template>

<script setup>
	const route = useRoute();
	const router = useRouter();

	// Set initial value based on current route, defaulting to "overview" when there's no section
	const currentSection = ref(route.params.section || 'overview');

	// Navigate when selection changes
	const navigateToSection = () => {
		// Si es "overview" y estamos en la ruta principal, no hacemos nada (evita navegación innecesaria)
		if(currentSection.value === 'overview' && !route.params.section) {
			return;
		}

		// Navegar a la sección seleccionada
		router.push(`/dashboard/
		projects/${ route.params.id }/${ currentSection.value }`);
	};

	// Watch for route changes and update select accordingly
	watch(
		() => route.params.section,
		(newSection) => {
			// Si no hay sección en la URL, establecer "overview" como valor por defecto
			currentSection.value = newSection || 'overview';
		},
		{ immediate: true },
	);

	// Al cargar el componente, si estamos en la ruta base y "overview" es el valor predeterminado,
	// redirigir automáticamente a la ruta /overview para mantener sincronizada la URL con el selector
	onMounted(() => {
		if(!route.params.section) {
			router.push(`/dashboard/projects/${ route.params.id }/overview`);
		}
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.custom-select
		select
			background: var(--brand1)
			color: white
			padding: 0.5rem 1rem
			border-radius: 0.5rem
			appearance: base-select
			width: 250px

			&::picker-icon
				content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M18 9s-4.419 6-6 6s-6-6-6-6' color='currentColor'/%3E%3C/svg%3E")
				padding-top: 0.125rem
				margin-bottom: -2px

			option
				padding: 0.75rem

				&:checked
					background: var(--brand2)
					color: white

				&::checkmark
					color: white
					margin-top: 4px
					margin-bottom: -2px
					content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' color='currentColor'%3E%3Cpath d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10'/%3E%3Cpath d='m8 12.5l2.5 2.5L16 9'/%3E%3C/g%3E%3C/svg%3E")

			selectedcontent
				background: black

		::picker(select)
			appearance: base-select
			background-color: black
			color: white
			width: 250px
			border-radius: 0.5rem
			padding: 0

</style>
