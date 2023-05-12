<template>
  <v-container v-if="series" fluid>
    <v-row>
      <v-col cols="12">
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <v-card-title>
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
            class="white--text"
            @keyup.enter="getSeries"
          />
        </v-card-title>
        <client-only>
          <v-data-table
            :headers="headers"
            :items="series"
            :page.sync="page"
            :options.sync="options"
            :items-per-page="itemsPerPage"
            hide-default-footer
            class="elevation-1"
            @page-count="pageCount = $event"
          >
            <!-- ########################### -->
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
            <!-- ########################### -->
            <template #[`item.featured`]="{ item }">
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    :class="{ 'primary': item.featured }"
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
            <template #[`item.actions`]="{ item }">
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    :to="'/panel/serie/' + item.id + '/episode/create'"
                    v-bind="attrs"
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
                    v-on="on"
                  >
                    <v-icon>
                      mdi-circle-edit-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Edit Serie</span>
              </v-tooltip>
              <!-- <DeleteModalDeleteSerie :title="item.title" :serieid="item.id" /> -->
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
  </v-container>
</template>

<script>
export default {
  name: 'SerieList',
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
      { text: 'Featured', sortable: true, value: 'featured' },
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
    }
  }
}
</script>

<style>

</style>
