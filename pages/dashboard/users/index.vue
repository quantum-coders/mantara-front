<template>
	<platform-index-screen :entity="entity" endpoint="/users">
		<template #role="{ item }">
			<span>{{ getPrettyRole(item.role) }}</span>
		</template>
		<template #user="{ item }">
			<div class="d-flex align-items-center flex-nowrap gap-2">
				<img
					class="avatar"
					:src="`${ useRuntimeConfig().public.apiURL }/users/${ item.id }/avatar`"
					:alt="getFullName(item)"
				>
				<div class="text-truncate">
					<p class="mb-0 text-truncate">{{ getFullName(item) }}</p>
					<p class="small mb-0 text-truncate">{{ item.email }}</p>
				</div>
			</div>
		</template>
	</platform-index-screen>
</template>

<script setup>
	import entity from './entity';
	import { getFullName } from '~/utils/user.utils';
	import { getPrettyRole } from '~/assets/data/dictionaries';
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>
	.avatar
		width: 50px
		height: 50px
		border-radius: 50%
</style>