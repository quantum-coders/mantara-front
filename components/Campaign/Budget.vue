<template>
	<div class="container py-4">
		<h1 class="h3 mb-4">Esquema de Presupuesto</h1>

		<div v-if="isLoading" class="text-center my-5">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
		</div>

		<div v-else-if="budgetData">
			<div class="card mb-4 shadow-sm">
				<div class="card-body">
					<div class="d-flex justify-content-between align-items-center mb-3">
						<div>
							<h2 class="h4 mb-2">Resumen de Presupuesto</h2>
							<p class="mb-0">
								Nivel estimado:
								<span class="badge bg-primary ms-2">{{ budgetData.estimatedTotalTier }}</span>
							</p>
						</div>
						<button
							class="btn btn-primary"
							@click="openEditModal"
						>
							<Icon name="uil:edit" class="me-2" />
							Editar
						</button>
					</div>

					<div class="mt-3">
						<p>{{ budgetData.notes }}</p>
					</div>
				</div>
			</div>

			<div class="card shadow-sm">
				<div class="card-body">
					<h2 class="h4 mb-4">Rangos de Asignación Sugeridos</h2>

					<div class="table-responsive">
						<table class="table table-striped table-hover">
							<thead>
								<tr>
									<th>Categoría</th>
									<th>Rango %</th>
									<th>Distribución Visual</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in allocationData" :key="item.category">
									<td>{{ getCategoryLabel(item.category) }}</td>
									<td>
										<span class="badge bg-info text-dark">{{ item.range }}</span>
									</td>
									<td class="w-50">
										<div class="progress">
											<div
												class="progress-bar bg-primary"
												:style="{ width: getAllocationWidth(item.range) }"
												role="progressbar"
												:aria-valuenow="getAllocationPercentage(item.range)"
												aria-valuemin="0"
												aria-valuemax="100"
											>
												{{ item.range }}
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="text-center py-5">
			<Icon name="uil:file-alt" class="fs-1 text-secondary" />
			<p class="mt-3">No se ha definido el esquema de presupuesto</p>
			<button
				class="btn btn-primary mt-3"
				@click="openEditModal"
			>
				<Icon name="uil:plus" class="me-2" />
				Crear Esquema de Presupuesto
			</button>
		</div>

		<!-- Reemplazando modal de Bootstrap con platform-dialog -->
		<platform-dialog ref="editDialogRef">
			<template #default="{ close }">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							{{ budgetData ? 'Editar' : 'Crear' }} Esquema de Presupuesto
						</h5>
						<button type="button" class="btn-close" @click="close" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<!-- Formulario de edición -->
						<div class="mb-3">
							<label for="estimatedTotalTier" class="form-label">Nivel estimado</label>
							<select class="form-select" id="estimatedTotalTier" v-model="editForm.estimatedTotalTier">
								<option value="Low">Bajo</option>
								<option value="Medium">Medio</option>
								<option value="High">Alto</option>
							</select>
						</div>

						<div class="mb-3">
							<label for="budgetNotes" class="form-label">Notas sobre el presupuesto</label>
							<textarea
								class="form-control"
								id="budgetNotes"
								v-model="editForm.notes"
								rows="3"
								placeholder="Describe los detalles relevantes del presupuesto"
							></textarea>
						</div>

						<h5 class="mt-4 mb-3">Rangos de Asignación</h5>

						<div v-for="(item, key) in categoryFields" :key="key" class="mb-3">
							<label :for="'allocation-'+key" class="form-label">{{ item.label }}</label>
							<input
								type="text"
								class="form-control"
								:id="'allocation-'+key"
								v-model="editForm.suggestedAllocationRanges[key]"
								placeholder="Ej: 10-15%"
							>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
						<button
							type="button"
							class="btn btn-primary"
							@click="saveBudgetOutline(close)"
							:disabled="isSaving"
						>
							<span
								v-if="isSaving"
								class="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Guardar
						</button>
					</div>
				</div>
			</template>
		</platform-dialog>
	</div>
</template>

