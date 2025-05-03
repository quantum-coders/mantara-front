import { required, email } from '@vuelidate/validators';

export default {
	plural: 'users',
	singular: 'user',
	component: 'User',
	title: {
		plural: 'Usuarios',
		singular: 'Usuario',
	},
	actions: {
		new: {
			title: 'Nuevo usuario',
			url: '/dashboard/users/new',
		},
		edit: {
			title: 'Editar usuario',
		},
		delete: {
			confirmation: 'Usuario eliminado exitosamente',
			modal: {
				message: '¿Estás seguro de que deseas eliminar este usuario?',
				warning: '¡Esta acción no se puede deshacer!',
				confirm: 'Sí, eliminar',
				cancel: 'Cancelar',
			},
		},
	},
	default: {
		status: '',
		metas: {},
	},
	validationRules: {
		firstname: { required },
		lastname: { required },
		username: { required, email },
		status: { required },
	},
	fields: [
		{
			title: 'Id',
			field: 'id',
			sort: true,
			tabulator: {
				frozen: true,
				width: 70,
				maxWidth: 70,
			},
		},
		{
			title: 'Usuario',
			field: 'user',
			template: true,
			tabulator: {
			},
		},
		{
			title: 'Acciones',
			field: 'actions',
			template: true,
			tabulator: {
				frozen: true,
				width: 120,
				sortable: false,
				print: false,
			},
		},
	],
};