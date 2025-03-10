<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card-title>
          Reportes de Problemas con Capítulos
          <v-spacer />
          <!-- Puedes agregar un search o filtros aquí si lo requieres -->
        </v-card-title>
        <!-- v-alert para mostrar errores -->
        <v-alert
          v-if="alert.show"
          :type="alert.color"
          dismissible
          @input="alert.show = false"
        >
          {{ alert.message }}
        </v-alert>
        <client-only>
          <v-data-table
            :headers="headers"
            :items="reports"
            class="elevation-1"
          >
            <!-- Columna para mostrar el número de reportes -->
            <template #[`item.reportsCount`]="{ item }">
              <span>{{ item.reportsCount }}</span>
            </template>

            <!-- Columna para mostrar el nombre del usuario con tooltip si hay múltiples reportes -->
            <template #[`item.username`]="{ item }">
              <v-tooltip v-if="item.reportsCount > 1" bottom>
                <template #activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">{{ item.username }}</span>
                </template>
                <div>
                  <strong>Reportado por:</strong>
                  <ul style="padding-left: 16px; margin: 0;">
                    <li v-for="(user, index) in item.usernames" :key="index">
                      {{ user }}
                    </li>
                  </ul>
                </div>
              </v-tooltip>
              <span v-else>
                {{ item.username }}
              </span>
            </template>

            <!-- Columna para mostrar el chip del tipo de reporte con tooltip de detalles -->
            <template #[`item.reportType`]="{ item }">
              <v-edit-dialog
                :return-value.sync="item.reportType"
                persistent
                large
                eager
                cancel-text="Cancelar"
                save-text="Guardar"
                @save="updateReportType(item)"
              >
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-chip small label v-bind="attrs" v-on="on">
                      {{ item.reportType }}
                    </v-chip>
                  </template>
                  <div>
                    <strong>Detalles:</strong>
                    <div v-if="item.details && item.details.length">
                      <ul style="padding-left: 16px; margin: 0;">
                        <li v-for="(detail, index) in item.details" :key="index">
                          {{ detail }}
                        </li>
                      </ul>
                    </div>
                    <div v-else>
                      Sin detalles
                    </div>
                  </div>
                </v-tooltip>
                <template #input>
                  <v-select
                    v-model="item.reportType"
                    :items="possibleTypes"
                    dense
                    hide-details
                  />
                </template>
              </v-edit-dialog>
            </template>

            <!-- Columna para mostrar badge si el reporte está solucionado -->
            <template #[`item.fixed`]="{ item }">
              <div v-if="item.fixed">
                <v-chip small color="green" text-color="white">
                  Fixed
                </v-chip>
              </div>
            </template>

            <!-- Columna de Acciones -->
            <template #[`item.actions`]="{ item }">
              <!-- Botón para marcar como solucionado -->
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    :disabled="item.fixed"
                    v-on="on"
                    @click="markAsFixed(item)"
                  >
                    <v-icon>mdi-check-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>Marcar como solucionado</span>
              </v-tooltip>
              <!-- Botón para recategorizar (abre diálogo) -->
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                    @click="openRecategorizeDialog(item)"
                  >
                    <v-icon>mdi-tag-outline</v-icon>
                  </v-btn>
                </template>
                <span>Recategorizar Reporte</span>
              </v-tooltip>
              <!-- Botón para ir al capítulo -->
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    :to="`/h/${item.serieUrl}/${item.episodeNumber}`"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-book-open-page-variant</v-icon>
                  </v-btn>
                </template>
                <span>Ir al Capítulo</span>
              </v-tooltip>
              <!-- Botón para editar el capítulo -->
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    :to="`/panel/serie/${item.serieId}/episodes/${item.episodeId}/edit`"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Editar Capítulo</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </client-only>
      </v-col>
    </v-row>

    <!-- Diálogo para recategorizar reporte -->
    <v-dialog v-model="recategorizeDialog" max-width="500">
      <v-card>
        <v-card-title>Recategorizar Reporte</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedType"
            :items="possibleTypes"
            label="Tipo de Reporte"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="confirmRecategorize">
            Guardar
          </v-btn>
          <v-btn text color="secondary" @click="recategorizeDialog = false">
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  layout: 'panel',
  middleware: 'authenticated',
  data () {
    return {
      reports: [],
      // Lista de tipos de reportes posibles
      possibleTypes: ['broken-players', 'broken-subs', 'broken-audio'],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Serie', value: 'serieName' },
        { text: 'Episode', value: 'episodeNumber' },
        // Columna que muestra la cantidad de reportes por capítulo
        { text: 'N° Reportes', value: 'reportsCount' },
        { text: 'Usuario', value: 'username' },
        { text: 'Fecha Reporte', value: 'reportDate' },
        { text: 'Fecha Solucionado', value: 'fixedDate', sortable: false },
        { text: 'Estado', value: 'fixed', sortable: false },
        { text: 'Tipo de Reporte', value: 'reportType' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      recategorizeDialog: false,
      selectedReport: null,
      selectedType: null,
      // Estado del alert para errores
      alert: {
        show: false,
        message: '',
        color: 'error'
      }
    }
  },
  async mounted () {
    await this.getReports()
  },
  methods: {
    async getReports () {
      try {
        const qs = require('qs')
        const query = qs.stringify({
          pagination: { limit: 1000 },
          populate: ['episode', 'episode.serie', 'user'] // Se incluye 'user' para obtener el username
        }, { encodeValuesOnly: true })
        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports?${query}`)
        const { data: reports } = await res.json()
        // Mapeo de cada reporte obtenido (incluyendo la fecha original para filtrar y detalles)
        const mappedReports = reports.map((report) => {
          const createdAt = report.createdAt
          return {
            id: report.id,
            episodeId: report.episode.id || null,
            episodeNumber: report.episode.episode_number || null,
            serieName: report.episode.serie.title || 'No Episode',
            serieId: report.episode.serie.id || null,
            serieUrl: report.episode.serie.url || null,
            reportType: report.reason,
            fixed: report.fixed || false,
            createdAt, // se guarda para filtrar por fecha
            reportDate: createdAt ? new Date(createdAt).toLocaleString() : 'N/A',
            fixedDate: report.fixed
              ? (report.updatedAt ? new Date(report.updatedAt).toLocaleString() : 'Pending')
              : 'Pending',
            username: report.user ? report.user.username : 'No logged user',
            // Se asume que el API puede retornar detalles del reporte
            details: report.details ? report.details : null
          }
        })

        // Filtrar: excluir reportes fijos creados hace más de 7 días
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        const now = new Date()
        const filteredReports = mappedReports.filter((item) => {
          if (item.fixed) {
            return (now - new Date(item.createdAt)) <= sevenDays
          }
          return true
        })

        // Agrupar los reportes por capítulo (episodeId) e incluir un arreglo de usernames y detalles
        const grouped = {}
        filteredReports.forEach((item) => {
          const key = item.episodeId
          if (grouped[key]) {
            grouped[key].reportsCount += 1
            grouped[key].usernames.push(item.username)
            if (item.details) {
              grouped[key].details.push(item.details)
            }
          } else {
            grouped[key] = {
              ...item,
              reportsCount: 1,
              usernames: [item.username],
              details: item.details ? [item.details] : []
            }
          }
        })
        this.reports = Object.values(grouped)
        // Ordenar: los no fijos primero
        this.reports.sort((a, b) =>
          a.fixed === b.fixed ? 0 : a.fixed ? 1 : -1
        )
      } catch (error) {
        console.error(error)
        this.alert.message = 'Error al obtener reportes'
        this.alert.show = true
      }
    },
    async markAsFixed (report) {
      try {
        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports/${report.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({ data: { fixed: true } })
        })
        if (res.status === 200) {
          report.fixed = true
          // Reordenar la lista para mostrar los no fijos primero
          this.reports.sort((a, b) =>
            a.fixed === b.fixed ? 0 : a.fixed ? 1 : -1
          )
        } else {
          this.alert.message = 'Error al marcar como solucionado'
          this.alert.show = true
        }
      } catch (error) {
        console.error(error)
        this.alert.message = 'Error al marcar como solucionado'
        this.alert.show = true
      }
    },
    openRecategorizeDialog (report) {
      this.selectedReport = report
      this.selectedType = report.reportType
      this.recategorizeDialog = true
    },
    async confirmRecategorize () {
      if (!this.selectedReport) { return }
      try {
        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports/${this.selectedReport.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({ data: { reason: this.selectedType } })
        })
        if (res.status === 200) {
          this.selectedReport.reportType = this.selectedType
        } else {
          this.alert.message = 'Error al recategorizar'
          this.alert.show = true
        }
      } catch (error) {
        console.error(error)
        this.alert.message = 'Error al recategorizar'
        this.alert.show = true
      }
      this.recategorizeDialog = false
      this.selectedReport = null
      this.selectedType = null
    },
    async updateReportType (report) {
      try {
        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports/${report.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({ data: { reason: report.reportType } })
        })
        if (res.status !== 200) {
          this.alert.message = 'Error al actualizar el tipo de reporte'
          this.alert.show = true
        }
      } catch (error) {
        console.error(error)
        this.alert.message = 'Error al actualizar el tipo de reporte'
        this.alert.show = true
      }
    }
  }
}
</script>

<style scoped>
/* Aquí puedes agregar estilos personalizados para el componente */
</style>
