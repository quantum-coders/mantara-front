import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAi } from '~/stores/ai';

export const useChat = defineStore('chat', () => {

	const wisMessage = ref(null);
	const chat = ref(null);
	const thread = ref(null);
	const campaignStore = useCampaign();
	/**
	 * Initializes the chat for a specific entity and entity ID.
	 * Fetches the chat and thread data from the server and sets up the chat store.
	 *
	 * @param {string} entity - The type of entity (e.g., 'campaign', 'agent').
	 * @param {string|number|null} idEntity - The ID of the entity to associate with the chat.
	 * @returns {Promise<void>} A promise that resolves when the chat is initialized.
	 */
	const initChat = async (entity, idEntity) => {
		const { data, error } = await useBaseFetch('/users/me/chat', {
			method: 'POST',
			body: { entity, idEntity },
		});

		if(error.value) {
			usePrettyToast().errorToast('Error fetching chat');
		}

		chat.value = data.value.data.chat;
		thread.value = data.value.data.thread;

		// wait 1 second
		await new Promise((resolve) => setTimeout(resolve, 10));
		scrollToBottom(false);
	};

	const addMessage = (message) => {
		// Add a unique ID to the message
		message.uid = uuidv4();

		// Add timestamp to the message
		message.created = new Date().toISOString();
		thread.value.messages.push(message);

		return message;
	};

	const scrollToBottom = (animated = true) => {
		// scroll to the bottom of #thread, animated
		const thread = document.getElementById('thread');
		if(!thread) return;

		if(animated) thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
		else thread.scrollTo({ top: thread.scrollHeight });
	};

	const sendMessage = async (message) => {

		// Create a message for assistant
		const assistantMessage = addMessage({ role: 'assistant', text: '', loading: true });

		// get current url
		const url = useRouter().currentRoute.value.fullPath;

		// Scroll to the bottom of the thread
		scrollToBottom();

		// get authToken from localStorage
		const authToken = localStorage.getItem('authToken');

		const res = await $fetch(`${ useRuntimeConfig().public.apiURL }/ai/message/converse`, {
			method: 'POST',
			body: {
				url: url,
				idChat: chat.value.id,
				idThread: thread.value.id,
				idCampaign: chat.value.idEntity,
				agent: useAi().agent,
				prompt: message,
			},
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${ authToken }`,
			},
			responseType: 'stream',
		});

		assistantMessage.loading = false;

		const reader = res.pipeThrough(new TextDecoderStream()).getReader();
		let buffer = '';

		// Read the chunk of data as we get it
		while(true) {
			const { value, done } = await reader.read();

			if(done) {
				await new Promise((resolve) => setTimeout(resolve, 100));
				scrollToBottom();
				break;
			}

			buffer += value;
			const lines = buffer.split('\n\n');
			buffer = lines.pop();

			console.log('lines:', lines);

			// En useChat.js, modifica la parte relevante del método sendMessage:

			for(let line of lines) {
				const index = thread.value.messages.findIndex((m) => m.uid === assistantMessage.uid);
				if(line === '' && index !== -1) {
					thread.value.messages[index].text += '\n\n';
					continue;
				}

				console.log('line:', line, line.startsWith('\n'), line.startsWith('\n') && index !== -1);
				if(line.startsWith('\n') && index !== -1) thread.value.messages[index].text += '\n ';
				console.log(thread.value.messages[index].text);

				line = line.trim();

				if(line.startsWith('data: ')) {
					line = line.substring(6);

					if(line === '[DONE]') {
						assistantMessage.loading = false;
						scrollToBottom();
						break;
					}

					try {
						const jsonData = JSON.parse(line);

						// Check if we have the expected structure
						if(jsonData.type && jsonData.data && jsonData.data.content) {
							if(index !== -1) thread.value.messages[index].text += jsonData.data.content;
						} else if(jsonData.type === 'complete') {
							// Handle completion message if needed
							assistantMessage.loading = false;

							// Guardar resultados de herramientas si están presentes
							if(jsonData.toolResults && Object.keys(jsonData.toolResults).length > 0) {
								thread.value.messages[index].toolResults = jsonData.toolResults;
							}

							// Si hay un mensaje completo, asegurarse de que se usa
							if(jsonData.fullMessage && thread.value.messages[index].text === '') {
								thread.value.messages[index].text = jsonData.fullMessage;
							}
						} else if(jsonData.type === 'error') {
							console.error('Error from API:', jsonData.error);
							// Handle error if needed
						} else if(jsonData.type === 'tool') {
							// Handle tool results if needed
							console.log('Tool result:', jsonData.data);

							// Guardar los resultados de herramientas individuales para uso posterior
							if(!thread.value.messages[index].toolResults) {
								thread.value.messages[index].toolResults = {};
							}

							if(jsonData.data && jsonData.data.name) {
								thread.value.messages[index].toolResults[jsonData.data.name] = jsonData.data.result;
							}
						} else if(jsonData.type === 'campaign' && jsonData.data) {
							// ——> aquí actualizas la campaña
							// ejemplo con Pinia:
							campaignStore.campaign = jsonData.data;

							console.log('🏷️ Campaña actualizada:', jsonData.data);
						} else if(jsonData.type === 'openai') {
							// …continúa con tu render de contenido…
						}

						scrollToBottom();
					} catch(e) {
						console.error('Error parsing JSON from stream:', e, line);
					}
				}

				// Resto del código sin cambios...
			}
		}
	};

	const openWis = async (messageUid) => {
		wisMessage.value = thread.value.messages.find((m) => m.uid === messageUid);
	};

	const closeWis = () => {
		wisMessage.value = null;
	};

	/// metod to clean all store data
	const cleanStore = () => {
		chat.value = null;
		thread.value = null;
		wisMessage.value = null;
	};

	return {
		chat,
		thread,
		wisMessage,
		initChat,
		addMessage,
		sendMessage,
		openWis,
		closeWis,
		scrollToBottom,
		cleanStore,
	};
});
