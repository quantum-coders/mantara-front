<template>
	<label
		:for="`button-${ id }`"
		:class="{'is-active': props.modelValue, 'is-disabled': !!props.disabled}"
		class="toggle-button"
	>
		<input
			type="checkbox"
			:disabled="props.disabled"
			:id="`button-${ id }`"
			:checked="props.modelValue"
			@input="toggleValue"
		>
		<slot name="preSwitch" :state="props.modelValue"></slot>
		<span class="toggle-switch" />
		<slot name="postSwitch" :state="props.modelValue"></slot>
	</label>
</template>

<script setup>
	import { v4 as uuidv4 } from 'uuid';

	const emit = defineEmits([ 'update', 'update:modelValue' ]);

	// generate a random id
	const id = uuidv4();

	const props = defineProps({
		modelValue: {
			type: [ Boolean, String, Number ],
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		}
	});

	const toggleValue = (event) => {
		emit('update:modelValue', event.target.checked);
	};
</script>

<style scoped lang="sass">

	.toggle-button
		height: auto
		vertical-align: middle
		user-select: none
		cursor: pointer

		&[disabled],
		&.is-disabled
			opacity: 0.5
			cursor: not-allowed

	input[type="checkbox"]
		opacity: 0
		position: absolute
		width: 1px
		height: 1px

	.toggle-switch
		display: inline-block
		flex-shrink: 0
		height: 1em
		border-radius: 1em
		width: 2em
		background: $gray-300
		box-shadow: inset 0 0 1px $gray-300
		position: relative
		transition: all .25s

		&:before
			content: ''
			position: absolute
			display: block
			height: calc(1em - 4px)
			width: calc(1em - 4px)
			border-radius: 50%
			left: 2px
			top: 2px
			transform: translateX(0)
			transition: all .25s
			background: $gray-400

	.is-active
		.toggle-switch
			background: lighten($success, 40%)
			box-shadow: inset 0 0 1px lighten($success, 40%)

	.is-active .toggle-switch:before
		transform: translateX(calc(1.5em + 2px))

	.is-active
		.toggle-switch
			&:before
				left: -9px
				background: $success
				box-shadow: 0 0 1px $success

</style>