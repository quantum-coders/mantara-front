<template>
	<platform-dialog ref="dialogRef" :closeDialog="closeDialog" class="p-0">
		<template #default="{ close }">
			<platform-loading :active="isLoading" />
			<div class="campaign-dialog">
				<platform-title title="Crear nuevo proyecto">
					<template #actions>
						<div class="d-flex gap-2">
							<button type="button" class="btn btn-sm btn-secondary" @click="close">Cancelar</button>
							<button
								type="submit"
								class="btn btn-sm btn-primary"
								:disabled="isLoading"
								@click="submitForm"
							>
								{{ isLoading ? 'Creando...' : 'Crear Proyecto' }}
							</button>
						</div>
					</template>
				</platform-title>

				<form @submit.prevent="submitForm" class="p-3">
					<div class="form-group">
						<platform-form-label for="name" label="Título de proyecto" required />
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
	});

	// Custom error messages
	const errorMessages = {
		nameRequired: 'El título del proyecto es obligatorio'
	};

	// Create custom validators with error messages
	const customRequired = helpers.withMessage(
		(prop) => {
			const fieldMap = {
				name: errorMessages.nameRequired,
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
			const res = await useBaseFetch('/projects', {
				method: 'POST',
				body: submissionData,
			});

			if(res.error.value) {
				usePrettyToast().error('Error al crear el proyecto. Por favor, inténtalo de nuevo.');
			}

			// Handle successful creation
			if(res.data.value && res.data.value.data.id) {
				// Close the dialog
				dialogRef.value.closeDialog();
				chat.cleanStore();
				// Navigate to the newly created campaign
				await useRouter().push(`/dashboard/projects/${ res.data.value.data.id }`);
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