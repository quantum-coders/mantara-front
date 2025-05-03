<template>
	<div class="d-flex flex-grow-1 align-items-stretch justify-content-center flex-column">

		<div class="reset-wrapper">

			<h1>Restablecer tu Contraseña</h1>
			<p>Por favor, introduce una nueva contraseña.</p>
			<form @submit.prevent="submit">
				<div class="mb-3">
					<label for="password" class="form-label">Contraseña</label>
					<input
						v-model="form.password"
						type="password"
						class="form-control"
						id="password"
						required
					>
				</div>
				<div class="mb-3">
					<label for="password_confirmation" class="form-label">Confirmar contraseña</label>
					<input
						v-model="form.password_confirmation"
						type="password"
						class="form-control"
						id="password_confirmation"
						required
					>
				</div>
				<button type="submit" class="btn btn-primary">Restablecer contraseña</button>
			</form>
		</div>

	</div>

</template>

<script setup>
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { required } from '@vuelidate/validators';
	import { useVuelidate } from '@vuelidate/core';

	definePageMeta({ middleware: 'auth', layout: 'dashboard' });
	useHead({ titleTemplate: '%s - MIA' });
	const user = useAuthUser();

	const { errorToast, successToast } = usePrettyToast();
	const router = useRouter();

	const form = ref({
		password: '',
		password_confirmation: '',
	});

	const rules = {
		form: {
			password: { required },
			password_confirmation: { required },
		},
	};

	const v$ = useVuelidate(rules, { form });

	const submit = async () => {
		v$.value.$touch();
		if (v$.value.$error) {
			errorToast('Por favor, rellena todos los campos.');
			return;
		}

		//sent to the api
		const { data, error } = await useBaseFetch('/users/me/profile/password', {
			method: 'PUT',
			body: form.value,
		});

		if (error.value) {
			errorToast(error.message);
			return;
		}

		successToast('Contraseña restablecida correctamente.');
		router.push('/dashboard');

	};
</script>
<style lang="sass" scoped>
	.reset-wrapper
		width: 100%
		max-width: 800px
		margin: 0 auto
		padding: 20px

		border-radius: 5px
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)
		margin-top: 50px
		h1
			font-size: 24px
			margin-bottom: 20px
		form
			button
				margin-top: 20px
</style>