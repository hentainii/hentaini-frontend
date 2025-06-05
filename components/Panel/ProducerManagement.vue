<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon color="orange" class="mr-3" size="32">
                mdi-office-building
              </v-icon>
              Producer Management
            </h1>
            <p class="text-subtitle-1 grey--text">
              Manage production companies and their studio relationships
            </p>
          </div>
          <v-btn
            color="primary"
            large
            @click="openCreateProducerDialog"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            New Producer
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
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
            <v-icon color="blue" size="40" class="mb-2">
              mdi-camera-outline
            </v-icon>
            <h3 class="text-h5 font-weight-bold">
              {{ totalLinkedStudios }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Linked Studios
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center" elevation="2">
          <v-card-text>
            <v-icon color="green" size="40" class="mb-2">
              mdi-television-play
            </v-icon>
            <h3 class="text-h5 font-weight-bold">
              {{ totalSeries }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Total Series
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
              {{ producersWithoutStudios }}
            </h3>
            <p class="text-body-2 grey--text mb-0">
              Without Studios
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
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Search producers..."
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          clearable
          @input="debouncedSearch"
        />
      </v-col>
      <v-col cols="12" md="6">
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

    <!-- Producers Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="tableHeaders"
        :items="producers"
        :loading="loading"
        :items-per-page="25"
        class="elevation-0"
        :search="searchQuery"
      >
        <!-- Producer Name -->
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <v-img
                v-if="item.logo"
                :src="item.logo.url"
                :alt="item.name"
              />
              <v-icon v-else color="orange">
                mdi-office-building
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

        <!-- Studios -->
        <template #[`item.studios`]="{ item }">
          <div v-if="item.studios && item.studios.length > 0">
            <v-chip
              v-for="studio in item.studios.slice(0, 3)"
              :key="studio.id"
              small
              color="blue"
              text-color="white"
              class="mr-1 mb-1"
            >
              <v-icon left x-small>
                mdi-camera-outline
              </v-icon>
              {{ studio.name }}
            </v-chip>
            <v-chip
              v-if="item.studios.length > 3"
              small
              color="grey"
              text-color="white"
              class="mr-1 mb-1"
            >
              +{{ item.studios.length - 3 }} more
            </v-chip>
          </div>
          <v-chip v-else small color="red" text-color="white">
            <v-icon left x-small>
              mdi-alert-circle
            </v-icon>
            No Studios
          </v-chip>
        </template>

        <!-- Studios Count -->
        <template #[`item.studiosCount`]="{ item }">
          <v-chip small color="blue" text-color="white">
            {{ item.studiosCount || 0 }} studios
          </v-chip>
        </template>

        <!-- Series Count -->
        <template #[`item.seriesCount`]="{ item }">
          <v-chip small color="green" text-color="white">
            {{ item.seriesCount || 0 }} series
          </v-chip>
        </template>

        <!-- Actions -->
        <template #[`item.actions`]="{ item }">
          <v-btn
            icon
            color="primary"
            @click="editProducer(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            color="blue"
            @click="viewStudios(item)"
          >
            <v-icon>mdi-camera-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            color="red"
            @click="deleteProducer(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Producer Dialog -->
    <v-dialog v-model="producerDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingProducer ? 'Edit Producer' : 'Create New Producer' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="producerForm" v-model="validProducerForm">
            <v-text-field
              v-model="producerForm.name"
              label="Producer Name"
              outlined
              dense
              :rules="[v => !!v || 'Name is required']"
              required
            />
            <v-textarea
              v-model="producerForm.description"
              label="Description"
              outlined
              dense
              rows="3"
            />
            <v-text-field
              v-model="producerForm.website"
              label="Website"
              outlined
              dense
              type="url"
            />
            <v-text-field
              v-model="producerForm.founded"
              label="Founded Year"
              outlined
              dense
              type="number"
              min="1900"
              :max="new Date().getFullYear()"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey darken-1" text @click="closeProducerDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!validProducerForm"
            @click="saveProducer"
          >
            {{ editingProducer ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Studios Dialog -->
    <v-dialog v-model="studiosDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Studios from {{ selectedProducer?.name }}</span>
          <v-spacer />
          <v-btn icon @click="studiosDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row v-if="selectedProducer && selectedProducer.studios && selectedProducer.studios.length > 0">
            <v-col
              v-for="studio in selectedProducer.studios"
              :key="studio.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card outlined class="mb-2">
                <v-card-text class="pb-2">
                  <div class="d-flex align-center">
                    <v-avatar size="24" class="mr-2">
                      <v-icon color="blue">
                        mdi-camera-outline
                      </v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">
                        {{ studio.name }}
                      </div>
                      <div class="text-caption grey--text">
                        {{ studio.seriesCount || 0 }} series
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey lighten-1">
              mdi-camera-off-outline
            </v-icon>
            <h3 class="mt-4 grey--text">
              No studios found
            </h3>
            <p class="grey--text">
              This producer has no studios assigned yet.
            </p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Delete Producer
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ producerToDelete?.name }}"? This action cannot be undone and will unlink all associated studios.
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
  name: 'ProducerManagement',
  data () {
    return {
      loading: false,
      saving: false,
      deleting: false,
      searchQuery: '',
      searchTimeout: null,
      selectedStatusFilter: null,

      // Dialogs
      producerDialog: false,
      studiosDialog: false,
      deleteDialog: false,

      // Forms
      validProducerForm: false,
      editingProducer: null,
      selectedProducer: null,
      producerToDelete: null,

      producerForm: {
        name: '',
        description: '',
        website: '',
        founded: null
      },

      // Alert system
      alert: {
        show: false,
        type: 'info',
        message: ''
      },

      // Table
      tableHeaders: [
        { text: 'Producer', value: 'name', sortable: true },
        { text: 'Studios', value: 'studios', sortable: false },
        { text: 'Studios Count', value: 'studiosCount', sortable: true },
        { text: 'Series Count', value: 'seriesCount', sortable: true },
        { text: 'Created', value: 'createdAt', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
    producers () {
      return this.$store.state.studios.producers || []
    },
    totalProducers () {
      return this.producers.length
    },
    totalLinkedStudios () {
      return this.producers.reduce((sum, producer) => sum + (producer.studiosCount || 0), 0)
    },
    totalSeries () {
      return this.producers.reduce((sum, producer) => sum + (producer.seriesCount || 0), 0)
    },
    producersWithoutStudios () {
      return this.producers.filter(producer => !producer.studios || producer.studios.length === 0).length
    },
    statusFilterOptions () {
      return [
        { text: 'All Producers', value: null },
        { text: 'With Studios', value: 'with_studios' },
        { text: 'Without Studios', value: 'without_studios' }
      ]
    },
    debouncedSearch () {
      return () => {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          this.loadProducers()
        }, 500)
      }
    }
  },
  async mounted () {
    await this.loadProducers()
  },
  methods: {
    async loadProducers () {
      try {
        this.loading = true
        const payload = {
          token: this.$store.state.auth.token,
          search: this.searchQuery
        }

        await this.$store.dispatch('studios/getProducers', payload)
      } catch (error) {
        console.error('Error loading producers:', error)
        this.showAlert('error', 'Error loading producers')
      } finally {
        this.loading = false
      }
    },

    filterByStatus () {
      // La filtración por estado se puede hacer en el computed del datatable
      this.loadProducers()
    },

    openCreateProducerDialog () {
      this.editingProducer = null
      this.producerForm = {
        name: '',
        description: '',
        website: '',
        founded: null
      }
      this.producerDialog = true
    },

    editProducer (producer) {
      this.editingProducer = producer
      this.producerForm = {
        name: producer.name || '',
        description: producer.description || '',
        website: producer.website || '',
        founded: producer.founded || null
      }
      this.producerDialog = true
    },

    async saveProducer () {
      if (!this.$refs.producerForm.validate()) { return }

      try {
        this.saving = true
        const payload = {
          token: this.$store.state.auth.token,
          producerData: {
            name: this.producerForm.name,
            description: this.producerForm.description,
            website: this.producerForm.website,
            founded: this.producerForm.founded
          }
        }

        if (this.editingProducer) {
          payload.id = this.editingProducer.id
          await this.$store.dispatch('studios/updateProducer', payload)
          this.showAlert('success', 'Producer updated successfully')
        } else {
          await this.$store.dispatch('studios/createProducer', payload)
          this.showAlert('success', 'Producer created successfully')
        }

        this.closeProducerDialog()
        await this.loadProducers()
      } catch (error) {
        console.error('Error saving producer:', error)
        this.showAlert('error', 'Error saving producer')
      } finally {
        this.saving = false
      }
    },

    closeProducerDialog () {
      this.producerDialog = false
      this.editingProducer = null
      this.$refs.producerForm?.reset()
    },

    viewStudios (producer) {
      this.selectedProducer = producer
      this.studiosDialog = true
    },

    deleteProducer (producer) {
      this.producerToDelete = producer
      this.deleteDialog = true
    },

    async confirmDelete () {
      try {
        this.deleting = true
        await this.$store.dispatch('studios/deleteProducer', {
          id: this.producerToDelete.id,
          token: this.$store.state.auth.token
        })

        this.showAlert('success', 'Producer deleted successfully')
        this.deleteDialog = false
        this.producerToDelete = null
        await this.loadProducers()
      } catch (error) {
        console.error('Error deleting producer:', error)
        this.showAlert('error', 'Error deleting producer')
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
