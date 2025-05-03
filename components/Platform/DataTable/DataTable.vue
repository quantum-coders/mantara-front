<template>
	<div class="data-table d-flex flex-column flex-grow-1">
		<div class="data-table-actions mb-3">
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

		<div class="data-table-scroll flex-grow-1 mb-3" ref="dataTableWrapperRef">
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
				class="data-table-wrapper flex-grow-1"
				:class="{ 'd-flex': !items.length }"
			>
				<div v-show="items.length">
					<div ref="tabulatorRef" />
				</div>
				<div class="empty-state" v-show="!items.length">
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
				class="data-table-controls d-flex align-items-center gap-2"
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
	/*
	* Quantum Data Table v2.0.0
	* -------------------------
	* This component is a data table that can be used to display data in a table format.
	* It has the following features:
	* - Pagination
	* - Sorting
	* - Search
	* - Checkboxes
	* - Resizable columns
	* - Custom fields
	* - Custom actions
	* - Custom empty results
	* - Custom dictionary
	* - Custom perPage
	* - Custom sort
	*/

	// get the slots
	const slots = useSlots();

	import { TabulatorFull as Tabulator } from 'tabulator-tables';
	import { VueAwesomePaginate } from 'vue-awesome-paginate';
	import { createApp } from 'vue';

	// function to resolve the element from item
	const resolveProp = function(item, val) {
		// first, we check if we don't have a key of type "foo.bar.baz"
		if(!val.includes('.')) return item[val];

		// if we have a key of type "foo.bar.baz", we need to resolve it, but we can have multiple levels
		// so we need to split the string by the dot
		const keys = val.split('.');

		// now we iterate the keys and resolve the value
		let value = item;
		keys.forEach((key) => {
			value = value[key];
		});

		return value;
	};

	const isLoading = ref(true);
	const dataTableWrapperRef = ref(null);
	const checkAllCheckbox = ref(null);

	const items = ref([]);
	const pages = ref(0);
	const totalItems = ref(0);
	const currentPage = ref(1);
	const checkedRows = ref([]);
	const searchQuery = ref('');

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

	const props = defineProps({
		endpoint: {
			type: String,
			required: true,
		},
		fields: {
			type: Array,
			default: () => [],
		},
		page: {
			type: Number,
			default: 1,
		},
		checkboxes: {
			type: Boolean,
			default: false,
		},
		sort: {
			type: Object,
			default: () => ({
				field: 'id',
				order: 'desc',
			}),
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

	const tabulatorRef = ref(null);
	const tabulator = ref(null); //variable to hold your table

	console.log('TABULATOR', tabulator.value);

	// Check if we have perPage in localStorage, if not set it to 10
	const perPage = ref(localStorage.getItem(`data-table-${ props.endpoint }-perPage`) ?? 10);
	const tableSortState = ref({});

	onMounted(async () => {
		currentPage.value = props.page;

		await fetchPage();

		// prepare the columns based on the fields
		let preparedColumns = props.fields.map((f) => {
			let column = {
				title: f.title,
				field: f.field,
				vertAlign: 'middle',
				headerSort: f.sort || false,
				headerClick: (e, column) => {
					const sortField = column.getField();

					// Toggle sort direction
					const currentSort = tableSortState.value[sortField] || 'none';
					const newSortDirection = currentSort === 'asc' ? 'desc' : 'asc';

					// Update sort state
					tableSortState.value[sortField] = newSortDirection;

					sort({
						value: sortField,
						sort: f.sort,
					});
				},
				formatter: (cell) => {

					if(f.field === 'actions') {
						const wrapper = document.createElement('div');

						const vnode = slots['populated-actions']({
							item: cell.getRow().getData(),
						});

						const app = createApp({ render() { return vnode; } });
						app.mount(wrapper);
						return wrapper;

					} else if(slots[f.field]) {
						const wrapper = document.createElement('div');

						const vnode = slots[f.field]({
							item: cell.getRow().getData(),
						});

						const app = createApp({ render() { return vnode; } });
						app.mount(wrapper);
						return wrapper;
					}

					const value = resolveProp(cell.getRow().getData(), f.field);
					if(f.formatter) return f.formatter(value);
					return value;
				},
			};

			// check if f has a tabulator property, if so, merge it with the preparedColumns
			if(f.tabulator) {
				column = {
					...column,
					...f.tabulator,
				};
			}

			return column;
		});

		//calculate the height of data-table-wrapper and set it to the tabulator
		const dataTableWrapper = dataTableWrapperRef.value;
		const dataTableWrapperHeight = dataTableWrapper?.clientHeight;

		//instantiate Tabulator
		tabulator.value = new Tabulator(tabulatorRef.value, {
			data: items.value, //assign data to table
			reactiveData: true, //enable data reactivity
			autoResize: false,
			height: dataTableWrapperHeight,
			maxHeight: '100%',
			layout: 'fitColumns',
			resizableColumns: true,
			responsiveLayout: false,
			columns: preparedColumns, //define table columns
		});

		console.log('TABULATOR', tabulator.value);

		// make that on every resize of the window, the table is resized
		window.addEventListener('resize', () => {

			// update the height of the table
			const dataTableWrapper = dataTableWrapperRef.value;
			const dataTableWrapperHeight = dataTableWrapper.clientHeight;
			tabulator.value.setHeight(dataTableWrapperHeight);
			tabulator.value.redraw();
		});

		tabulator.value.on('tableBuilt', function() {
			const headers = document.querySelectorAll('.tabulator-col-resize-handle');
			headers.forEach((handler) => {
				handler.addEventListener('mouseenter', function() {
					// find the .tabulator-cell before this
					const cell = this.previousElementSibling;
					// get the "tabulator-field" attribute
					const field = cell.getAttribute('tabulator-field');

					// find all the cells with the same field
					const cells = document.querySelectorAll(`.tabulator-cell[tabulator-field="${ field }"], .tabulator-col[tabulator-field="${ field }"]`);

					// find the nextSibling of all the cells
					const nextCells = Array.from(cells).map((cell) => cell.nextElementSibling);

					// add the class to all the nextCells
					nextCells.forEach((cell) => cell.classList.add('hovered-handler'));
				});

				handler.addEventListener('mouseleave', function() {
					// find all the cells with the class "hovered-handler"
					const cells = document.querySelectorAll('.hovered-handler');

					// remove the class from all the cells
					cells.forEach((cell) => cell.classList.remove('hovered-handler'));
				});
			});
		});

	});

	const check = function(id) {
		if(checkedRows.value.includes(id)) {
			checkedRows.value = checkedRows.value.filter((row) => row !== id);
		} else {
			checkedRows.value.push(id);
		}

		// Set indeterminate state of the checkbox
		const checkbox = dataTable.value.querySelector('thead input[type="checkbox"]');
		if(checkedRows.value.length === items.value.length) {
			checkbox.indeterminate = false;
			checkbox.checked = true;
		} else if(checkedRows.value.length > 0) {
			checkbox.indeterminate = true;
			checkbox.checked = false;
		} else {
			checkbox.indeterminate = false;
			checkbox.checked = false;
		}
	};

	const checkAll = function() {
		// If the checkbox is checked, add all the rows to the checkedRows array
		if(checkAllCheckbox.value.checked) {
			// Add all the items to the array, considering that it may have other ids
			checkedRows.value = [
				...checkedRows.value,
				...items.value.map((item) => item.id).filter((id) => !checkedRows.value.includes(id)),
			];
		} else {
			// Remove all the items from the array, considering that it may have other ids
			checkedRows.value = checkedRows.value.filter((row) => !items.value.map((item) => item.id).includes(row));
		}
	};

	const changePage = function(page) {
		currentPage.value = page;
	};

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

		if(tabulator.value) {
			tabulator.value.setData(items.value);
		}
	};

	// Watch ----------------------------------------------------------------------------------------------------------

	watch(perPage, async () => {
		await fetchPage();
		// Save selection in local storage
		localStorage.setItem(`data-table-${ props.endpoint }-perPage`, perPage.value);
	});

	watch(currentPage, async () => {
		await fetchPage();

		// Check if the checkedRows array contains any of the new items
		const newCheckedRows = [];
		items.value.forEach((item) => {
			if(checkedRows.value.includes(item.id)) newCheckedRows.push(item.id);
		});

		// If new checked rows has items, this means that the checkAllCheckbox should be indeterminate
		// If new checked rows is empty, this means that the checkAllCheckbox should be unchecked
		// If new checked rows has the same length as the items, this means that the checkAllCheckbox should be checked
		if(newCheckedRows.length === items.value.length) {
			checkAllCheckbox.value.indeterminate = false;
			checkAllCheckbox.value.checked = true;
		} else if(newCheckedRows.length > 0) {
			checkAllCheckbox.value.indeterminate = true;
			checkAllCheckbox.value.checked = false;
		} else if(newCheckedRows.length === 0) {
			checkAllCheckbox.value.indeterminate = false;
			checkAllCheckbox.value.checked = false;
		}
	});

	// Sort -----------------------------------------------------------------------------------------------------------

	const sort = function(column) {

		// If the column is not sortable, return, this means that sort is false or there is no value
		if(
			column.sort === false ||
			typeof column.sort === 'undefined'
		) return;

		props.sort.field = column.value;

		// If the column is already sorted, reverse the order
		if(props.sort.field === column.value) {
			props.sort.order = props.sort.order === 'asc' ? 'desc' : 'asc';
		} else {
			props.sort.order = 'asc';
		}

		// Reset the current page
		currentPage.value = 1;

		// Fetch the new page
		fetchPage();
	};

	// Refresh table --------------------------------------------------------------------------------------------------
	const refreshTable = function() {
		currentPage.value = 1;
		fetchPage();
	};

	const setLoading = function() {
		isLoading.value = true;
	};

	defineExpose({
		refreshTable,
		setLoading,
		search,
	});

</script>

<style lang="scss">
	@import "https://unpkg.com/tabulator-tables@5.3.1/dist/css/tabulator_bootstrap5.min.css";
</style>

<style lang="sass">
	.pagination
		li
			&:first-child
				.page-link
					border-top-left-radius: var(--bs-pagination-border-radius)
					border-bottom-left-radius: var(--bs-pagination-border-radius)

			&:not(:first-child)
				.page-link
					margin-left: -1px

			&:last-child
				.page-link
					border-top-right-radius: var(--bs-pagination-border-radius)
					border-bottom-right-radius: var(--bs-pagination-border-radius)
</style>

<style lang="sass">

	.grip-padding > tbody > tr > td, .grip-padding > tbody > tr > th
		padding-left: 0.5rem !important
		padding-right: 0.5rem !important

	.grip-container
		z-index: 1000

	.grip-handle
		.grip-resizable
			background: transparent !important

			&:hover
				opacity: 1 !important

				&:before
					content: ''
					position: absolute
					top: 0
					left: 0
					width: 1px
					height: 100%
					border-right: 2px solid var(--bs-border-color)

		&.range-drag
			opacity: 1 !important

			.grip-resizable
				opacity: 1 !important

				&:before
					border-right: 2px dotted var(--bs-border-color)
</style>

<style lang="sass" scoped>

	.data-table-ag-grid
		width: 100%
		height: 100%

	.data-table-scroll
		position: relative
		flex-grow: 1
		overflow-x: auto

		.data-table-wrapper
			min-width: 800px
			border-radius: 0.5rem

		// Add pretty scrollbar
		@extend .pretty-scrolls

	.data-table
		container-type: inline-size

	.data-table-actions
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

	:deep(.resizing)
		background: var(--bs-border-color)

	.data-table-wrapper
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