<script setup>
	const route = useRoute();
	const campaignStore = useCampaign();
	const isLoading = ref(true);
	const isSaving = ref(false);
	const editDialogRef = ref(null);

	// Mapeo de categorías para la visualización
	const categoryFields = {
		creativeProduction: { label: 'Producción Creativa' },
		mediaBuyDigital: { label: 'Compra de Medios Digitales' },
		influencerMarketing: { label: 'Marketing con Influencers' },
		posActivation: { label: 'Activaciones en Puntos de Venta' },
		researchContingency: { label: 'Contingencia e Investigación' },
	};

	// Datos para el formulario de edición
	const editForm = ref({
		estimatedTotalTier: 'Medium',
		notes: '',
		suggestedAllocationRanges: {
			creativeProduction: '',
			mediaBuyDigital: '',
			influencerMarketing: '',
			posActivation: '',
			researchContingency: '',
		},
	});

	// Obtener los datos de budgetOutline del store
	const budgetData = computed(() => {
		if(!campaignStore.campaign || !campaignStore.campaign.metas) return null;
		return campaignStore.campaign.metas.budgetOutline || null;
	});

	// Preparar datos para la tabla de asignación
	const allocationData = computed(() => {
		if(!budgetData.value || !budgetData.value.suggestedAllocationRanges) return [];

		return Object.entries(budgetData.value.suggestedAllocationRanges).map(([ category, range ]) => ({
			category,
			range,
			visualRange: range, // Para la visualización
		}));
	});

	// Inicializar datos al montar el componente
	onMounted(async () => {
		if(!campaignStore.campaign) {
			try {
				await campaignStore.fetchCampaign(route.params.id);
			} catch(error) {
				console.error('Error al obtener los datos de la campaña:', error);
			}
		}
		isLoading.value = false;
	});

	// Vigilar cambios en budgetData para actualizar el formulario
	watch(budgetData, (newVal) => {
		if(newVal) {
			editForm.value.estimatedTotalTier = newVal.estimatedTotalTier || 'Medium';
			editForm.value.notes = newVal.notes || '';

			if(newVal.suggestedAllocationRanges) {
				Object.keys(editForm.value.suggestedAllocationRanges).forEach(key => {
					editForm.value.suggestedAllocationRanges[key] =
						newVal.suggestedAllocationRanges[key] || '';
				});
			}
		}
	}, { immediate: true });

	// Métodos
	const getCategoryLabel = (category) => {
		return categoryFields[category]?.label || category;
	};

	const getAllocationWidth = (range) => {
		// Extraer el valor máximo del rango (ej: de "10-15%" obtener 15)
		const maxValue = range.split('-').pop().replace('%', '');
		return `${ Math.min(parseInt(maxValue, 10) * 2, 100) }%`;
	};

	const getAllocationPercentage = (range) => {
		const maxValue = range.split('-').pop().replace('%', '');
		return Math.min(parseInt(maxValue, 10) * 2, 100);
	};

	const openEditModal = () => {
		// Si no hay datos, inicializar con valores predeterminados
		if(!budgetData.value) {
			editForm.value = {
				estimatedTotalTier: 'Medium',
				notes: '',
				suggestedAllocationRanges: {
					creativeProduction: '20-30%',
					mediaBuyDigital: '30-40%',
					influencerMarketing: '10-15%',
					posActivation: '5-10%',
					researchContingency: '5-10%',
				},
			};
		}

		// Usar el método expuesto por platform-dialog para abrir
		if(editDialogRef.value) {
			editDialogRef.value.open();
		}
	};

	const saveBudgetOutline = async (closeDialog) => {
		isSaving.value = true;

		try {
			// Preparar los datos para enviar al servidor
			const budgetOutlineData = {
				estimatedTotalTier: editForm.value.estimatedTotalTier,
				notes: editForm.value.notes,
				suggestedAllocationRanges: { ...editForm.value.suggestedAllocationRanges },
			};

			// Hacer la petición al servidor para actualizar
			const { data, error } = await useBaseFetch(
				`/users/me/projects/${ route.params.id }/budget-outline`,
				{
					method: 'PUT',
					body: budgetOutlineData,
				},
			);

			if(error.value) {
				throw new Error('Error al guardar el esquema de presupuesto');
			}

			// Actualizar la campaña local con los nuevos datos
			if(!campaignStore.campaign.metas) {
				campaignStore.campaign.metas = {};
			}

			campaignStore.campaign.metas.budgetOutline = budgetOutlineData;

			// Mostrar mensaje de éxito
			usePrettyToast().successToast('Esquema de presupuesto actualizado');

			// Cerrar el diálogo usando la función proporcionada en el slot scope
			if(closeDialog) {
				closeDialog();
			}
		} catch(error) {
			console.error('Error al actualizar el esquema de presupuesto:', error);
			usePrettyToast().errorToast('Error al guardar el esquema de presupuesto');
		} finally {
			isSaving.value = false;
		}
	};
</script>
