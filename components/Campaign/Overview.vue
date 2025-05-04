<template>
	<div class="campaign-header">
		<div class="card border-0 bg-light mb-4">
			<div class="row g-0">
				<div class="col-md-4">
					<div class="position-relative h-100">
						<img
							:src="project?.coverImage || '/images/default-project-cover.jpg'"
							class="img-fluid rounded-start h-100 w-100 object-fit-cover"
							alt="Project cover"
							style="min-height: 250px;"
						>
						<div class="position-absolute bottom-0 start-0 p-3 w-100 bg-dark bg-opacity-75 text-white">
							<span class="badge" :class="getStatusBadgeClass">{{ getStatusLabel }}</span>
							<h4 class="mt-2">{{ project?.name }}</h4>
						</div>
					</div>
				</div>
				<div class="col-md-8">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h5 class="card-title">Detalles del proyecto</h5>
							<div>
								<button class="btn btn-outline-primary me-2" @click="openEditDialog">
									<i class="bi bi-pencil-square"></i> Editar
								</button>
								<button class="btn btn-primary">
									<i class="bi bi-play-fill"></i> Deploy
								</button>
							</div>
						</div>

						<div class="row mb-3">
							<div class="col-md-6">
								<p class="text-muted mb-1">Descripción:</p>
								<p>{{ project?.description || 'Sin descripción' }}</p>
							</div>
							<div class="col-md-6">
								<p class="text-muted mb-1">Red:</p>
								<p>{{ formatNetworkName(project?.network) }}</p>
							</div>
						</div>

						<div class="row">
							<div class="col-md-4">
								<p class="text-muted mb-1">Creado:</p>
								<p>{{ formatDate(project?.createdAt) }}</p>
							</div>
							<div class="col-md-4">
								<p class="text-muted mb-1">Última actualización:</p>
								<p>{{ formatDate(project?.updatedAt) }}</p>
							</div>
							<div class="col-md-4">
								<p class="text-muted mb-1">Estado de build:</p>
								<span class="badge" :class="getBuildStatusBadgeClass">
									{{ formatBuildStatus(project?.buildStatus) }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Sección de contratos -->
		<div class="card mb-4">
			<div class="card-header d-flex justify-content-between align-items-center">
				<h5 class="mb-0">Contratos</h5>
				<button class="btn btn-sm btn-primary">
					<i class="bi bi-plus"></i> Añadir contrato
				</button>
			</div>
			<div class="card-body">
				<div v-if="project?.contracts?.length > 0">
					<div class="list-group">
						<div v-for="contract in project.contracts" :key="contract.id" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
							<div>
								<h6 class="mb-1">{{ contract.name }}</h6>
								<p class="mb-1 text-muted small">{{ contract.contractType }}</p>
								<span v-if="contract.isMain" class="badge bg-success">Principal</span>
							</div>
							<div>
								<button class="btn btn-sm btn-outline-secondary me-2">
									<i class="bi bi-code-slash"></i> Editar código
								</button>
								<button class="btn btn-sm btn-outline-info">
									<i class="bi bi-info-circle"></i> Detalles
								</button>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="text-center py-4">
					<p class="text-muted">No hay contratos en este proyecto</p>
					<button class="btn btn-primary">
						<i class="bi bi-plus"></i> Crear primer contrato
					</button>
				</div>
			</div>
		</div>

		<!-- Sección de despliegues -->
		<div class="card mb-4">
			<div class="card-header">
				<h5 class="mb-0">Despliegues</h5>
			</div>
			<div class="card-body">
				<div v-if="project?.deployments?.length > 0">
					<div class="table-responsive">
						<table class="table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Contrato</th>
									<th>Dirección</th>
									<th>Red</th>
									<th>Fecha</th>
									<th>Estado</th>
									<th>Acciones</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="deployment in project.deployments" :key="deployment.id">
									<!-- Datos de despliegue aquí cuando haya -->
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div v-else class="text-center py-4">
					<p class="text-muted">No hay despliegues para este proyecto</p>
					<button class="btn btn-primary">
						<i class="bi bi-rocket-takeoff"></i> Desplegar contrato
					</button>
				</div>
			</div>
		</div>

		<!-- Métricas y estadísticas -->
		<div class="row">
			<div class="col-md-4">
				<div class="card">
					<div class="card-body text-center">
						<h6 class="card-subtitle mb-2 text-muted">Tests pasados</h6>
						<h2 class="card-title">{{ project?.testsPassed || 0 }}</h2>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="card">
					<div class="card-body text-center">
						<h6 class="card-subtitle mb-2 text-muted">Tests fallidos</h6>
						<h2 class="card-title">{{ project?.testsFailed || 0 }}</h2>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="card">
					<div class="card-body text-center">
						<h6 class="card-subtitle mb-2 text-muted">Verificado</h6>
						<h2 class="card-title">
							<i v-if="project?.verified" class="bi bi-check-circle text-success"></i>
							<i v-else class="bi bi-x-circle text-danger"></i>
						</h2>
					</div>
				</div>
			</div>
		</div>

		<!-- Dialog para editar el proyecto -->
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
								<label for="campaignName" class="form-label">Nombre del proyecto</label>
								<input
									type="text"
									class="form-control"
									id="campaignName"
									v-model="editForm.name"
									placeholder="Ingrese el nombre del proyecto"
									required
								>
							</div>

							<div class="mb-3">
								<label for="campaignDescription" class="form-label">Descripción</label>
								<textarea
									class="form-control"
									id="campaignDescription"
									v-model="editForm.description"
									placeholder="Describe el objetivo del proyecto"
									rows="3"
								></textarea>
							</div>

							<div class="mb-3">
								<label for="campaignStatus" class="form-label">Estado</label>
								<select class="form-select" id="campaignStatus" v-model="editForm.status">
									<option value="Draft">Borrador</option>
									<option value="Active">Activo</option>
									<option value="Paused">Pausado</option>
									<option value="Completed">Completado</option>
								</select>
							</div>

							<div class="mb-3">
								<label for="campaignNetwork" class="form-label">Red</label>
								<select class="form-select" id="campaignNetwork" v-model="editForm.network">
									<option value="mantle_testnet">Mantle Testnet</option>
									<option value="mantle_mainnet">Mantle Mainnet</option>
									<option value="ethereum_mainnet">Ethereum Mainnet</option>
									<option value="sepolia">Sepolia Testnet</option>
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
								<div class="form-text">Ingresa la URL de una imagen para la portada del proyecto</div>
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
	import { ref, computed, watch } from 'vue';
	import { storeToRefs } from 'pinia';
	import { useRoute } from 'vue-router';

	const route = useRoute();
	const projectStore = useProject();
	const editDialogRef = ref(null);
	const isSaving = ref(false);
	const { project } = storeToRefs(projectStore);

	// Formulario de edición
	const editForm = ref({
		name: '',
		description: '',
		status: 'Draft',
		coverImage: '',
		network: 'mantle_testnet'
	});

	// Actualizar el formulario cuando cambie el proyecto
	watch(project, (newProject) => {
		if(newProject) {
			editForm.value = {
				name: newProject.name || '',
				description: newProject.description || '',
				status: newProject.status || 'Draft',
				coverImage: newProject.coverImage || '',
				network: newProject.network || 'mantle_testnet'
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

	// Formatear nombre de red
	const formatNetworkName = (network) => {
		if (!network) return 'No especificada';

		const networkMap = {
			'mantle_testnet': 'Mantle Testnet',
			'mantle_mainnet': 'Mantle Mainnet',
			'ethereum_mainnet': 'Ethereum Mainnet',
			'sepolia': 'Sepolia Testnet'
		};

		return networkMap[network] || network;
	};

	// Formatear estado de build
	const formatBuildStatus = (status) => {
		if (!status) return 'No iniciado';

		const statusMap = {
			'NotStarted': 'No iniciado',
			'Building': 'En construcción',
			'Success': 'Exitoso',
			'Failed': 'Fallido'
		};

		return statusMap[status] || status;
	};

	// Obtener clase de badge para el estado
	const getStatusBadgeClass = computed(() => {
		if (!project.value?.status) return 'bg-secondary';

		const statusClasses = {
			'Draft': 'bg-secondary',
			'Active': 'bg-success',
			'Paused': 'bg-warning',
			'Completed': 'bg-info'
		};

		return statusClasses[project.value.status] || 'bg-secondary';
	});

	// Obtener clase de badge para el estado de build
	const getBuildStatusBadgeClass = computed(() => {
		if (!project.value?.buildStatus) return 'bg-secondary';

		const statusClasses = {
			'NotStarted': 'bg-secondary',
			'Building': 'bg-warning',
			'Success': 'bg-success',
			'Failed': 'bg-danger'
		};

		return statusClasses[project.value.buildStatus] || 'bg-secondary';
	});

	// Obtener etiqueta para el estado
	const getStatusLabel = computed(() => {
		if (!project.value?.status) return 'Desconocido';

		const statusLabels = {
			'Draft': 'Borrador',
			'Active': 'Activo',
			'Paused': 'Pausado',
			'Completed': 'Completado'
		};

		return statusLabels[project.value.status] || project.value.status;
	});

	// Abrir el diálogo de edición
	const openEditDialog = () => {
		if(editDialogRef.value) {
			editDialogRef.value.open();
		}
	};

	// Guardar los cambios del proyecto
	const saveCampaign = async (closeDialog) => {
		isSaving.value = true;

		try {
			// Preparar los datos a enviar
			const projectData = {
				...editForm.value,
			};

			// Llamada a la API para actualizar el proyecto
			const { data, error } = await useBaseFetch(
				`/users/me/projects/${ route.params.id }`,
				{
					method: 'PUT',
					body: projectData,
				},
			);

			if(error.value) {
				throw new Error('Error al actualizar el proyecto');
			}

			// Actualizar los datos en el store
			projectStore.project = {
				...projectStore.project,
				...projectData,
				updatedAt: new Date().toISOString(),
			};

			// Mostrar mensaje de éxito
			usePrettyToast().successToast('Proyecto actualizado correctamente');

			// Cerrar el diálogo
			if(closeDialog) {
				closeDialog();
			}
		} catch(error) {
			console.error('Error al actualizar el proyecto:', error);
			usePrettyToast().errorToast('Error al guardar los cambios del proyecto');
		} finally {
			isSaving.value = false;
		}
	};
</script>

<style scoped>
	.object-fit-cover {
		object-fit: cover;
	}
</style>