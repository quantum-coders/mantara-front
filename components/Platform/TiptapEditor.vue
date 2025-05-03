<template>
	<div class="tiptap-wrapper d-flex flex-grow-1 flex-column" v-if="editor">
		<div class="control-group border-bottom p-2">
			<div class="d-flex gap-2">
				<div class="btn-group">
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
						:class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
					>
						<icon name="hugeicons:heading-01" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
						:class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
					>
						<icon name="hugeicons:heading-02" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
						:class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
					>
						<icon name="hugeicons:heading-03" />
					</a>
				</div>

				<div class="btn-group">
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().setParagraph().run()"
						:class="{ 'is-active': editor.isActive('paragraph') }"
					>
						<icon name="hugeicons:paragraph" />
					</a>
				</div>

				<div class="btn-group">
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().toggleBold().run()"
						:class="{ 'is-active': editor.isActive('bold') }"
					>
						<icon name="hugeicons:text-bold" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().toggleItalic().run()"
						:class="{ 'is-active': editor.isActive('italic') }"
					>
						<icon name="hugeicons:text-italic" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().toggleStrike().run()"
						:class="{ 'is-active': editor.isActive('strike') }"
					>
						<icon name="hugeicons:text-strikethrough" />
					</a>
				</div>

				<div class="btn-group">
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().setTextAlign('left').run()"
						:class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
					>
						<icon name="hugeicons:text-align-justify-left" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().setTextAlign('center').run()"
						:class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
					>
						<icon name="hugeicons:text-align-center" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().setTextAlign('right').run()"
						:class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
					>
						<icon name="hugeicons:text-align-justify-right" />
					</a>
					<a
						class="btn btn-sm btn-light"
						@click="editor.chain().focus().setTextAlign('justify').run()"
						:class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
					>
						<icon name="hugeicons:text-align-justify-center" />
					</a>
				</div>
			</div>
		</div>
		<div class="d-flex flex-grow-1">
			<div class="scroll-wrapper p-3">
				<editor-content :editor="editor" />
			</div>
		</div>
	</div>
</template>

<script setup>
	import { Editor, EditorContent } from '@tiptap/vue-3';
	import StarterKit from '@tiptap/starter-kit';

	const editor = ref(null);
	const model = defineModel();

	onMounted(() => {
		editor.value = new Editor({
			extensions: [
				StarterKit,
			],
			content: model.value,
			// update the model
			onUpdate({ editor }) {
				model.value = editor.getHTML();
			},
		});
	});

	onBeforeUnmount(() => {
		editor.value.destroy();
	});
</script>

<style lang="sass">

	.ProseMirror
		outline: none

</style>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

	.tiptap-wrapper
		background: white
		border-radius: 0.25rem

		.btn
			display: flex
			align-items: center
			justify-content: center

			&:not(:last-child)
				border-right: 2px solid var(--bs-border-color)

		*:last-child
			margin-bottom: 0 !important

</style>