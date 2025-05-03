const roles = {
	'ADMIN': 'Administrador',
	'USER': 'Usuario',
}

const getPrettyRole = (role) => {
	return roles[role] || role;
}

export { roles, getPrettyRole };