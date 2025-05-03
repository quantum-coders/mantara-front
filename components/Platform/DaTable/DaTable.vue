<template>
	<div class="table-container">
		<!-- Header Row with Reordering -->
		<draggable
			class="table-row header-row"
			:list="columns"
			item-key="key"
			ghost-class="sortable-ghost"
			chosen-class="sortable-chosen"
			tag="div"
			handle=".drag-handle"
			:animation="300"
		>
			<template #item="{ element: column, index }">
				<div
					class="cell header-cell"
					:class="[ column.flexGrow ? 'grow-column' : '', ...(column.titleClass? column.titleClass.split(' ') : []) ]"
					:style="column.flexGrow ? {} : { width: column.width + 'px' }"
				>
					<div class="header-content">
						<span class="drag-handle" title="Drag to reorder">
							<icon name="ic:twotone-drag-indicator" />
						</span>
						<span class="label-text">{{ column.label }}</span>
						<span
							v-if="column.resizable === true && !column.flexGrow"
							class="resize-handle"
							:class="{ 'active-resize': resizingIndex === index }"
							@mousedown="startResize($event, index)"
						></span>
					</div>
				</div>
			</template>
		</draggable>

		<!-- Data Rows -->
		<div
			class="table-row data-row"
			v-for="(row, rowIndex) in rows"
			:key="rowIndex"
		>
			<div
				class="cell"
				v-for="(col, colIndex) in columns"
				:key="col.key"
				:class="[ col.flexGrow ? 'grow-column' : '', ...(col.class ? col.class.split(' ') : []) ]"
				:style="col.flexGrow ? {} : { width: col.width + 'px' }"
			>
				<slot :name="`cell-${col.key}`" :row="row">
					{{ row[col.key] }}
				</slot>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, watch, onMounted } from 'vue';
	import draggable from 'vuedraggable';

	const props = defineProps({
		columns: {
			type: Array,
			required: true,
		},
		rows: {
			type: Array,
			required: true,
		},
		storageKey: {
			type: String,
			default: 'my-table-columns',
		},
	});

	const emit = defineEmits([ 'update:columns' ]);

	const columns = ref([]);
	const resizingIndex = ref(null);

	onMounted(() => {
		columns.value = props.columns.map(col => ({ ...col }));
		loadColumnState();
	});

	watch(columns, () => {
		saveColumnState();
		emit('update:columns', columns.value);
	}, { deep: true });

	function saveColumnState() {
		localStorage.setItem(props.storageKey, JSON.stringify(
			columns.value.map(({ key, width, flexGrow }) => ({ key, width, flexGrow })),
		));
	}

	function loadColumnState() {
		const raw = localStorage.getItem(props.storageKey);
		if(!raw) return;
		try {
			const saved = JSON.parse(raw);
			const map = Object.fromEntries(saved.map(col => [ col.key, col ]));
			columns.value = saved.map(savedCol => {
				const original = props.columns.find(d => d.key === savedCol.key);
				return { ...original, ...savedCol };
			});
		} catch(e) {
			console.warn('Failed to load saved column config', e);
		}
	}

	function startResize(e, columnIndex) {
		resizingIndex.value = columnIndex;
		const startX = e.clientX;
		const startWidth = columns.value[columnIndex].width;
		const min = Math.max(columns.value[columnIndex].minWidth ?? 40, 40);
		const max = columns.value[columnIndex].maxWidth || 1000;

		const onMouseMove = (moveEvent) => {
			const dx = moveEvent.clientX - startX;
			let newWidth = startWidth + dx;
			newWidth = Math.max(min, Math.min(max, newWidth));
			columns.value[columnIndex].width = newWidth;
		};

		const onMouseUp = () => {
			resizingIndex.value = null;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			saveColumnState();
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
</script>

<style lang="sass">
	.sortable-ghost
		transform: scale(1.05)
		opacity: 0.9
		transition: all 0.15s ease-out

	.sortable-chosen
		opacity: 0.4
		transition: opacity 0.15s ease

		.resize-handle
			opacity: 0
</style>

<style scoped lang="sass">
	.table-container
		width: 100%
		margin: 0 auto
		overflow-x: clip
		height: 400px

	.table-row
		display: flex
		width: 100%
		border-bottom: 1px solid #ccc

	.header-row
		background: #f0f0f0
		font-weight: bold
		position: sticky
		top: 0
		z-index: 2

	.cell
		box-sizing: border-box
		padding: 1rem 0.5rem
		overflow: hidden
		text-overflow: ellipsis
		white-space: nowrap
		flex: 0 0 auto
		flex-shrink: 0
		font-size: 0.8rem
		min-width: 100px

	.header-cell
		position: relative
		user-select: none

		&:hover
			.resize-handle:not(.active-resize)
				background-color: #ddd

	.header-content
		display: flex
		gap: 0.5rem
		align-items: center
		justify-content: space-between
		height: 100%
		font-weight: normal
		font-size: 0.8rem
		min-width: 0

	.label-text
		overflow: hidden
		text-overflow: ellipsis
		white-space: nowrap
		flex: 1 1 auto
		min-width: 0

	.resize-handle
		width: 4px
		border-radius: 6px
		height: 80%
		cursor: col-resize
		position: absolute
		top: 10%
		right: 0
		bottom: 0
		background-color: transparent
		transition: background-color 0.1s

		&.active-resize
			background-color: var(--brand1)

	.drag-handle
		cursor: grab
		user-select: none

		.iconify
			display: flex
			align-items: center
			justify-content: center

	.grow-column
		flex: 1 1 0
		width: auto !important
</style>
