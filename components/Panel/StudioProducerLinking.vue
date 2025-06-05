<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon color="purple" class="mr-3" size="32">
                mdi-link-variant
              </v-icon>
              Studio-Producer Linking
            </h1>
            <p class="text-subtitle-1 grey--text">
              Visual management of studio and producer relationships
            </p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              color="blue"
              outlined
              :loading="loading"
              @click="refreshData"
            >
              <v-icon left>
                mdi-refresh
              </v-icon>
              Refresh
            </v-btn>
            <v-btn
              color="primary"
              @click="showBulkLinkDialog = true"
            >
              <v-icon left>
                mdi-link-plus
              </v-icon>
              Bulk Link
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="blue lighten-4" class="text-center">
          <v-card-text>
            <v-icon color="blue darken-2" size="32" class="mb-2">
              mdi-camera-outline
            </v-icon>
            <h3 class="text-h6 blue--text text--darken-2">
              {{ studios.length }}
            </h3>
            <p class="text-body-2 mb-0">
              Total Studios
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="orange lighten-4" class="text-center">
          <v-card-text>
            <v-icon color="orange darken-2" size="32" class="mb-2">
              mdi-office-building
            </v-icon>
            <h3 class="text-h6 orange--text text--darken-2">
              {{ producers.length }}
            </h3>
            <p class="text-body-2 mb-0">
              Total Producers
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="green lighten-4" class="text-center">
          <v-card-text>
            <v-icon color="green darken-2" size="32" class="mb-2">
              mdi-link-variant
            </v-icon>
            <h3 class="text-h6 green--text text--darken-2">
              {{ linkedCount }}
            </h3>
            <p class="text-body-2 mb-0">
              Linked Studios
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="red lighten-4" class="text-center">
          <v-card-text>
            <v-icon color="red darken-2" size="32" class="mb-2">
              mdi-alert-circle-outline
            </v-icon>
            <h3 class="text-h6 red--text text--darken-2">
              {{ unlinkedCount }}
            </h3>
            <p class="text-body-2 mb-0">
              Unlinked Studios
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Search studios or producers..."
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          clearable
          @input="filterItems"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Filter by Status"
          outlined
          dense
          clearable
          @change="filterItems"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="viewMode"
          :items="viewModeOptions"
          label="View Mode"
          outlined
          dense
        />
      </v-col>
    </v-row>

    <!-- Alert Messages -->
    <v-row v-if="alert.show" class="mb-4">
      <v-col cols="12">
        <v-alert
          :type="alert.type"
          dismissible
          @input="alert.show = false"
        >
          {{ alert.message }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading" class="justify-center py-8">
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-row>

    <!-- Cards View -->
    <template v-else-if="viewMode === 'cards'">
      <!-- Producers with their Studios -->
      <v-row>
        <v-col
          v-for="producer in filteredProducers"
          :key="producer.id"
          cols="12"
          lg="6"
          xl="4"
        >
          <v-card class="mb-4" elevation="3">
            <v-card-title class="orange darken-1 white--text">
              <v-icon color="white" class="mr-2">
                mdi-office-building
              </v-icon>
              {{ producer.name }}
              <v-spacer />
              <v-chip small color="white" text-color="orange darken-1">
                {{ getStudiosForProducer(producer.id).length }} studios
              </v-chip>
            </v-card-title>

            <v-card-text class="pa-3">
              <div v-if="getStudiosForProducer(producer.id).length > 0" class="studios-grid">
                <v-chip
                  v-for="studio in getStudiosForProducer(producer.id)"
                  :key="studio.id"
                  small
                  color="blue"
                  text-color="white"
                  class="mr-1 mb-1"
                  @click="editStudioLink(studio)"
                >
                  <v-icon left x-small>
                    mdi-camera-outline
                  </v-icon>
                  {{ studio.name }}
                </v-chip>
              </div>
              <div v-else class="text-center py-4">
                <v-icon color="grey lighten-1" size="48">
                  mdi-camera-off-outline
                </v-icon>
                <p class="text-body-2 grey--text mt-2 mb-0">
                  No studios linked
                </p>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                small
                color="primary"
                text
                @click="linkStudioToProducer(producer)"
              >
                <v-icon left small>
                  mdi-link-plus
                </v-icon>
                Link Studio
              </v-btn>
              <v-spacer />
              <v-btn
                small
                color="orange"
                text
                @click="viewProducerDetails(producer)"
              >
                <v-icon left small>
                  mdi-eye
                </v-icon>
                Details
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Unlinked Studios -->
      <v-row v-if="unlinkedStudios.length > 0">
        <v-col cols="12">
          <v-card elevation="2" class="red lighten-5">
            <v-card-title class="red darken-1 white--text">
              <v-icon color="white" class="mr-2">
                mdi-alert-circle-outline
              </v-icon>
              Unlinked Studios
              <v-spacer />
              <v-chip small color="white" text-color="red darken-1">
                {{ unlinkedStudios.length }} studios
              </v-chip>
            </v-card-title>

            <v-card-text class="pa-3">
              <v-row>
                <v-col
                  v-for="studio in unlinkedStudios"
                  :key="studio.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card outlined hover @click="quickLinkStudio(studio)">
                    <v-card-text class="text-center pa-3">
                      <v-avatar size="32" class="mb-2">
                        <v-icon color="blue">
                          mdi-camera-outline
                        </v-icon>
                      </v-avatar>
                      <div class="font-weight-medium">
                        {{ studio.name }}
                      </div>
                      <div class="text-caption grey--text">
                        {{ studio.seriesCount || 0 }} series
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Table View -->
    <template v-else>
      <v-card elevation="2">
        <v-data-table
          :headers="tableHeaders"
          :items="filteredStudios"
          :loading="loading"
          :items-per-page="25"
          class="elevation-0"
        >
          <!-- Studio Name -->
          <template #[`item.studio`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-3">
                <v-icon color="blue">
                  mdi-camera-outline
                </v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">
                  {{ item.name }}
                </div>
                <div class="text-caption grey--text">
                  {{ item.seriesCount || 0 }} series
                </div>
              </div>
            </div>
          </template>

          <!-- Producer -->
          <template #[`item.producer`]="{ item }">
            <div v-if="item.producers && item.producers.length > 0">
              <v-chip
                v-for="producer in item.producers"
                :key="producer.id"
                small
                color="orange"
                text-color="white"
                class="mr-1 mb-1"
              >
                <v-icon left x-small>
                  mdi-office-building
                </v-icon>
                {{ producer.name }}
              </v-chip>
            </div>
            <v-chip v-else small color="red" text-color="white">
              <v-icon left x-small>
                mdi-alert-circle
              </v-icon>
              Not Linked
            </v-chip>
          </template>

          <!-- Status -->
          <template #[`item.status`]="{ item }">
            <v-chip
              small
              :color="item.producers && item.producers.length > 0 ? 'green' : 'red'"
              text-color="white"
            >
              {{ item.producers && item.producers.length > 0 ? 'Linked' : 'Unlinked' }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon
              small
              color="primary"
              @click="editStudioLink(item)"
            >
              <v-icon>mdi-link-variant</v-icon>
            </v-btn>
            <v-btn
              icon
              small
              color="orange"
              @click="quickLinkStudio(item)"
            >
              <v-icon>mdi-link-plus</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <!-- Quick Link Dialog -->
    <v-dialog v-model="quickLinkDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">Quick Link: {{ selectedStudio?.name }}</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedProducersForLink"
            :items="producers"
            item-text="name"
            item-value="id"
            label="Select Producer(s)"
            outlined
            multiple
            chips
            deletable-chips
            :loading="loadingProducers"
          >
            <template #selection="{ item }">
              <v-chip small color="orange" text-color="white">
                <v-icon left x-small>
                  mdi-office-building
                </v-icon>
                {{ item.name }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey darken-1" text @click="quickLinkDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveQuickLink"
          >
            Link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk Link Dialog -->
    <v-dialog v-model="showBulkLinkDialog" max-width="700px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">Bulk Link Studios</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="bulkSelectedProducer"
                :items="producers"
                item-text="name"
                item-value="id"
                label="Select Producer"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="bulkSelectedStudios"
                :items="unlinkedStudios"
                item-text="name"
                item-value="id"
                label="Select Studios"
                outlined
                dense
                multiple
                chips
                deletable-chips
              >
                <template #selection="{ item }">
                  <v-chip small color="blue" text-color="white">
                    <v-icon left x-small>
                      mdi-camera-outline
                    </v-icon>
                    {{ item.name }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey darken-1" text @click="showBulkLinkDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!bulkSelectedProducer || !bulkSelectedStudios.length"
            @click="saveBulkLink"
          >
            Link {{ bulkSelectedStudios.length }} Studios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'StudioProducerLinking',
  data () {
    return {
      loading: false,
      loadingProducers: false,
      saving: false,
      searchQuery: '',
      statusFilter: null,
      viewMode: 'cards',

      // Dialogs
      quickLinkDialog: false,
      showBulkLinkDialog: false,

      // Forms
      selectedStudio: null,
      selectedProducersForLink: [],
      bulkSelectedProducer: null,
      bulkSelectedStudios: [],

      // Alert system
      alert: {
        show: false,
        type: 'info',
        message: ''
      },

      // Options
      statusOptions: [
        { text: 'All', value: null },
        { text: 'Linked', value: 'linked' },
        { text: 'Unlinked', value: 'unlinked' }
      ],
      viewModeOptions: [
        { text: 'Cards View', value: 'cards' },
        { text: 'Table View', value: 'table' }
      ],

      // Table headers
      tableHeaders: [
        { text: 'Studio', value: 'studio', sortable: true },
        { text: 'Producer', value: 'producer', sortable: false },
        { text: 'Status', value: 'status', sortable: true },
        { text: 'Series', value: 'seriesCount', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
    studios () {
      return this.$store.state.studios.studios || []
    },
    producers () {
      return this.$store.state.studios.producers || []
    },
    linkedCount () {
      return this.studios.filter(studio => studio.producers && studio.producers.length > 0).length
    },
    unlinkedCount () {
      return this.studios.filter(studio => !studio.producers || studio.producers.length === 0).length
    },
    unlinkedStudios () {
      return this.studios.filter(studio => !studio.producers || studio.producers.length === 0)
    },
    filteredStudios () {
      let filtered = this.studios

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(studio =>
          studio.name.toLowerCase().includes(query) ||
          (studio.producers && studio.producers.some(p => p.name.toLowerCase().includes(query)))
        )
      }

      if (this.statusFilter === 'linked') {
        filtered = filtered.filter(studio => studio.producers && studio.producers.length > 0)
      } else if (this.statusFilter === 'unlinked') {
        filtered = filtered.filter(studio => !studio.producers || studio.producers.length === 0)
      }

      return filtered
    },
    filteredProducers () {
      let filtered = this.producers

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(producer =>
          producer.name.toLowerCase().includes(query) ||
          this.getStudiosForProducer(producer.id).some(s => s.name.toLowerCase().includes(query))
        )
      }

      return filtered
    }
  },
  async mounted () {
    await this.loadData()
  },
  methods: {
    async loadData () {
      this.loading = true
      try {
        await Promise.all([
          this.$store.dispatch('studios/getStudios', {
            token: this.$store.state.auth.token
          }),
          this.$store.dispatch('studios/getProducers', {
            token: this.$store.state.auth.token
          })
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        this.showAlert('error', 'Error loading data')
      } finally {
        this.loading = false
      }
    },

    async refreshData () {
      await this.loadData()
      this.showAlert('success', 'Data refreshed')
    },

    filterItems () {
      // Los filtros se manejan en los computed
    },

    getStudiosForProducer (producerId) {
      return this.studios.filter(studio =>
        studio.producers && studio.producers.some(p => p.id === producerId)
      )
    },

    quickLinkStudio (studio) {
      this.selectedStudio = studio
      this.selectedProducersForLink = studio.producers ? studio.producers.map(p => p.id) : []
      this.quickLinkDialog = true
    },

    editStudioLink (studio) {
      this.quickLinkStudio(studio)
    },

    linkStudioToProducer (producer) {
      // Pre-select the producer and show unlinked studios
      this.bulkSelectedProducer = producer.id
      this.bulkSelectedStudios = []
      this.showBulkLinkDialog = true
    },

    viewProducerDetails (producer) {
      // Navigate to producer details or show details dialog
      this.$router.push(`/panel/producer/${producer.id}`)
    },

    async saveQuickLink () {
      try {
        this.saving = true
        await this.$store.dispatch('studios/updateStudio', {
          id: this.selectedStudio.id,
          token: this.$store.state.auth.token,
          studioData: {
            producers: this.selectedProducersForLink
          }
        })

        this.showAlert('success', 'Studio linked successfully')
        this.quickLinkDialog = false
        await this.loadData()
      } catch (error) {
        console.error('Error linking studio:', error)
        this.showAlert('error', 'Error linking studio')
      } finally {
        this.saving = false
      }
    },

    async saveBulkLink () {
      try {
        this.saving = true

        // Update each selected studio to link with the producer
        const promises = this.bulkSelectedStudios.map((studioId) => {
          const studio = this.studios.find(s => s.id === studioId)
          const currentProducers = studio.producers ? studio.producers.map(p => p.id) : []
          const newProducers = [...new Set([...currentProducers, this.bulkSelectedProducer])]

          return this.$store.dispatch('studios/updateStudio', {
            id: studioId,
            token: this.$store.state.auth.token,
            studioData: {
              producers: newProducers
            }
          })
        })

        await Promise.all(promises)

        this.showAlert('success', `${this.bulkSelectedStudios.length} studios linked successfully`)
        this.showBulkLinkDialog = false
        this.bulkSelectedProducer = null
        this.bulkSelectedStudios = []
        await this.loadData()
      } catch (error) {
        console.error('Error bulk linking studios:', error)
        this.showAlert('error', 'Error bulk linking studios')
      } finally {
        this.saving = false
      }
    },

    showAlert (type, message) {
      this.alert.type = type
      this.alert.message = message
      this.alert.show = true

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.alert.show = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
.studios-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.v-card {
  border-radius: 12px;
}

.v-data-table >>> .v-data-table__wrapper {
  border-radius: 12px;
}

.v-chip {
  border-radius: 8px;
}

.gap-2 {
  gap: 8px;
}
</style>
