<template>
	<editor-base :entity="entity" :item="item" :rules="rules" :existing="existing" @success="emit('success')">
		<template #default="{ $v, item }">
			<div class="block d-flex flex-grow-1 flex-column" v-if="mode === 'personal-information'">
				<div class="d-flex gap-4 align-items-start">
					<platform-file-upload
						class="avatar-uploader flex-shrink-0"
						accept="image/jpeg,image/png"
						@update="uploadAvatar"
						:is-loading="avatarLoading"
					>
						<template #default>
							<img v-if="temporalAvatarUrl" :src="temporalAvatarUrl" alt="">
							<img
								v-else-if="!item.id && initials"
								:src="`https://ui-avatars.com/api/?name=${ initials }&size=128`"
								alt=""
							>
							<img
								v-else-if="item.id"
								:src="`${ config.public.apiURL }/users/${ item.id }/avatar`"
								alt=""
							>
							<span
								v-else
								class="fs-7 p-2 text-center lh-1 no-pointer-events"
							>Suelta el archivo</span>
						</template>
						<template #overlay>
							<span class="fs-7 p-2 text-center lh-1 no-pointer-events">Suelta el archivo</span>
						</template>
					</platform-file-upload>

					<div class="flex-grow-1">
						<div class="row">
							<div class="col-12 col-md-6">
								<!-- Field for name -->
								<div class="mb-3">
									<platform-form-label for="name" label="Nombre" required />
									<input
										v-model="item.firstname"
										type="text"
										class="form-control"
										:class="{ 'is-invalid': $v.firstname.$error }"
										id="name"
									/>
									<div class="invalid-feedback">Agrega un nombre</div>
								</div>
							</div>

							<div class="col-12 col-md-6">
								<!-- Last name -->
								<div class="mb-3">
									<label for="last_name" class="form-label">
										Apellido <span class="text-danger">*</span>
									</label>
									<input
										v-model="item.lastname"
										type="text"
										class="form-control"
										:class="{ 'is-invalid': $v.lastname.$error }"
										id="last_name"
									/>
									<div class="invalid-feedback">Agrega un apellido</div>
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-12 col-md-12">
								<!-- Email -->
								<div class="mb-3">
									<label for="email" class="form-label">
										Email <span class="text-danger">*</span>
									</label>
									<input
										type="email"
										class="form-control"
										:class="{ 'is-invalid': $v.username.$error }"
										id="email"
										v-model="item.username"
									/>
									<div class="invalid-feedback">Agrega un email válido</div>
								</div>
							</div>
						</div>

					</div>
				</div>

				<!-- Password -->
				<div class="mb-3">
					<label for="password" class="form-label">Contraseña</label>
					<platform-eyed-input
						id="password"
						v-model="item.password"
					/>
				</div>
			</div>
		</template>
		<template #properties="{ $v, item }">


			<!-- Status (select) -->
			<div class="mb-3">
				<label for="status" class="form-label">
					Estado
					<span class="text-danger">*</span></label>
				<select
					class="form-select w-100"
					id="status"
					v-model="item.status"
					:class="{ 'is-invalid': $v.status.$error }"
					:disabled="user.id === item.id"
				>
					<option value="">Selecciona un estado</option>
					<option value="Active">Activo</option>
					<option value="Inactive">Inactivo</option>
				</select>
				<div class="invalid-feedback">Por favor selecciona un estado</div>
			</div>
		</template>
	</editor-base>
</template>

<script setup>
	import { roles } from '~/assets/data/dictionaries';

	const user = useAuthUser();
	const config = useRuntimeConfig();
	const mode = ref('personal-information');
	const emit = defineEmits([ 'success' ]);

	const avatarLoading = ref(false);
	const temporalAvatarUrl = ref(null);

	// computed initials from firstname and lastname
	const initials = computed(() => {
		if(props.item.firstname && props.item.lastname) {
			return `${ props.item.firstname } ${ props.item.lastname }`;
		}
	});

	const props = defineProps({
		entity: {
			type: Object,
			required: true,
		},
		item: {
			type: Object,
			required: true,
		},
		existing: {
			type: Boolean,
			default: false,
		},
	});
	const rules = props.entity.validationRules;

	const uploadAvatar = async (files) => {

		avatarLoading.value = true;

		if(files.length) {
			// Create new form data
			const formData = new FormData();
			formData.append('file', files[0]);
			// Call upload api endpoint
			const { data, error } = await useBaseFetch('/upload', {
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			temporalAvatarUrl.value = data.value.data.url;
			props.item.metas.idAvatar = data.value.data.id;

			usePrettyToast().successToast('Archivo cargado exitosamente');
		}

		avatarLoading.value = false;
	};
</script>

<style lang="sass" scoped>
	.avatar-uploader
		width: 150px
		aspect-ratio: 1
		border: 1px solid var(--bs-gray-300)
		border-radius: 50%

		:deep(.drop-zone)
			aspect-ratio: 1
			padding: 0.5rem
			border-radius: 50%

		:deep(.file-overlay)
			border-radius: 50%

		img
			width: 100%
			height: auto
			border-radius: 50%
			object-fit: cover
</style>