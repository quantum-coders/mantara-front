<template>
	<platform-title title="Mis Campañas" />
	<section class="my-campaigns d-flex flex-column flex-grow-1">
		<platform-loading :active="loading" />

		<div class="campaigns-wrapper p-3">
			<div class="row">
				<template v-for="c in campaigns" :key="c.id">
					<div class="col-4">
						<router-link
							:to="`/dashboard/campaigns/${c.id}`"
							custom
							v-slot="{ navigate }"
						>
							<div
								class="card card-campaign"
								@click="navigate"
								role="link"
								tabindex="0"
							>
								<h5 class="card-title">{{ c.name }}</h5>
								<p class="card-text"><strong>Cliente:</strong> {{ c.metas.client || 'N/A' }}</p>
								<p class="card-text"><strong>Producto o servicio:</strong> {{ c.metas.productService || 'N/A' }}</p>
							</div>
						</router-link>
					</div>
				</template>
			</div>
		</div>
	</section>
</template>

<script setup>
	const campaigns = ref([]);
	const loading = ref(false);

	const fetchMyCampaigns = async () => {
		const { data } = await useBaseFetch('/users/me/campaigns');
		return data.value.data;
	};

	onMounted(async () => {
		loading.value = true;
		campaigns.value = await fetchMyCampaigns();
		loading.value = false;
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.card-campaign
		padding: 1rem
		margin-bottom: 1rem
		cursor: pointer
		transition: box-shadow 0.3s ease

		&:hover
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)

		.card-text
			margin-bottom: 0
</style>