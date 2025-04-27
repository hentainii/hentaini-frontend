<template>
  <div class="flex justify-center items-center">
    <!-- Modal Trigger Button -->
    <button
      @click="dialog = true"
      type="button"
      class="bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400"
      :aria-label="t('episode.report.title')"
    >
      <Icon name="mdi-flag" class="w-5 h-5" />
    </button>

    <!-- Modal -->
    <transition name="fade">
      <div
        v-if="dialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeDialog"
        aria-modal="true"
        role="dialog"
      >
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4">
          <!-- Error Alert -->
          <div v-if="error" class="flex items-center bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 rounded px-4 py-2 mt-4 mx-4">
            <Icon name="mdi-alert" class="mr-2 w-5 h-5" />
            <span>{{ t('episode.report.already_reported') }}</span>
          </div>

          <!-- Modal Title -->
          <div class="text-xl font-bold text-primary-600 dark:text-primary-400 px-6 pt-6 pb-2">
            {{ t('episode.report.title') }}
          </div>

          <!-- Form -->
          <div v-if="!sent" class="px-6 pb-2">
            <fieldset class="mb-4">
              <legend class="sr-only">{{ t('episode.report.title') }}</legend>
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="reason" value="broken-players" @change="() => { error = false }" class="accent-primary-600" />
                  <span>{{ t('episode.report.reasons.a') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="reason" value="broken-subs" @change="() => { error = false }" class="accent-primary-600" />
                  <span>{{ t('episode.report.reasons.b') }}</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="reason" value="broken-audio" @change="() => { error = false }" class="accent-primary-600" />
                  <span>{{ t('episode.report.reasons.c') }}</span>
                </label>
              </div>
            </fieldset>
            <div class="mb-2">
              <label :for="'details-textarea'" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('episode.report.details') }}</label>
              <textarea
                id="details-textarea"
                v-model="details"
                rows="3"
                maxlength="200"
                class="w-full rounded border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-800 dark:border-gray-700 p-2 resize-none"
                :aria-label="t('episode.report.details')"
              ></textarea>
              <div v-if="details && details.length > 200" class="text-xs text-red-500 mt-1">{{ rules[0](details) }}</div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ t('episode.report.info') }}</p>
          </div>

          <!-- Success Alert -->
          <div v-else class="px-6 pb-2">
            <div class="flex items-center bg-green-100 text-green-700 border border-green-300 dark:bg-green-900 dark:text-green-200 rounded px-4 py-2 mt-4">
              <Icon name="mdi-check" class="mr-2 w-5 h-5" />
              <span>{{ t('episode.report.success') }}</span>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 my-2" />

          <!-- Actions -->
          <div class="flex justify-end gap-2 px-6 pb-6">
            <button
              v-if="!sent"
              @click="reportEpisode"
              type="button"
              class="bg-primary-600 hover:bg-primary-700 text-white rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {{ t('episode.report.submit') }}
            </button>
            <button
              v-else
              @click="closeDialog"
              type="button"
              class="bg-primary-600 hover:bg-primary-700 text-white rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  episode: {
    type: Object,
    required: true
  }
})

const dialog = ref(false)
const reason = ref(null)
const details = ref("")
const error = ref(false)
const errorMessage = ref("")
const sent = ref(false)
const rules = [
  v => (v && v.length <= 200) || 'Details must be less than 200 characters'
]

const { t } = useI18n()
const config = useRuntimeConfig()
const store = useUserStore()

function closeDialog() {
  dialog.value = false
  sent.value = false
  reason.value = null
  details.value = ""
  error.value = false
}

async function reportEpisode() {
  if (!reason.value) {
    error.value = true
    errorMessage.value = 'Please select a reason'
    return
  }
  if (details.value && details.value.length > 200) {
    error.value = true
    errorMessage.value = rules[0](details.value)
    return
  }
  const qs = (await import('qs')).default
  const query = qs.stringify({
    filters: {
      episode: props.episode.id,
      reason: reason.value,
      fixed: false
    }
  }, {
    encodeValuesOnly: true
  })
  // GET reports (check if already reported)
  const { data: reportsData, error: getError } = await useFetch(
    () => `${config.public.API_STRAPI_ENDPOINT}reports?${query}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      key: `report-check-${props.episode.id}-${reason.value}`,
      pick: ['data']
    }
  )
  const reports = reportsData.value?.data || []
  if (reports.length > 9) {
    error.value = true
    errorMessage.value = 'This episode has reached the maximum number of reports'
    return
  }
  // POST report
  const { error: postError } = await useFetch(
    () => `${config.public.API_STRAPI_ENDPOINT}reports`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        data: {
          reason: reason.value,
          details: details.value,
          episode: props.episode.id,
          user: store?.id || null
        }
      },
      key: `report-send-${props.episode.id}-${reason.value}`
    }
  )
  sent.value = true
  error.value = false
  reason.value = null
  details.value = ""
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
