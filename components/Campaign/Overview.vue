<template>
	<div class="campaign-header">
		<div class="card border-0 bg-light mb-4">
			<div class="row g-0">
				<!-- Columna de imagen de portada -->
<!--				<div class="col-md-4 campaign-cover-container">
					<div v-if="campaign?.coverImage" class="h-100 position-relative">
						<img
							:src="campaign.coverImage" class="img-fluid rounded-start h-100 w-100 object-fit-cover"
							alt="Imagen de portada de la campaña" style="max-height: 300px;"
						>
						<div class="position-absolute bottom-0 start-0 bg-dark bg-opacity-50 text-white p-2 rounded-end">
							<span class="badge bg-primary me-2">{{ campaign?.status || 'Estado' }}</span>
							<span class="small">ID: {{ campaign?.uid || '-' }}</span>
						</div>
					</div>
					<div
						v-else
						class="bg-secondary bg-opacity-10 d-flex justify-content-center align-items-center h-100 rounded-start"
						style="min-height: 250px;"
					>
						<div class="text-center text-muted">
							<Icon name="ph:image" class="fs-1" />
							<p class="mt-2">Sin imagen de portada</p>
						</div>
					</div>
				</div>-->

				<!-- Columna de información de la campaña -->
<!--				<div class="col-md-8">
					<div class="card-body h-100 d-flex flex-column">
						<div class="d-flex justify-content-between align-items-start mb-3">
							<div>
								<h1 class="card-title h3 mb-1">{{ campaign?.name || 'Cargando campaña...' }}</h1>
								<p class="card-subtitle text-muted">
									<Icon name="uil:calendar-alt" class="me-1" />
									Creada: {{ formatDate(campaign?.created) }}
								</p>
							</div>
							<div class="btn-group">
								<button class="btn btn-outline-primary btn-sm" @click="openEditDialog">
									<Icon name="uil:pen" class="me-1" />
									Editar
								</button>
								<button class="btn btn-outline-secondary btn-sm">
									<Icon name="uil:ellipsis-h" />
								</button>
							</div>
						</div>

						<p class="card-text mb-3">{{ campaign?.description || 'Sin descripción' }}</p>

						<div class="mt-auto">
							<div class="row g-2">
								<div class="col-md-6">
									<div class="d-flex align-items-center">
										<div class="bg-primary bg-opacity-10 p-2 rounded me-3">
											<Icon name="uil:schedule" class="text-primary" />
										</div>
										<div>
											<small class="text-muted d-block">Última actualización</small>
											<span>{{ formatDate(campaign?.modified) }}</span>
										</div>
									</div>
								</div>

								<div class="col-md-6">
									<div class="d-flex align-items-center">
										<div class="bg-success bg-opacity-10 p-2 rounded me-3">
											<Icon name="uil:chart" class="text-success" />
										</div>
										<div>
											<small class="text-muted d-block">Nivel de Presupuesto</small>
											<span>{{ campaign?.metas?.budgetOutline?.estimatedTotalTier || 'No definido' }}</span>
										</div>
									</div>
								</div>
							</div>

							<div class="progress mt-4" style="height: 6px;">
								<div
									class="progress-bar"
									role="progressbar"
									style="width: 70%;"
									aria-valuenow="70"
									aria-valuemin="0"
									aria-valuemax="100"
								></div>
							</div>
							<div class="d-flex justify-content-between mt-1">
								<small class="text-muted">Progreso de la campaña</small>
								<small class="text-muted">70%</small>
							</div>
						</div>
					</div>
				</div>-->
			</div>
		</div>

		<!-- Dialog para editar la campaña -->
		<platform-dialog ref="editDialogRef">
			<template #default="{ close }">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Editar Proyecto</h5>
						<button type="button" class="btn-close" @click="close" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="saveCampaign(close)">
							<div class="mb-3">
								<label for="campaignName" class="form-label">Nombre de la campaña</label>
								<input
									type="text"
									class="form-control"
									id="campaignName"
									v-model="editForm.name"
									placeholder="Ingrese el nombre de la campaña"
									required
								>
							</div>

							<div class="mb-3">
								<label for="campaignDescription" class="form-label">Descripción</label>
								<textarea
									class="form-control"
									id="campaignDescription"
									v-model="editForm.description"
									placeholder="Describe el objetivo de la campaña"
									rows="3"
								></textarea>
							</div>

							<div class="mb-3">
								<label for="campaignStatus" class="form-label">Estado</label>
								<select class="form-select" id="campaignStatus" v-model="editForm.status">
									<option value="draft">Borrador</option>
									<option value="active">Activa</option>
									<option value="paused">Pausada</option>
									<option value="completed">Completada</option>
								</select>
							</div>

							<div class="mb-3">
								<label for="campaignCoverImage" class="form-label">URL de imagen de portada</label>
								<input
									type="url"
									class="form-control"
									id="campaignCoverImage"
									v-model="editForm.coverImage"
									placeholder="https://ejemplo.com/imagen.jpg"
								>
								<div class="form-text">Ingresa la URL de una imagen para la portada de la campaña</div>
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
						<button
							type="button"
							class="btn btn-primary"
							@click="saveCampaign(close)"
							:disabled="isSaving"
						>
							<span
								v-if="isSaving"
								class="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Guardar cambios
						</button>
					</div>
				</div>
			</template>
		</platform-dialog>
	</div>
</template>
<script setup>
	const route = useRoute();
	const campaignStore = useProject();
	const editDialogRef = ref(null);
	const isSaving = ref(false);

	// Se obtiene la campaña directamente del store
	const campaign = computed(() => campaignStore.campaign);

	// Formulario de edición
	const editForm = ref({
		name: '',
		description: '',
		status: 'draft',
		coverImage: '',
	});

	// Actualizar el formulario cuando cambie la campaña
	watch(campaign, (newCampaign) => {
		if(newCampaign) {
			editForm.value = {
				name: newCampaign.name || '',
				description: newCampaign.description || '',
				status: newCampaign.status || 'draft',
				coverImage: newCampaign.coverImage || '',
			};
		}
	}, { immediate: true });

	// Función para formatear fechas
	const formatDate = (dateString) => {
		if(!dateString) return 'No disponible';

		const date = new Date(dateString);
		return new Intl.DateTimeFormat('es-MX', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(date);
	};

	// Abrir el diálogo de edición
	const openEditDialog = () => {
		if(editDialogRef.value) {
			editDialogRef.value.open();
		}
	};

	// Guardar los cambios de la campaña
	const saveCampaign = async (closeDialog) => {
		isSaving.value = true;

		try {
			// Preparar los datos a enviar
			const campaignData = {
				...editForm.value,
			};

			// Llamada a la API para actualizar la campaña
			const { data, error } = await useBaseFetch(
				`/users/me/projects/${ route.params.id }`,
				{
					method: 'PUT',
					body: campaignData,
				},
			);

			if(error.value) {
				throw new Error('Error al actualizar la campaña');
			}

			// Actualizar los datos en el store
			campaignStore.campaign = {
				...campaignStore.campaign,
				...campaignData,
				modified: new Date().toISOString(),
			};

			// Mostrar mensaje de éxito
			usePrettyToast().successToast('Proyecto actualizada correctamente');

			// Cerrar el diálogo
			if(closeDialog) {
				closeDialog();
			}
		} catch(error) {
			console.error('Error al actualizar la campaña:', error);
			usePrettyToast().errorToast('Error al guardar los cambios de la campaña');
		} finally {
			isSaving.value = false;
		}
	};
</script>
