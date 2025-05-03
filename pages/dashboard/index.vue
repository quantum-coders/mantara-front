<template>
	<platform-title title="Bienvenido">
		<template #actions>
			<a
				href="#"
				class="btn btn-sm btn-primary"
				@click.prevent="openNewCampaignDialog"
			>
				Crear nueva campaña
			</a>
		</template>
	</platform-title>

	<editor-new-campaign-dialog ref="newCampaignDialog" />
</template>

<script setup>
	const user = useAuthUser();
	useHead({ title: 'Panel de Control' });

	const newCampaignDialog = ref(null);

	const openNewCampaignDialog = () => {
		newCampaignDialog.value.openDialog();
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>