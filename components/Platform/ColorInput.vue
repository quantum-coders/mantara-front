<template>
	<!-- Input group with color square and text input -->
	<div class="input-wrapper form-control">
		<div
			class="color-preview"
			:style="{ backgroundColor: selectedColor }"
			@click="openColorPicker"
		/>
		<input
			ref="colorPicker"
			type="color"
			class="color-picker"
			v-model="selectedColor"
		/>
		<input
			type="text"
			v-model="selectedColor"
			maxlength="7"
			placeholder="#000000"
		/>
	</div>
</template>

<script setup>
	import { ref, computed } from 'vue';

	// Emit the model value to the parent
	const emit = defineEmits([ 'update:modelValue' ]);

	// Receive the initial value from the parent component
	const props = defineProps({
		modelValue: {
			type: String,
			default: '#000000', // Default to black color
		},
	});

	// Computed property for two-way binding with v-model
	const selectedColor = computed({
		get: () => props.modelValue,
		set: (value) => {
			// Ensure the value is a valid Hex color
			if(/^#([0-9A-Fa-f]{3}){1,2}$/.test(value) || value === '') {
				emit('update:modelValue', value);
			}
		},
	});

	// Reference for the hidden color picker input
	const colorPicker = ref(null);

	// Open the hidden color picker when the color preview is clicked
	const openColorPicker = () => {
		colorPicker.value.click();
	};
</script>

<style lang="sass" scoped>
	.input-wrapper
		display: flex
		align-items: center
		gap: 0.5rem

		.color-preview
			width: 25px
			aspect-ratio: 1
			border-radius: 0.5rem
			border: 1px solid #ccc
			cursor: pointer
			z-index: 2

		.color-picker
			position: absolute
			left: 1rem
			top: 1rem
			width: 10px
			height: 10px

		input
			flex: 1
			border: 0
</style>
