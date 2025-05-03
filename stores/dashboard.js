import { defineStore } from 'pinia';
export const useDashboard = defineStore('dashboard', () => {

	const sidebarCollapsed = ref(false);
	const title = ref('New Project');
	const menu = ref([]);
	const user = useAuthUser();

	return {
		menu,
		title,
		sidebarCollapsed,
	};
});