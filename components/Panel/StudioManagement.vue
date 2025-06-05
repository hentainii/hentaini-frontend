<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon color="blue" class="mr-3" size="32">
                mdi-camera-outline
              </v-icon>
              Studio Management
            </h1>
            <p class="text-subtitle-1 grey--text">
              Manage animation studios and their producer relationships
            </p>
          </div>
          <v-btn
            color="primary"
            large
            @click="openCreateStudioDialog"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            New Studio
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" elevation="2">
          <v-card-text>
            <v-icon color="blue" size="40" class="mb-2">
              mdi-camera-outline
            </v-icon>
            <h3 class="text-h5 font-weight-bold">
              {{ totalStudios }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Total Studios
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" elevation="2">
          <v-card-text>
            <v-icon color="orange" size="40" class="mb-2">
              mdi-office-building
            </v-icon>
            <h3 class="text-h5 font-weight-bold">
              {{ totalProducers }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Total Producers
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" elevation="2">
          <v-card-text>
            <v-icon color="red" size="40" class="mb-2">
              mdi-alert-circle-outline
            </v-icon>
            <h3 class="text-h5 font-weight-bold">
              {{ studiosWithoutProducer }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Without Producer
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" elevation="2">
          <v-card-text>
            <v-icon color="green" size="40" class="mb-2">
              mdi-link-variant
            </v-icon>
            <h3 class="text-h5 font-weight-bold">
              {{ linkedStudios }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Linked Studios
            </p>
          </v-card-text>
        </v-card>
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

    <!-- Filters and Search -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Search studios..."
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          clearable
          @input="debouncedSearch"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedProducerFilter"
          :items="producerFilterOptions"
          label="Filter by Producer"
          outlined
          dense
          clearable
          @change="filterByProducer"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedStatusFilter"
          :items="statusFilterOptions"
          label="Filter by Status"
          outlined
          dense
          clearable
          @change="filterByStatus"
        />
      </v-col>
    </v-row>

    <!-- Studios Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="tableHeaders"
        :items="studios"
        :loading="loading"
        :items-per-page="25"
        class="elevation-0"
        :search="searchQuery"
      >
        <!-- Studio Name -->
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <v-img
                v-if="item.logo"
                :src="item.logo.url"
                :alt="item.name"
              />
              <v-icon v-else color="blue">
                mdi-camera-outline
              </v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">
                {{ item.name }}
              </div>
              <div class="text-caption grey--text">
                ID: {{ item.id }}
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
            No Producer
          </v-chip>
        </template>

        <!-- Series Count -->
        <template #[`item.seriesCount`]="{ item }">
          <v-chip small color="blue" text-color="white">
            {{ item.seriesCount || 0 }} series
          </v-chip>
        </template>

        <!-- Actions -->
        <template #[`item.actions`]="{ item }">
          <v-btn
            icon
            color="primary"
            @click="editStudio(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            color="orange"
            @click="linkProducer(item)"
          >
            <v-icon>mdi-link-variant</v-icon>
          </v-btn>
          <v-btn
            icon
            color="red"
            @click="deleteStudio(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Studio Dialog -->
    <v-dialog v-model="studioDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingStudio ? 'Edit Studio' : 'Create New Studio' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="studioForm" v-model="validStudioForm">
            <v-text-field
              v-model="studioForm.name"
              label="Studio Name"
              outlined
              dense
              :rules="[v => !!v || 'Name is required']"
              required
            />
            <v-textarea
              v-model="studioForm.description"
              label="Description"
              outlined
              dense
              rows="3"
            />
            <v-autocomplete
              v-model="studioForm.producers"
              :items="allProducers"
              item-text="name"
              item-value="id"
              label="Select Producers"
              outlined
              dense
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
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey darken-1" text @click="closeStudioDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!validStudioForm"
            @click="saveStudio"
          >
            {{ editingStudio ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Link Producer Dialog -->
    <v-dialog v-model="linkDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">Link Producer to {{ selectedStudio?.name }}</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedProducersToLink"
            :items="allProducers"
            item-text="name"
            item-value="id"
            label="Select Producers"
            outlined
            dense
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
          <v-btn color="grey darken-1" text @click="closeLinkDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveLinkProducer"
          >
            Link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Delete Studio
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ studioToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey darken-1" text @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'StudioManagement',
  data () {
    return {
      loading: false,
      loadingProducers: false,
      saving: false,
      deleting: false,
      searchQuery: '',
      searchTimeout: null,
      selectedProducerFilter: null,
      selectedStatusFilter: null,

      // Dialogs
      studioDialog: false,
      linkDialog: false,
      deleteDialog: false,

      // Forms
      validStudioForm: false,
      editingStudio: null,
      selectedStudio: null,
      studioToDelete: null,
      selectedProducersToLink: [],

      studioForm: {
        name: '',
        description: '',
        producers: []
      },

      // Alert system
      alert: {
        show: false,
        type: 'info',
        message: ''
      },

      // Table
      tableHeaders: [
        { text: 'Studio', value: 'name', sortable: true },
        { text: 'Producer(s)', value: 'producer', sortable: false },
        { text: 'Series', value: 'seriesCount', sortable: true },
        { text: 'Created', value: 'createdAt', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
    studios () {
      return this.$store.state.studios.studios || []
    },
    allProducers () {
      return this.$store.state.studios.producers || []
    },
    totalStudios () {
      return this.studios.length
    },
    totalProducers () {
      return this.allProducers.length
    },
    studiosWithoutProducer () {
      return this.studios.filter(studio => !studio.producers || studio.producers.length === 0).length
    },
    linkedStudios () {
      return this.studios.filter(studio => studio.producers && studio.producers.length > 0).length
    },
    producerFilterOptions () {
      const options = [{ text: 'All Producers', value: null }]
      this.allProducers.forEach((producer) => {
        options.push({ text: producer.name, value: producer.id })
      })
      options.push({ text: 'No Producer', value: 'none' })
      return options
    },
    statusFilterOptions () {
      return [
        { text: 'All Studios', value: null },
        { text: 'With Producer', value: 'linked' },
        { text: 'Without Producer', value: 'unlinked' }
      ]
    },
    debouncedSearch () {
      return () => {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          this.loadStudios()
        }, 500)
      }
    }
  },
  async mounted () {
    await this.loadData()
  },
  methods: {
    async loadData () {
      this.loading = true
      await Promise.all([
        this.loadStudios(),
        this.loadProducers()
      ])
      this.loading = false
    },

    async loadStudios () {
      try {
        const payload = {
          token: this.$store.state.auth.token,
          search: this.searchQuery
        }

        if (this.selectedProducerFilter === 'none') {
          // Filtrar studios sin producer se manejará en el frontend
        } else if (this.selectedProducerFilter) {
          payload.producerId = this.selectedProducerFilter
        }

        await this.$store.dispatch('studios/getStudios', payload)
      } catch (error) {
        console.error('Error loading studios:', error)
        this.showAlert('error', 'Error loading studios')
      }
    },

    async loadProducers () {
      try {
        this.loadingProducers = true
        await this.$store.dispatch('studios/getProducers', {
          token: this.$store.state.auth.token
        })
      } catch (error) {
        console.error('Error loading producers:', error)
        this.showAlert('error', 'Error loading producers')
      } finally {
        this.loadingProducers = false
      }
    },

    filterByProducer () {
      this.loadStudios()
    },

    filterByStatus () {
      // Esta filtración se puede hacer en el computed o aquí
      this.loadStudios()
    },

    openCreateStudioDialog () {
      this.editingStudio = null
      this.studioForm = {
        name: '',
        description: '',
        producers: []
      }
      this.studioDialog = true
    },

    editStudio (studio) {
      this.editingStudio = studio
      this.studioForm = {
        name: studio.name || '',
        description: studio.description || '',
        producers: studio.producers ? studio.producers.map(p => p.id) : []
      }
      this.studioDialog = true
    },

    async saveStudio () {
      if (!this.$refs.studioForm.validate()) { return }

      try {
        this.saving = true
        const payload = {
          token: this.$store.state.auth.token,
          studioData: {
            name: this.studioForm.name,
            description: this.studioForm.description,
            producers: this.studioForm.producers
          }
        }

        if (this.editingStudio) {
          payload.id = this.editingStudio.id
          await this.$store.dispatch('studios/updateStudio', payload)
          this.showAlert('success', 'Studio updated successfully')
        } else {
          await this.$store.dispatch('studios/createStudio', payload)
          this.showAlert('success', 'Studio created successfully')
        }

        this.closeStudioDialog()
        await this.loadStudios()
      } catch (error) {
        console.error('Error saving studio:', error)
        this.showAlert('error', 'Error saving studio')
      } finally {
        this.saving = false
      }
    },

    closeStudioDialog () {
      this.studioDialog = false
      this.editingStudio = null
      this.$refs.studioForm?.reset()
    },

    linkProducer (studio) {
      this.selectedStudio = studio
      this.selectedProducersToLink = studio.producers ? studio.producers.map(p => p.id) : []
      this.linkDialog = true
    },

    async saveLinkProducer () {
      try {
        this.saving = true
        await this.$store.dispatch('studios/updateStudio', {
          id: this.selectedStudio.id,
          token: this.$store.state.auth.token,
          studioData: {
            producers: this.selectedProducersToLink
          }
        })

        this.showAlert('success', 'Producer linked successfully')
        this.closeLinkDialog()
        await this.loadStudios()
      } catch (error) {
        console.error('Error linking producer:', error)
        this.showAlert('error', 'Error linking producer')
      } finally {
        this.saving = false
      }
    },

    closeLinkDialog () {
      this.linkDialog = false
      this.selectedStudio = null
      this.selectedProducersToLink = []
    },

    deleteStudio (studio) {
      this.studioToDelete = studio
      this.deleteDialog = true
    },

    async confirmDelete () {
      try {
        this.deleting = true
        await this.$store.dispatch('studios/deleteStudio', {
          id: this.studioToDelete.id,
          token: this.$store.state.auth.token
        })

        this.showAlert('success', 'Studio deleted successfully')
        this.deleteDialog = false
        this.studioToDelete = null
        await this.loadStudios()
      } catch (error) {
        console.error('Error deleting studio:', error)
        this.showAlert('error', 'Error deleting studio')
      } finally {
        this.deleting = false
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
.v-card {
  border-radius: 12px;
}

.v-data-table >>> .v-data-table__wrapper {
  border-radius: 12px;
}

.v-chip {
  border-radius: 8px;
}
</style>
