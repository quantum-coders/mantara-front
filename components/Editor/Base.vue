<template>
	<form class="base-editor-form needs-validation d-flex flex-grow-1" novalidate @submit.prevent="upsert">
		<platform-loading
			:active="isLoading"
			:is-full-page="false"
		/>
		<div class="editor-area p-3 d-flex flex-column flex-grow-1">
			<slot :$v="$v" :item="item" />
		</div>

		<div class="properties" v-if="!disableProperties">
			<div>
				<h6
					v-if="!props.disabledPropertyTitle"
					class="card-title border-bottom p-3 mb-0"
				>{{ props.propertyTitle || 'Propiedades' }}</h6>

				<div class="p-3">
					<slot name="properties" :$v="$v" :item="item" />
					<div class="row gx-2">
						<div class="col" v-if="backLink !== false">
							<nuxt-link
								:to="backLink || `/dashboard/${ entity.plural }`"
								class="btn btn-outline-primary w-100"
							>{{ 'Regresar' }}
							</nuxt-link>
						</div>
						<div class="col">
							<button class="btn btn-primary w-100">
								<template v-if="props.existing">{{ 'Actualizar' }}</template>
								<template v-else>{{ 'Guardar' }}</template>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</form>
</template>

<script setup>
	import { useVuelidate } from '@vuelidate/core';

	const props = defineProps({
		disableProperties: {
			type: Boolean,
			default: false,
		},
		disabledPropertyTitle: {
			type: Boolean,
			default: false,
		},
		entity: {
			type: Object,
			required: true,
		},
		propertyTitle: {
			type: String,
			default: '',
		},
		backLink: {
			type: [ String, Boolean ],
			default: '',
		},
		item: {
			type: Object,
			required: true,
		},
		rules: {
			type: Object,
			default: () => ({}),
		},
		existing: {
			type: Boolean,
			default: false,
		},
		prepareData: {
			type: Function,
			default: null,
		},
		upsertEndpoint: {
			type: String,
			default: '',
		},
		upsertId: {
			type: [String, null],
			default: null,
		},
		upsertFunction: {
			type: Function,
			default: null,
		},
	});

	const isLoading = ref(false);
	const route = useRoute();

	const rules = computed(() => (props.rules));

	const emit = defineEmits([ 'success', 'error' ]);

	const $v = useVuelidate(rules, props.item);

	const upsert = async () => {

		if(props.upsertFunction) {
			await props.upsertFunction({ isLoading, emit, $v });
			return;
		}

		isLoading.value = true;

		// Validate the form
		$v.value.$touch();

		// If the form is invalid, stop
		if($v.value.$invalid) {

			isLoading.value = false;
			return;
		}

		try {

			// shallow copy the item
			let item = { ...props.item };
			if(props.prepareData) item = await props.prepareData(item);

			const method = props.existing ? 'PUT' : 'POST';

			const upsertEndpoint = props.upsertEndpoint || `/${ props.entity.plural }`;

			const callRoute = props.existing ? `${ upsertEndpoint }/${ route.params.id }` : upsertEndpoint;

			const { data, error } = await useBaseFetch(callRoute, {
				method,
				body: JSON.stringify(item),
			});

			if(error.value) {
				emit('error', error.value);
				usePrettyToast().errorToast(error.value);
				isLoading.value = false;
			}

			if(data.value) {
				// Emit success event
				emit('success', data.value);
				isLoading.value = false;
			}

		} catch(error) {
			console.error(error);
			emit('error', error);
			usePrettyToast().errorToast(error);
			isLoading.value = false;
		}
	};

	const validateEditor = () => {
		$v.value.$touch();
		return !$v.value.$invalid;
	};

	defineExpose({
		validateEditor,
		upsert,
	});

</script>

<style lang="sass" scoped>
	.base-editor-form
		min-width: 0

		.editor-area
			min-width: 0

	.properties
		min-width: 100%
		max-width: 100%
		border-left: 1px solid var(--bs-border-color)

		@media (min-width: $md)
			min-width: 300px
			max-width: 300px

		@media (min-width: $xl)
			min-width: 350px
			max-width: 350px
</style>