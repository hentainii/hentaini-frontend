<template>
  <v-card class="glass-card pa-6 ma-4" elevation="10">
    <v-row>
      <v-col cols="12">
        <v-card-title class="headline font-weight-bold mb-4">
          <v-icon left color="primary">
            mdi-view-list
          </v-icon>
          All Series
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search for Hentai"
            single-line
            outlined
            dense
            hide-details="auto"
            class="search-bar"
            @keyup.enter="getSeries"
          />
        </v-card-title>
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <client-only>
          <v-data-table
            :headers="headers"
            :items="series"
            :page.sync="page"
            :options.sync="options"
            :items-per-page="itemsPerPage"
            hide-default-footer
            class="elevation-2 modern-table"
            @page-count="pageCount = $event"
          >
            <template #[`item.studio.name`]="{ item }">
              <v-edit-dialog
                :return-value.sync="item.studio"
                persistent
                large
                eager
                cancel-text="Cancelar"
                save-text="Guardar"
                @save="saveStudio(item.id, item.studio)"
                @cancel="cancel"
              >
                <v-chip small label :class="item.studio ? 'grey darken-4' : 'grey'">
                  {{ item.studio ? item.studio.name : 'No Studio' }}
                </v-chip>
                <template #input>
                  <StudioAutocomplete :value="item.studio" @change="updateStudio($event, item.id)" />
                </template>
              </v-edit-dialog>
            </template>
            <template #[`item.producer.name`]="{ item }">
              <v-edit-dialog
                :return-value.sync="item.producer"
                persistent
                large
                eager
                cancel-text="Cancelar"
                save-text="Guardar"
                @save="saveProducer(item.id, item.producer)"
                @cancel="cancel"
              >
                <v-chip small label :class="item.producer ? 'grey darken-4' : 'grey'">
                  {{ item.producer ? item.producer.name : 'No Producer' }}
                </v-chip>
                <template #input>
                  <ProducerAutocomplete :value="item.producer" @change="updateProducer($event, item.id)" />
                </template>
              </v-edit-dialog>
            </template>
            <template #[`item.status`]="{ item }">
              <v-edit-dialog
                :return-value.sync="item.status"
                persistent
                large
                eager
                cancel-text="Cancelar"
                save-text="Guardar"
                @save="saveStatus(item.id, item.status)"
                @cancel="cancel"
              >
                <v-chip small label :class="getColorPill(item.status.name)">
                  {{ item.status.name }}
                </v-chip>
                <template #input>
                  <v-select
                    :value="item.status"
                    :items="statuses"
                    item-text="name"
                    item-value="name"
                    single-line
                    dense
                    :return-object="true"
                    @change="updateStatus(item.id, $event)"
                  />
                </template>
              </v-edit-dialog>
            </template>
            <template #[`item.featured`]="{ item }">
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    :class="{ 'primary': item.featured }"
                    icon
                    class="rounded-xl"
                    v-on="on"
                    @click="setFeatured(item.id, series.map(function(x) {return x.id; }).indexOf(item.id))"
                  >
                    <v-icon>
                      mdi-star
                    </v-icon>
                  </v-btn>
                </template>
                <span>Toggle Featured</span>
              </v-tooltip>
            </template>
            <template #[`item.updatedAt`]="{ item }">
              <span>{{ formatDateWithNoTime(item.updatedAt) }}</span>
            </template>
            <template #[`item.createdAt`]="{ item }">
              <span>{{ formatDateWithNoTime(item.createdAt) }}</span>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    :to="'/panel/serie/' + item.id + '/episode/create'"
                    v-bind="attrs"
                    icon
                    class="rounded-xl"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-plus-circle
                    </v-icon>
                  </v-btn>
                </template>
                <span>Create Episode</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    :to="'/panel/serie/' + item.id + '/episodes'"
                    v-bind="attrs"
                    icon
                    class="rounded-xl"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-play-circle
                    </v-icon>
                  </v-btn>
                </template>
                <span>Episode List</span>
              </v-tooltip>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    :to="'/panel/serie/' + item.id + '/edit'"
                    v-bind="attrs"
                    icon
                    class="rounded-xl"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-circle-edit-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Edit Serie</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </client-only>
      </v-col>
    </v-row>
    <v-row class="justify-center mb-5">
      <v-pagination
        v-model="pagination.page"
        :length="pagination.pageCount"
        :total-visible="6"
        circle
        class="modern-pagination"
      />
    </v-row>
    <v-snackbar
      v-model="snack"
      :timeout="3000"
      :color="snackColor"
      top
      vertical
    >
      {{ snackText }}
      <template #action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import ProducerAutocomplete from '@/components/ProducerAutocomplete.vue'
