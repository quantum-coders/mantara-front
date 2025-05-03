<template>
	<div class="register">
		<platform-loading :active="loading" />

		<div class="logo">
			<svgo-logo class="mb-4" />
		</div>
		<h4 class="title-font text-center mb-0">Olvidaste tu contraseña</h4>
		<p class="text-center">Introduce tu correo electrónico y te enviaremos una liga para recuperarla</p>

		<template v-if="!success">
			<div class="form">
				<transition-slide @after-leave="loginErrorMessage = ''">
					<div class="alert alert-danger alert-dismissible mb-0" v-if="loginError">
						<button type="button" class="btn-close" aria-label="Close" @click="loginError = false" />
						{{ loginErrorMessage }}
					</div>
				</transition-slide>

				<!-- email -->
				<div class="form-group form-floating mb-3">
					<input
						type="email"
						class="form-control styled"
						:class="{ 'is-invalid': $v.email.$error }"
						id="elite-register-form-email"
						autocomplete="email"
						v-model="register.email"
						placeholder="Correo electrónico"
					>
					<label
						for="elite-register-form-email"
						class="form-label"
					>Correo electrónico</label>

					<div class="invalid-feedback">
						<p v-if="$v.email.required.$invalid">El correo electrónico es requerido.</p>
						<p v-else-if="$v.email.email.$invalid">El correo electrónico no es válido.</p>
					</div>
				</div>
			</div>
			<p>
				<button
					type="submit"
					class="btn btn-primary w-100"
					@click="handleSubmit"
				>Recuperar acceso
				</button>
			</p>
		</template>
		<div class="success" v-else>
			<h4 class="title-font">Listo</h4>
			<p>Un correo electrónico ha sido enviado a tu cuenta de correo con instrucciones para recuperar acceso a tu cuenta de MIA.</p>
			<p class="mb-0 fs-7 text-muted">Si no encuentras el correo electrónico, revisa tu bandeja de spam, es posible que se haya filtrado.</p>
		</div>

		<p class="text-center">¿Ya tienes una cuenta?
			<a
				href="#"
				@click.prevent="emit('switch')"
			>Inicia sesión aquí</a>
		</p>
	</div>

</template>

<script setup>
	import { required, sameAs, email, minLength } from '@vuelidate/validators';
	import { useVuelidate } from '@vuelidate/core';

	const { login } = useAuth();
	const emit = defineEmits([ 'switch', 'success' ]);

	const loading = ref(false);
	const loginError = ref(false);
	const loginErrorMessage = ref('');
	const success = ref(false);

	const register = reactive({
		email: '',
	});

	const rules = {
		email: { required, email },
	};

	const $v = useVuelidate(rules, register);

	const handleSubmit = async () => {
		$v.value.$touch();
		if(!!$v.value.$invalid) return;

		loading.value = true;

		const { error } = await useBaseFetch('/users/recover', {
			method: 'POST',
			body: JSON.stringify(register),
		});

		if(!!error.value) {
			console.error(error.value);
			loginErrorMessage.value = error.value.data.message;

			loginError.value = true;
			loading.value = false;
			return;
		}

		success.value = true;

		loading.value = false;
		loginError.value = false;
		loginErrorMessage.value = '';

		// reset form
		$v.value.$reset();

		register.email = '';
		emit('success');
	};

</script>-