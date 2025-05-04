const getFullName = (user) => {
	const nicename = `${ user.firstName || '' } ${ user.lastName || '' }`;
	return nicename.trim() || 'No name';
};

export { getFullName };