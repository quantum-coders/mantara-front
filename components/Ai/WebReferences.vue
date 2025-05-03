<template>
  <div class="my-2">
    <details
      class="border border-secondary-subtle rounded shadow-sm overflow-hidden"
      @toggle="handleToggle"
    >
      <summary
        class="list-group-item list-group-item-action bg-secondary bg-opacity-10 fw-semibold p-2 d-flex align-items-center cursor-pointer"
      >
        <Icon name="heroicons:magnifying-glass" class="me-2 flex-shrink-0" aria-hidden="true" />

        <span class="me-auto text-truncate">
          Referencias
        </span>

        <Icon
          :name="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
          class="small ms-1 flex-shrink-0"
        />
      </summary>

      <div class="p-2 bg-light-subtle border-top border-secondary-subtle">
        <div v-if="hasReferences" class="mt-2">
          <div class="list-group list-group-flush">
            <a v-for="(ref, index) in references" :key="index"
               :href="ref.url" target="_blank" rel="noopener noreferrer"
               class="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-0 py-1 border-0 bg-transparent">

              <span class="small me-2 text-truncate" :title="ref.title || 'Referencia'">
                {{ truncateText(ref.title || 'Referencia', 60) }}
              </span>

              <span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                 <Icon name="heroicons:arrow-up-right" class="small" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>

        <div v-if="results.timestamp" class="d-flex justify-content-end mt-2">
          <small class="text-muted fst-italic">
            <Icon name="heroicons:clock" class="me-1" aria-hidden="true" />
            {{ formatTimestamp(results.timestamp) }}
          </small>
        </div>
      </div>

    </details>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props (igual que antes)
const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ query: '', results: '', timestamp: null })
  }
});

// --- Estado para controlar el icono de chevron ---
const isOpen = ref(false); // Por defecto está cerrado

// --- Función para manejar el evento toggle ---
const handleToggle = (event) => {
  // event.target se refiere al elemento <details>
  // event.target.open es true si se acaba de abrir, false si se acaba de cerrar
  if (event.target.tagName === 'DETAILS') {
      isOpen.value = event.target.open;
  }
};

// --- Lógica de Referencias (igual que antes) ---
const references = computed(() => {
  if (!props.results || !props.results.results) return [];
  const refs = [];
  const text = props.results.results;
  // Asegurarse de que la regex capture bien las URLs
  const urlPattern = /\[([^\]]+)\]\((https?:\/\/[^\s()]+)\)/g;
  let match;
  while ((match = urlPattern.exec(text)) !== null) {
    refs.push({ title: match[1].trim(), url: match[2].trim() });
  }
  return refs;
});

const hasReferences = computed(() => references.value.length > 0);

// --- Formato de Timestamp (igual que antes) ---
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    // Usar zona horaria de Puebla/México
    const timeZone = 'America/Mexico_City';
    return date.toLocaleString('es-MX', {
      timeZone: timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    try {
      return new Date(timestamp).toLocaleDateString('es-MX');
    } catch {
      return 'Fecha inválida';
    }
  }
};

// --- Truncate (igual que antes) ---
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

</script>