import StudioAutocomplete from '@/components/StudioAutocomplete.vue'

export default {
  name: 'SerieList',
  components: {
    ProducerAutocomplete,
    StudioAutocomplete
  },
  data: () => ({
    search: '',
    alertBox: false,
    createdMessage: '',
    alertBoxColor: '',
    page: 0,
    itemsPerPage: 50,
    pageCount: 1,
    headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        value: 'title'
      },
      { text: 'Episodes', value: 'episodes.length' },
      { text: 'Visits', value: 'visits' },
      { text: 'Airing', sortable: true, value: 'status' },
      { text: 'Studio', sortable: true, value: 'studio.name' },
      { text: 'Producer', sortable: true, value: 'producer.name' },
      { text: 'Featured', sortable: true, value: 'featured' },
      { text: 'Last Updated', sortable: true, value: 'updatedAt' },
      { text: 'Created At', sortable: true, value: 'createdAt' },
      { text: 'Actions', sortable: false, value: 'actions' }
    ],
    pagination: {
      page: 1,
      pageSize: 24
    },
    options: {
      sortBy: ['createdAt'],
      sortDesc: [true]
    },
    snack: false,
    snackColor: '',
    snackText: ''
  }),
  computed: {
    series () {
      return this.$store.state.series.panelSerieList
    },
    statuses () {
      return this.$store.state.statuses.statuses
    }
  },
  watch: {
    '$store.state.series.panelSerieListPagination' (val) {
      Object.assign(this.pagination, val)
    },
    'pagination.page': {
      handler () {
        this.getSeries()
      },
      deep: false
    },
    options: {
      handler () {
        this.getSeries()
      },
      deep: false
    }
  },
  async mounted () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'primary'
      this.createdMessage = 'Serie Created Successfully.'
    }
    if (this.$route.query.edited) {
      this.alertBox = true
      this.alertBoxColor = 'yellow darken-4'
      this.createdMessage = 'Serie Edited Successfully.'
    }
    if (this.$route.query.deleted) {
      this.alertBox = true
      this.alertBoxColor = 'red darken-4'
      this.createdMessage = 'Serie Deleted Successfully.'
    }
    await this.getStatuses()
    await this.getSeries()
  },
  methods: {
    formatDateWithNoTime (date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    async getSeries () {
      await this.$store.dispatch('series/getPanelSerieList', {
        search: this.search,
        token: this.$store.state.auth.token,
        pagination: this.pagination,
        options: this.options
      })
    },
    async getStatuses () {
      await this.$store.dispatch('statuses/getStatuses', {
        token: this.$store.state.auth.token
      })
    },
    setFeatured (serieId, index) {
      this.$store.dispatch('series/setFeatured', {
        index,
        serieId,
        token: this.$store.state.auth.token,
        featured: !this.series[index].featured
      })
    },
    async saveStatus (serieId, newStatus) {
      await this.$store.dispatch('series/saveStatus', {
        serieId,
        status: newStatus.name,
        token: this.$store.state.auth.token
      })
    },
    async updateStatus (serieId, status) {
      await this.$store.dispatch('series/updateStatus', {
        serieId,
        status
      })
    },
    getColorPill (status) {
      if (status === 'Airing') {
        return 'primary'
      } else {
        return 'red darken-4'
      }
    },
    cancel () {
      this.snack = true
      this.snackColor = 'error'
      this.snackText = 'Operation cancelled.'
    },
    async saveStudio (serieId, newStudio) {
      await this.$store.dispatch('series/saveStudio', {
        serieId,
        studio: newStudio,
        token: this.$store.state.auth.token
      })
      this.getSeries()
    },
    async saveProducer (serieId, newProducer) {
      await this.$store.dispatch('series/saveProducer', {
        serieId,
        producer: newProducer,
        token: this.$store.state.auth.token
      })
      this.getSeries()
    },
    updateStudio (studio, serieId) {
      this.$store.dispatch('series/updateStudio', {
        serieId,
        studio
      })
    },
    async updateProducer (producer, serieId) {
      await this.$store.dispatch('series/updateProducer', {
        serieId,
        producer
      })
    }
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255,255,255,0.12);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
}
.search-bar {
  max-width: 350px;
  margin-left: 2rem;
  background: rgba(255,255,255,0.18);
  border-radius: 10px;
}
.modern-table {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
}
.modern-pagination {
  margin-top: 2rem;
}
</style>
