<template>
	<div class="datable d-flex flex-column flex-grow-1">
		<div class="datable-actions mb-3">
			<div class="col-search">
				<form @submit.prevent="search">
					<div class="input-group">
						<input
							type="text"
							class="form-control"
							:placeholder="dictionary.search"
							v-model="searchQuery"
						>
						<button
							type="reset"
							class="btn btn-icon btn-clear text-nowrap"
							v-if="searchQuery"
							@click="clearSearch"
						>
							<icon name="line-md:close-small" />
						</button>
						<button class="btn btn-primary d-flex align-items-center gap-2" type="submit">
							<icon name="hugeicons:search-01" />
							{{ dictionary.search }}
						</button>
					</div>
				</form>
			</div>
			<div class="col-other-actions">
				<slot name="meta-actions" />
			</div>
		</div>

		<div class="datable-scroll flex-grow-1 mb-3" ref="datableWrapperRef">
			<platform-loading
				:active="!!isLoading"
				:is-full-page="false"
			>
				<template #default>
					<slot name="loadingDefault" />
				</template>
				<template #before>
					<slot name="loadingBefore" />
				</template>
				<template #after>
					<slot name="loadingAfter" />
				</template>
			</platform-loading>
			<div
				class="datable-wrapper flex-grow-1"
				:class="{ 'd-flex': !items.length }"
			>
				<platform-da-table :columns="preparedFields" :rows="items" v-show="items.length" :storage-key="`mia`">
					<template v-for="cs in cellSlots" v-slot:[cs]="{ row }">
						<slot :name="cs.replace('cell-', '')" :item="row"></slot>
					</template>

					<template #cell-name="{ row }">
						<slot name="name" :item="row" />
					</template>
				</platform-da-table>

				<div class="empty-state" v-show="!items.length && !isLoading">
					<slot name="empty-state">
						<div class="empty-wrapper">
							<icon name="hugeicons:inbox" class="icon" />
							<p>{{ dictionary.notFound }}</p>
						</div>
					</slot>
				</div>
			</div>
		</div>

		<div class="d-flex align-items-center justify-content-between">
			<!-- showing item from 1 to x of y items -->
			<p class="mb-0" v-if="items.length">
				{{ getDictionary('showing') }}
				{{ (currentPage - 1) * perPage + 1 }}
				{{ getDictionary('to') }}
				{{ (currentPage - 1) * perPage + items.length }}
				{{ getDictionary('of') }}
				{{ totalItems }}
				{{ getDictionary('elementos') }}
			</p>
			<p class="mb-0" v-else>
				{{ getDictionary('noItems') }}
			</p>

			<div
				class="datable-controls d-flex align-items-center gap-2"
				:class="{ 'is-disabled': isLoading }"
			>
				<nav class="ms-auto">
					<vue-awesome-paginate
						v-if="totalItems > perPage"
						class="mb-0"
						pagination-container-class="pag pagination"
						paginate-buttons-class="page-link"
						active-page-class="active"
						:total-items="totalItems"
						:items-per-page="parseInt(perPage)"
						:max-pages-shown="5"
						v-model="currentPage"
						@click="changePage"
					>
						<template #prev-button>
							{{ getDictionary('previous') }}
						</template>
						<template #next-button>
							{{ getDictionary('next') }}
						</template>
					</vue-awesome-paginate>
				</nav>

				<!-- select number of elements -->
				<select class="form-select flex-grow-0 w-auto" v-model="perPage">
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="25">25</option>
				</select>
			</div>
		</div>
	</div>
</template>

