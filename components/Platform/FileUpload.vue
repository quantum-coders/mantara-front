<template>
	<div>
		<label class="upload-file">
			<platform-loading
				:active="isLoading"
				:is-full-page="false"
			/>
			<input
				:id="props.id"
				ref="inputRef"
				type="file"
				class="file-input"
				v-bind="$attrs"
				@change="onChange"
			/>
			<span v-if="label">
				<slot name="label">{{ label }}</slot>
			</span>
			<span
				class="drop-zone"
				@dragenter.prevent="droppable = true"
			>
				<slot v-bind="{ files: localFiles, droppable }">
					<span v-if="localFiles.length" aria-hidden="true">
						<template v-if="localFiles.length > 1">
							{{ localFiles.length }} files selected
						</template>
						<template v-else>
							{{ localFiles[0].name }}
						</template>
					</span>

					<span v-else aria-hidden="true" class="text-center">Choose files or drop here</span>
				</slot>

				<span
					v-if="droppable"
					class="file-overlay"
					@drop.prevent="onDrop"
					@dragenter.stop="dragEnter"
					@dragleave.stop="dragLeave"
					@dragover.prevent
				>
					<slot name="overlay" />
				</span>
			</span>
		</label>
		<slot name="outside" v-bind="{ filePreviews, files: localFiles, droppable, removeFile }" />
	</div>
</template>

<script setup>
	import { v4 as uuidv4 } from 'uuid';

	/**
	 * File upload component
	 * @component
	 * @param {String} id - The id of the input
	 * @param {Array} modelValue - The array of files
	 * @param {Object} classes - The classes to apply to the elements
	 * @param {String} label - The label of the input
	 * @param {String} dropText - The text to display when dropping files
	 * @param {Boolean} isLoading - Whether the loading overlay is active
	 */

	const attrs = useAttrs();
	const localFiles = ref([]);
	const droppable = ref(false);
	const inputRef = ref(null);

	const filePreviews = ref([]);

	//compute local files and with FileReader read the files and return an array of the files with the base64
	const readFiles = () => {
		return localFiles.value.map((file) => {
			const reader = new FileReader();

			// push an object with the filename and the empty base64
			filePreviews.value.push({ name: file.name, preview: '' });

			reader.onload = (e) => {
				// find the file in the previews array and update the preview
				const preview = filePreviews.value.find((f) => f.name === file.name);
				preview.preview = e.target.result;

				// remove duplicates
				filePreviews.value = filePreviews.value.filter((f, index, self) =>
						index === self.findIndex((t) => (
							t.name === f.name
						))
				);
			};

			reader.readAsDataURL(file);
		});
	};

	const emit = defineEmits([ 'update', 'update:modelValue', 'fileNotSupported' ]);

	// function to remove local file and preview based on index
	const removeFile = (index) => {
		localFiles.value.splice(index, 1);
		filePreviews.value.splice(index, 1);
		emit('update', localFiles.value);
		emit('update:modelValue', localFiles.value);
	};

	const props = defineProps({
		id: {
			type: String,
			default: uuidv4(),
		},
		modelValue: {
			type: Array,
			default: () => [],
		},
		classes: {
			type: Object,
			default: () => ({
				label: '',
				input: '',
				text: '',
			}),
		},
		label: {
			type: String,
			default: '',
		},
		dropText: {
			type: String,
			default: 'Drop file here',
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	});

	const onChange = (e) => {
		const files = e.target.files;

		if(!attrs.multiple) {
			localFiles.value = [ ...files ];
		} else {
			localFiles.value = [ ...localFiles.value, ...files ];
		}

		readFiles();

		emit('update', localFiles.value);
		emit('update:modelValue', localFiles.value);
	};

	const onDrop = (e) => {
		let files = e.dataTransfer.files;

		// Validate that files are allowed checking the "accept" attribute
		const accept = attrs.accept;
		if(accept) {

			let allowed = [];
			// Check if accept is a string or an array
			if(typeof accept === 'string') {
				allowed = accept.split(',').map((a) => a.trim());
			} else {
				allowed = accept;
			}

			const allowedFiles = Array.from(files).filter((f) => {
				return allowed.includes(f.type);
			});

			if(allowedFiles.length !== files.length) {
				console.warn('Some files were not allowed');
				emit('fileNotSupported', files);
				files = allowedFiles;
			}
		}

		if(!attrs.multiple) {
			localFiles.value = [ ...files ];
		} else {
			localFiles.value = [ ...localFiles.value, ...files ];
		}

		localFiles.value = [ ...localFiles.value, ...files ];
		emit('update', localFiles.value);
		emit('update:modelValue', localFiles.value);

		droppable.value = false;
	};

	const dragEnter = () => {
		console.log('dragEnter');
		droppable.value = true;
	};

	const dragLeave = () => {
		console.log('dragLeave');
		droppable.value = false;
	};

	const dragOver = () => {
		console.log('dragOver');
	};

	const resetFiles = () => {
		inputRef.value.value = '';
		localFiles.value = [];
	};

	defineExpose({
		resetFiles,
		localFiles,
	});

</script>

<style lang="sass" scoped>

	.upload-file
		display: flex
		flex-direction: column

	.drop-zone
		display: flex
		flex-grow: 1
		flex-direction: column
		align-items: center
		justify-content: center

	.file-input
		position: absolute
		overflow: hidden
		clip: rect(0 0 0 0)
		width: 1px
		height: 1px
		margin: -1px
		border: 0
		padding: 0

	.file-overlay
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%
		display: flex
		align-items: center
		justify-content: center
		color: white
		background-color: rgba(0, 0, 0, 0.5)
		transition: all 0.3s ease-in-out

</style>