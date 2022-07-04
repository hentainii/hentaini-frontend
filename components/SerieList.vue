<template>
  <v-container v-if="series">
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
            hide-details
            class="white--text"
          />
        </v-card-title>
        <client-only>
          <v-data-table
            :headers="headers"
            :items="series"
            :page.sync="page"
            :search="search"
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
                @save="save(item.id, item.status)"
                @cancel="cancel"
                @close="close"
              >
                <v-chip small label :class="getColorPill(item.status.name)">
                  {{ item.status.name }}
                </v-chip>
                <template #input>
                  <v-select
                    v-model="item.status"
                    :items="statusItems"
                    item-text="name"
                    item-value="name"
                    single-line
                    dense
                    :return-object="true"
                  />
                </template>
              </v-edit-dialog>
            </template>
            <!-- ########################### -->
            <template #[`item.isFeatured`]="{ item }">
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    :class="{ 'blue darken-4': item.featured }"
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
              <DeleteModalDeleteSerie :title="item.title" :serieid="item.id" />
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
    series: null,
    alertBox: false,
    createdMessage: '',
    alertBoxColor: '',
    page: 0,
    statusItems: null,
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
      { text: 'Featured', sortable: true, value: 'isFeatured' },
      { text: 'Actions', sortable: false, value: 'actions' }
    ],
    pagination: {
      page: 1,
      pageSize: 24
    },
    snack: false,
    snackColor: '',
    snackText: ''
  }),
  async mounted () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
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
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'status',
          'episodes'
        ],
        sort: ['createdAt:desc'],
        pagination: this.pagination
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((serie) => {
            serie.attributes.id = serie.id
            serie.attributes.status = serie.attributes.status.data.attributes
            serie.attributes.episodes = serie.attributes.episodes.data.map((episode) => {
              episode.attributes.id = episode.id
              return episode.attributes
            })
            return {
              ...serie.attributes
            }
          })
          this.pagination = input.meta.pagination
          this.series = res
        })
    },
    async getStatuses () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}statuses`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((status) => {
            return {
              name: status.attributes.name
            }
          })
          this.statusItems = res
        })
    },
    getColorPill (status) {
      if (status === 'Airing') {
        return 'blue darken-4'
      } else {
        return 'red darken-4'
      }
    },
    async setFeatured (serieId, index) {
      this.series[index].featured = !this.series[index].featured

      await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${serieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.accessToken}`
        },
        body: JSON.stringify({
          data: {
            featured: this.series[index].featured
          }
        })
      }).then((input) => {
        if (input.status === 200) {
          this.snack = true
          this.snackColor = 'info'
          this.snackText = 'Featured changed successfully!'
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    async save (serieId, newStatus) {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${serieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.accessToken}`
        },
        body: JSON.stringify({
          data: {
            status: newStatus.name === 'Airing' ? 1 : 2
          }
        })
      }).then((input) => {
        if (input.status === 200) {
          this.snack = true
          this.snackColor = 'info'
          this.snackText = 'Status changed successfully!'
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    cancel () {
      this.snack = true
      this.snackColor = 'error'
      this.snackText = 'Operation cancelled.'
    },
    close () {
      // eslint-disable-next-line no-console
      console.log('Info closed')
    }
  }
}
</script>

<style>

</style>
