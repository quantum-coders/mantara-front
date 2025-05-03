<template>
	<div class="d-flex flex-column flex-grow-1" v-if="user">
		<platform-title
			v-if="title !== false"
			:title="props.title || (!isNew ? entity.actions.edit.title : entity.actions.new.title)"
		/>

		<div class="data-wrapper d-flex flex-column flex-grow-1">
			<div class="scroll-wrapper d-flex flex-column">
				<div class="d-flex flex-grow-1">
					<!-- load the editor component dynamically using singular prop -->
					<editor :item="item" :entity="entity" :existing="!isNew" @success="returnToList" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>

	const props = defineProps({
		entity: {
			type: Object,
			required: true,
		},
		item: {
			type: Object,
			required: true,
		},
		title: {
			type: [ String, Boolean ],
			default: '',
		},
		returnLink: {
			type: [ String, null ],
			default: null,
		},
		returnFunction: {
			type: [ Function, null ],
			default: null,
		},
		isNew: {
			type: [ Boolean, null ],
			default: null,
		},
	});

	// import the editor component dynamically using singular prop
	const editor = defineAsyncComponent(() => /* @vite-ignore */ import(`../Editor/${ props.entity.component }.vue`));

	const isNew = computed(() => props.isNew !== null ? props.isNew : useRoute().params.id === 'new');

	const router = useRouter();
	const route = useRoute();

	// if the item does not have id, it is a new item
	if(!route.params.id) {
		useHead({ title: props.entity.actions.edit.title });
	} else {
		useHead({ title: props.entity.actions.new.title });
	}

	const item = reactive(props.item);
	const user = await useAuthUser();

	const returnToList = async () => {

		if(route.params.id === undefined) {
			usePrettyToast().successToast(`Elemento creado`);
		} else {
			usePrettyToast().successToast(`Elemento actualizado`);
		}

		if(props.returnFunction && typeof props.returnFunction === 'function') {
			props.returnFunction();
			return;
		}

		if(props.returnLink) {
			await router.push(props.returnLink);
			return;
		}

		await router.push(`/dashboard/${ props.entity.plural }`);
	};

</script>

<style lang="sass" scoped>
</style>