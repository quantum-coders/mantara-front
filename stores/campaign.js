import { defineStore } from 'pinia';
export const useCampaign = defineStore('campaign', () => {

	const campaign = ref(null);

	const fetchCampaign = async (id) => {
		const res = await useBaseFetch(`/users/me/projects/${ id }`);

		if(res.error.value) {
			usePrettyToast().errorToast('Error fetching campaign');
		}

		campaign.value = res.data.value.data;
	}

	return {
		campaign,
		fetchCampaign,
	};
});