<script setup>

	import { VueAwesomePaginate } from 'vue-awesome-paginate';

	//region Props ----------------------------------------------------------------------------------------------------

	const props = defineProps({
		fields: {
			type: Array,
			required: true,
		},
		endpoint: {
			type: String,
			default: '',
		},
		page: {
			type: Number,
			default: 1,
		},
		sort: {
			type: Object,
			default: () => ({
				field: 'id',
				order: 'desc',
			}),
		},
		queryFields: {
			type: Array,
			default: () => [],
		},
		dictionary: {
			type: Object,
			default: () => ({
				search: 'Buscar',
				previous: 'Anterior',
				next: 'Siguiente',
				notFound: 'Oppsy Daisy, such empty',
				showing: 'Mostrando',
				to: 'a',
				of: 'de',
				items: 'elementos',
				noItems: 'Elementos no encontrado',
			}),
		},
	});

	//endregion

	//region Vars -----------------------------------------------------------------------------------------------------

	const isLoading = ref(false);
	const items = ref([]);
	const pages = ref(0);
	const totalItems = ref(0);
	const currentPage = ref(1);
	const checkedRows = ref([]);
	const searchQuery = ref('');
	const perPage = ref(10);

	//endregion

	// Dictionary -----------------------------------------------------------------------------------------------------

	const baseDictionary = {
		search: 'Search',
		previous: 'Previous',
		next: 'Next',
		notFound: 'Oppsy Daisy, such empty',
		showing: 'Mostrando',
		to: 'a',
		of: 'de',
		items: 'elementos',
		noItems: 'Elementos no encontrado',
	};

	// function to get the dictionary word from props, if not found, use the baseDictionary
	const getDictionary = function(word) {
		return props.dictionary[word] ?? baseDictionary[word];
	};

	// Preparing vars -------------------------------------------------------------------------------------------------

	const cellSlots = computed(() => {
		const slots = Object.keys(useSlots());

		// filter the meta-actions slot
		const filteredSlots = slots.filter((slot) => slot !== 'meta-actions');

		// add the prefix "cell-" to the slots
		const prefixedSlots = filteredSlots.map((slot) => {
			if(slot.startsWith('cell-')) {
				return slot;
			}
			return `cell-${ slot }`;
		});

		return prefixedSlots;
	});

	// compute the fields, change title for label and field for key
	const prepareFields = () => {

		// shallow copy of props.fields
		const shallowCopy = JSON.parse(JSON.stringify(props.fields));

		return shallowCopy.map((field) => {

			const key = field.field || field.key;
			const label = field.title || field.label;

			// remove title
			if(field.title) {
				delete field.title;
			}

			// remove field
			if(field.field) {
				delete field.field;
			}

			return {
				...field,
				key,
				label,
			};
		});
	};

	const preparedFields = ref(prepareFields());

	// Search ---------------------------------------------------------------------------------------------------------

	const search = async function() {
		currentPage.value = 1;
		await fetchPage();
	};

	const clearSearch = async function() {
		searchQuery.value = '';
		await search();
	};

	// Fetch ----------------------------------------------------------------------------------------------------------

	const fetchPage = async function() {

		// Show the loader
		isLoading.value = true;

		const { data, error } = await useBaseFetch(props.endpoint, {
			method: 'GET',
			params: {
				page: currentPage.value,
				limit: perPage.value,
				by: props.sort.field,
				order: props.sort.order,
				q: searchQuery.value,
				refresh: new Date().getTime(),
			},
		});

		// Hide the loader
		isLoading.value = false;

		// Check if there was an error
		if(error.value) {
			console.error('error', error.value.data.status);

			if(error.value.data.status === 404) {
				items.value = [];
				pages.value = 0;
				totalItems.value = 0;
			}

			return;
		}

		// Check if items is empty
		if(!data.value.data.length) {

			items.value = [];
			pages.value = 0;
			totalItems.value = 0;

			return;
		}

		items.value = data.value.data;
		pages.value = data.value.pages;
		totalItems.value = data.value.count;

		// Check if the current page is greater than the total pages, if so, set it to the last page
		if(currentPage.value > data.value.pages) currentPage.value = data.value.pages;
	};

	// onMounted ------------------------------------------------------------------------------------------------------

	onMounted(async () => {
		currentPage.value = props.page;

		await fetchPage();
	});

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.datable-scroll
		position: relative
		flex-grow: 1
		overflow-x: auto

		.datable-wrapper
			min-width: 800px
			border-radius: 0.5rem

		// Add pretty scrollbar
		@extend .pretty-scrolls

	.datable
		container-type: inline-size

	.datable-actions
		display: flex
		flex-direction: column
		gap: 1rem
		margin-bottom: 1rem

		@container (min-width: #{$md})
			flex-direction: row
			justify-content: space-between
			align-items: center

	.col-search
		width: 100%

		@container (min-width: #{$md})
			width: 380px

	.col-other-actions
		flex: 1

	.d-inline-table
		display: inline-table

	.checkbox-header
		input
			top: 2px

	.datable-wrapper
		position: absolute
		height: 100%
		width: 100%
		overflow: auto
		background: var(--bs-body-bg)

		// Add pretty scrollbar
		@extend .pretty-scrolls

	.data-table-controls
		&.is-disabled
			pointer-events: none
			opacity: 0.5

	.btn-clear
		background: var(--bs-light-bg-subtle)
		border-top: 1px solid var(--bs-border-color)
		border-bottom: 1px solid var(--bs-border-color)

	.empty-state
		display: flex
		width: 100%
		flex-direction: column
		justify-content: center
		align-items: center

		.empty-wrapper
			display: flex
			flex-direction: column
			width: 200px
			aspect-ratio: 1
			justify-content: center
			align-items: center
			background: var(--bs-light-bg-subtle)
			border-radius: 50%
			margin-bottom: 1rem

			.icon
				font-size: 4rem
				fill: red
				background: var(--brand1)

				svg
					fill: red

			p
				width: 80%
				margin: 0 auto
				text-align: center
</style>