<template>
	<template v-if="entity">
		<platform-loading :active="loading" :is-full-page="true" />
		<platform-title :title="entity.title?.plural || title">
			<template #actions>
				<slot name="actions">
					<nuxt-link
						:to="newButton?.url || entity.actions?.new.url"
						class="btn btn-sm btn-secondary"
					>{{ newButton?.text || entity.actions?.new.title }}
					</nuxt-link>
				</slot>
			</template>
		</platform-title>
		<div class="data-wrapper p-4 d-flex flex-column flex-grow-1">
			<platform-da-table-dynamic
				:fields="entity.fields || dataTable.fields"
				:endpoint="`${ endpoint ? endpoint : `/${ entity.plural }` }${ dataTable.endpointParameters || '' }`"
			>
				<template #meta-actions>
					<slot name="meta-actions"></slot>
				</template>

				<template v-for="f in fieldsNoActions" v-slot:[f.field]="{ item }">
					<slot :name="f.field" :item="item"></slot>
				</template>

				<template #actions="{ item }">
					<div class="d-flex gap-2">
						<div class="btn-group" role="group">
							<slot name="extraActions" :item="item"></slot>
							<button
								class="btn btn-sm btn-outline-primary"
								@click="editItem(item)"
							>
								<icon name="hugeicons:edit-01" />
							</button>
							<button
								class="btn btn-sm btn-outline-danger"
								@click="confirmDeletion(item)"
							>
								<icon name="hugeicons:delete-02" />
							</button>
						</div>
					</div>
				</template>
			</platform-da-table-dynamic>
		</div>

		<teleport to="body">
			<platform-delete-item-dialog
				:item="itemToDelete"
				:entity="entity"
				:delete-link="deleteLink"
				ref="deleteDialog"
				@deleted="deleted"
				@delete-loading="loading"
				@delete-error="deleteError"
			/>
		</teleport>

	</template>
	<p v-else class="alert alert-danger m-4">No entity defined</p>
</template>

<script setup>

	const loading = ref(false);
	const deleteDialog = ref(null);
	const itemToDelete = ref(null);
	const indexDataTableRef = ref(null);

	const props = defineProps({
		entity: {
			type: Object,
			required: true,
		},
		title: {
			type: String,
			default: '',
		},
		endpoint: {
			type: String,
			default: '',
		},
		newButton: {
			type: Object,
			default: () => ({}),
		},
		dataTable: {
			type: Object,
			default: () => ({}),
		},
		editLink: {
			type: String,
			default: '',
		},
		deleteLink: {
			type: String,
			default: '',
		},
	});

	// computed fields removing actions
	const fieldsNoActions = computed(() => {

		// get all the slots
		const slots = Object.keys(useSlots());

		// get from props.entity.fields all with the "field" = to any of the slots
		const fields = props.entity.fields.filter((f) => f.field !== 'actions' && slots.includes(f.field));
		console.log('fields', fields);

		return fields.filter((f) => f.field !== 'actions');
	});

	const editItem = (item) => {
		useRouter()
			.push(props.editLink ? `${ props.editLink }/${ item.id }` : `/dashboard/${ props.entity?.plural }/${ item.id }`);
	};

	const deleted = () => {
		usePrettyToast().successToast(props.entity?.actions?.delete?.confirmation || 'Deleted');
		indexDataTableRef.value.refreshTable();
	};

	const deleteError = (error) => {
		console.error(error);
		indexDataTableRef.value.setLoading(false);
	};

	const confirmDeletion = (item) => {
		itemToDelete.value = item;
		deleteDialog.value.openDialog();
	};
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
</style>