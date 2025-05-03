<template>
	<platform-dialog ref="dialogRef" :closeDialog="closeDialog" class="p-0">
		<template #default="{ close }">
			<platform-loading :active="isLoading" />
			<div class="campaign-dialog">
				<platform-title title="Crear nueva campaña">
					<template #actions>
						<div class="d-flex gap-2">
							<button type="button" class="btn btn-sm btn-secondary" @click="close">Cancelar</button>
							<button
								type="submit"
								class="btn btn-sm btn-primary"
								:disabled="isLoading"
								@click="submitForm"
							>
								{{ isLoading ? 'Creando...' : 'Crear Campaña' }}
							</button>
						</div>
					</template>
				</platform-title>

				<form @submit.prevent="submitForm" class="p-3">
					<div class="form-group">
						<platform-form-label for="name" label="Título de campaña" required />
						<input
							type="text"
							id="name"
							class="form-control"
							:class="{ 'is-invalid': $v.name.$error }"
							v-model="formData.name"
							@blur="$v.name.$touch()"
						/>
						<div class="invalid-feedback" v-if="$v.name.$error">
							{{ $v.name.$errors[0].$message }}
						</div>
					</div>

					<div class="form-group">
						<platform-form-label for="client" label="Cliente" required />
						<input
							type="text"
							id="client"
							class="form-control"
							:class="{ 'is-invalid': $v.client.$error }"
							v-model="formData.client"
							@blur="$v.client.$touch()"
						/>
						<div class="invalid-feedback" v-if="$v.client.$error">
							{{ $v.client.$errors[0].$message }}
						</div>
					</div>

					<div class="form-group">
						<platform-form-label for="productService" label="Producto o servicio" required />
						<input
							type="text"
							id="productService"
							class="form-control"
							:class="{ 'is-invalid': $v.productService.$error }"
							v-model="formData.productService"
							@blur="$v.productService.$touch()"
						/>
						<div class="invalid-feedback" v-if="$v.productService.$error">
							{{ $v.productService.$errors[0].$message }}
						</div>
					</div>

					<div class="form-group">
						<platform-form-label for="description" label="Objetivo de la campaña" required />
						<textarea
							id="description"
							class="form-control"
							:class="{ 'is-invalid': $v.description.$error }"
							v-model="formData.description"
							rows="3"
							@blur="$v.description.$touch()"
						></textarea>
						<div class="invalid-feedback" v-if="$v.description.$error">
							{{ $v.description.$errors[0].$message }}
						</div>
					</div>
				</form>
			</div>
		</template>
	</platform-dialog>
</template>

<script setup>
	import { ref, reactive, computed } from 'vue';
	import { useVuelidate } from '@vuelidate/core';
	import { required, minLength, helpers } from '@vuelidate/validators';

	const chat = useChat();
	const props = defineProps({
		closeDialog: {
			type: Function,
			default: null,
		},
	});

	const dialogRef = ref(null);
	const isLoading = ref(false);

	// Form data
	const formData = reactive({
		name: '',
		client: '',
		productService: '',
		description: '',
	});

	// Custom error messages
	const errorMessages = {
		nameRequired: 'El título de la campaña es obligatorio',
		nameMinLength: 'El título de la campaña debe tener al menos 3 caracteres',
		clientRequired: 'El cliente es obligatorio',
		productServiceRequired: 'El producto o servicio es obligatorio',
		descriptionRequired: 'El objetivo de la campaña es obligatorio',
		descriptionMinLength: 'El objetivo debe tener al menos 10 caracteres',
	};

	// Create custom validators with error messages
	const customRequired = helpers.withMessage(
		(prop) => {
			const fieldMap = {
				name: errorMessages.nameRequired,
				client: errorMessages.clientRequired,
				productService: errorMessages.productServiceRequired,
				description: errorMessages.descriptionRequired,
			};
			return fieldMap[prop.path] || 'Este campo es obligatorio';
		},
		required,
	);

	const customMinLength = (min, errorKey) => helpers.withMessage(
		errorMessages[errorKey] || `Este campo debe tener al menos ${ min } caracteres`,
		minLength(min),
	);

	// Validation rules
	const rules = computed(() => ({
		name: {
			required: customRequired,
			minLength: customMinLength(3, 'nameMinLength'),
		},
		client: {
			required: customRequired,
		},
		productService: {
			required: customRequired,
		},
		description: {
			required: customRequired,
			minLength: customMinLength(10, 'descriptionMinLength'),
		},
	}));

	const $v = useVuelidate(rules, formData);

	// Open the dialog
	const openDialog = () => {
		dialogRef.value.openDialog();
	};

	// Submit the form
	const submitForm = async () => {
		const result = await $v.value.$validate();

		if(!result) return;

		try {
			isLoading.value = true;

			// Prepare form data for submission
			const submissionData = {
				...formData,
			};

			// Call API to create campaign
			const res = await useBaseFetch('/campaigns', {
				method: 'POST',
				body: submissionData,
			});

			if(res.error.value) {
				usePrettyToast().error('Error al crear la campaña. Por favor, inténtalo de nuevo.');
			}

			// Handle successful creation
			if(res.data.value && res.data.value.data.id) {
				// Close the dialog
				dialogRef.value.closeDialog();
				chat.cleanStore();
				// Navigate to the newly created campaign
				await useRouter().push(`/dashboard/campaigns/${ res.data.value.data.id }`);
			}
		} catch(error) {
			console.error('Error creating campaign:', error);
			usePrettyToast().error('Error al crear la campaña. Por favor, inténtalo de nuevo.');
		} finally {
			isLoading.value = false;
		}
	};

	defineExpose({ openDialog });
</script>

<style lang="sass" scoped>
	.campaign-dialog
		min-width: 500px
		width: 800px

	.form-group
		margin-bottom: 1rem
</style>