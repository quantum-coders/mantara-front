import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

export const usePrettyToast = () => {

	const toast = useToast();
	const successToast = (message, position) => {

		toast.success(message, {
			duration: 3000,
			position: position || 'bottom-right',
		});
	};

	const errorToast = (message, position) => {

		toast.error(message, {
			duration: 3000,
			position: position || 'bottom-right',
		});
	};

	const infoToast = (message, position) => {

		toast.info(message, {
			duration: 3000,
			position: position || 'bottom-right',
		});
	};

	const success = (message, position) => {
		successToast(message, position);
	};

	const error = (message, position) => {
		errorToast(message, position);
	};

	const info = (message, position) => {
		infoToast(message, position);
	};

	return {
		successToast,
		errorToast,
		infoToast,
		success,
		error,
		info,
	};
};