const getFullName = (user) => {
	const nicename = `${ user.firstname || '' } ${ user.lastname || '' }`;
	return nicename.trim() || 'No name';
};

export { getFullName };