<template>
	<section class="section-login">
		<div class="form-wrapper d-flex flex-column justify-content-center p-4">

			<div class="login-form-wrapper">
				<template v-if="mode ==='login'">

					<login-form
						:callback="login"
						class="mb-4"
						:dictionary="loginDictionary"
						:error-function="errorFunc"
					>
						<template #post-message>
							<div class="logo">
								<!--<img src="/images/logo.png" alt="MIA">-->
							</div>
							<h3 class="mb-0 text-center text-brand1">Bienvenido</h3>
						</template>
					</login-form>
					<p class="text-center">¿Olvidaste tu contraseña? <a
						href="#"
						@click.prevent="mode = 'forgot'"
					>Recuperala aquí</a></p>
				</template>

				<template v-else-if="mode === 'forgot'">
					<website-forgot @switch="mode = 'login'" />
				</template>
			</div>
		</div>
		<div class="background-wrapper d-flex flex-grow-1">
			<!--<img src="/images/splash.png" alt="">-->
		</div>

	</section>
</template>

<script setup>
	const mode = ref('login');
	useHead({ title: 'MIA - Bienvenido' });
	definePageMeta({ middleware: 'guest' });

	const loginDictionary = {
		email: 'Correo Electrónico',
		password: 'Contraseña',
		start: 'Iniciar la aventura',
	};

	const errorFunc = (error, loginError, loginErrorMessage) => {
		console.log('errorFunc', error);
		loginErrorMessage.value = !!error.value ? error.value.data.frontMessage : '';
		loginError.value = !!error.value;
	};

	const login = async () => {
		await useRouter().push('/dashboard');
	};

</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.section-login
		border-radius: 1rem
		display: flex
		flex-grow: 1
		background: var(--brand1)
		background-size: auto 100%
		margin: 0.5rem
		padding: 1.5rem
		overflow: clip

		.login-background
			position: absolute
			width: auto
			height: 100%
			right: 0
			bottom: 0
			opacity: 0.75

		.form-wrapper
			z-index: 1
			background: var(--bs-body-bg)
			position: absolute
			top: 50%
			left: 50%
			transform: translate(-50%, -50%)
			width: 80%
			height: 80%
			border-radius: 0.5rem

			@media (min-width: $md)
				position: relative
				top: auto
				left: auto
				height: auto
				transform: none
				max-width: 50%
				width: 600px
				flex-shrink: 0

			.logo
				text-align: center
				margin-bottom: 1rem

				img
					width: 250px
					height: auto

			.login-form-wrapper
				width: 90%
				max-width: 400px
				margin: 0 auto

		.background-wrapper
			display: flex
			flex-grow: 1
			justify-content: center
			align-items: center

			img
				width: 100%
				height: 70%
				object-fit: contain
				object-position: center
				border-radius: 0.5rem
</style>