<template>
	<platform-dialog ref="deleteDialog" title="Delete item">
		<template #default="slotProps">
			<div class="p-4">
				<h5 class="text-center mb-1">{{ entity?.actions?.delete?.modal.message || 'Are you sure?' }}</h5>
				<p class="text-center text-muted fs-7">{{ entity?.actions?.delete?.modal.warning || 'This action cannot be undone.' }}</p>

				<div class="row">
					<div class="col-6">
						<a
							href="#"
							class="btn btn-outline-primary w-100"
							@click.prevent="deleteItem"
						>{{ entity?.actions?.delete?.modal.confirm || 'Delete' }}</a>
					</div>
					<div class="col-6">
						<a
							href="#"
							class="btn btn-danger w-100"
							@click.prevent="slotProps.close"
						>{{ entity?.actions?.delete?.modal.cancel || 'Cancel' }}</a>
					</div>
				</div>
			</div>
		</template>
	</platform-dialog>
</template>

<script setup>
	const deleteDialog = ref(null);

	const { errorToast, successToast } = usePrettyToast();
	const emit = defineEmits([ 'deleted', 'deleteLoading', 'deleteError' ]);

	const props = defineProps({
		entity: {
			type: Object,
			required: true,
		},
		item: {
			// can be an object or null
			type: [ Object, null ],
			required: true,
		},
		deleteLink: {
			type: String,
			default: '',
		},
	});

	const openDialog = () => {
		deleteDialog.value.openDialog();
	};

	const deleteItem = async () => {
		deleteDialog.value.closeDialog();

		emit('deleteLoading');

		const {
			data,
			error,
		} = await useBaseFetch(props.deleteLink ? `${ props.deleteLink }/${ props.item.id }` : `/${ props.entity.plural }/${ props.item.id }`, {
			method: 'DELETE',
		});

		if(error.value) {
			errorToast(error.value.data.message);
			emit('deleteError', error.value);
			return;
		}

		emit('deleted', props.item);
	};

	defineExpose({
		openDialog,
	});
</script>

<style lang="sass" scoped>
</style>