import { defineStore } from 'pinia';
export const useProject = defineStore('project', () => {

	const project = ref(null);

	const fetchProject = async (id) => {
		const res = await useBaseFetch(`/users/me/projects/${ id }`);

		if(res.error.value) {
			usePrettyToast().errorToast('Error fetching project');
		}

		project.value = res.data.value.data;
	}

	return {
		project,
		fetchProject,
	};
});