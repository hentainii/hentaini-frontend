<template>
  <div class="dashboard-container">
    <!-- Encabezado del Dashboard -->
    <div class="dashboard-header">
      <h1 class="dashboard-title primary--text">
        <v-icon large color="primary" class="mr-3">
          mdi-view-dashboard
        </v-icon>
        Panel de Control
      </h1>
      <p class="dashboard-subtitle">
        Resumen de actividad y estadísticas del sistema
      </p>
    </div>

    <!-- Métricas Principales -->
    <v-row class="metrics-row mb-6">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card series-card" elevation="8">
          <div class="metric-content">
            <div class="metric-icon">
              <v-icon size="40">
                mdi-television-play
              </v-icon>
            </div>
            <div class="metric-info">
              <h3 class="metric-number">
                {{ seriesCount || '---' }}
              </h3>
              <p class="metric-label">
                Series Totales
              </p>
              <p class="metric-trend positive">
                <v-icon small>
                  mdi-trending-up
                </v-icon>
                +{{ seriesGrowth }}% este mes
              </p>
            </div>
          </div>
          <v-btn
            class="metric-action"
            color="white"
            outlined
            small
            :to="`/panel/serie`"
          >
            Gestionar Series
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card episodes-card" elevation="8">
          <div class="metric-content">
            <div class="metric-icon">
              <v-icon size="40">
                mdi-play-circle
              </v-icon>
            </div>
            <div class="metric-info">
              <h3 class="metric-number">
                {{ episodesCount || '---' }}
              </h3>
              <p class="metric-label">
                Episodios
              </p>
              <p class="metric-trend positive">
                <v-icon small>
                  mdi-trending-up
                </v-icon>
                +{{ episodesGrowth }}% este mes
              </p>
            </div>
          </div>
          <v-btn
            class="metric-action"
            color="white"
            outlined
            small
            :to="`/panel/serie`"
          >
            Ver Episodios
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card users-card" elevation="8">
          <div class="metric-content">
            <div class="metric-icon">
              <v-icon size="40">
                mdi-account-group
              </v-icon>
            </div>
            <div class="metric-info">
              <h3 class="metric-number">
                {{ usersCount || '---' }}
              </h3>
              <p class="metric-label">
                Usuarios
              </p>
              <p class="metric-trend positive">
                <v-icon small>
                  mdi-trending-up
                </v-icon>
                +{{ usersGrowth }}% este mes
              </p>
            </div>
          </div>
          <v-btn
            class="metric-action"
            color="white"
            outlined
            small
            :to="`/panel/user`"
          >
            Gestionar Usuarios
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card reports-card" elevation="8">
          <div class="metric-content">
            <div class="metric-icon">
              <v-icon size="40">
                mdi-alert-circle
              </v-icon>
            </div>
            <div class="metric-info">
              <h3 class="metric-number">
                {{ reportsCount || '---' }}
              </h3>
              <p class="metric-label">
                Reportes Pendientes
              </p>
              <p class="metric-trend" :class="reportsCount > 0 ? 'negative' : 'neutral'">
                <v-icon small>
                  {{ reportsCount > 0 ? 'mdi-alert' : 'mdi-check-circle' }}
                </v-icon>
                {{ reportsCount > 0 ? 'Requiere atención' : 'Todo bien' }}
              </p>
            </div>
          </div>
          <v-btn
            class="metric-action"
            color="white"
            outlined
            small
            :to="`/panel/reports`"
          >
            Ver Reportes
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sección de Actividad y Enlaces Rápidos -->
    <v-row>
      <!-- Actividad Reciente -->
      <v-col cols="12">
        <v-card class="activity-card" elevation="4">
          <v-card-title class="activity-header">
            <v-icon class="mr-2">
              mdi-clock-time-four
            </v-icon>
            Actividad Reciente
          </v-card-title>
          <v-card-text>
            <div class="activity-timeline">
              <div v-if="displayActivities.length === 0" class="no-activity">
                <v-icon size="48" color="grey">
                  mdi-clock-outline
                </v-icon>
                <p class="no-activity-text">
                  No hay actividad reciente en los últimos 3 días
                </p>
              </div>
              <template v-else>
                <div v-for="(activity, index) in displayActivities" :key="index" class="activity-item">
                  <div class="activity-icon">
                    <v-icon :color="activity.color" size="20">
                      {{ activity.icon }}
                    </v-icon>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">
                      {{ activity.text }}
                    </p>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  name: 'ModernDashboard',

  data () {
    return {
      seriesCount: null,
      episodesCount: null,
      usersCount: null,
      reportsCount: null,
      seriesGrowth: 15,
      episodesGrowth: 23,
      usersGrowth: 8,

      recentActivities: [
        {
          icon: 'mdi-plus-circle',
          color: 'primary',
          text: 'Nueva serie "Attack on Titan" agregada',
          time: 'Hace 2 horas'
        },
        {
          icon: 'mdi-account-plus',
          color: 'info',
          text: '5 nuevos usuarios registrados',
          time: 'Hace 4 horas'
        },
        {
          icon: 'mdi-upload',
          color: 'warning',
          text: 'Episode 12 de "One Piece" subido',
          time: 'Hace 6 horas'
        },
        {
          icon: 'mdi-check-circle',
          color: 'success',
          text: 'Reporte de error resuelto',
          time: 'Hace 8 horas'
        }
      ],

      recentActivitiesReal: []
    }
  },

  head () {
    return {
      title: 'Dashboard Moderno - Hentaini Panel',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Panel de control moderno con estadísticas y métricas del sistema Hentaini'
        }
      ]
    }
  },

  computed: {
    displayActivities () {
      return this.recentActivitiesReal.length > 0 ? this.recentActivitiesReal : this.recentActivities
    }
  },

  mounted () {
    this.loadDashboardData()
    this.loadRecentActivity()
  },

  methods: {
    async loadDashboardData () {
      try {
        await Promise.all([
          this.loadSeriesCount(),
          this.loadEpisodesCount(),
          this.loadUsersCount(),
          this.loadReportsCount()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    },

    async loadSeriesCount () {
      try {
        const query = qs.stringify({
          pagination: {
            pageSize: 1
          }
        })
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        const data = await response.json()
        this.seriesCount = data.meta?.pagination?.total || 0
      } catch (error) {
        console.error('Error loading series count:', error)
        this.seriesCount = 0
      }
    },

    async loadEpisodesCount () {
      try {
        const query = qs.stringify({
          pagination: {
            pageSize: 1
          }
        })
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
        const data = await response.json()
        this.episodesCount = data.meta?.pagination?.total || 0
      } catch (error) {
        console.error('Error loading episodes count:', error)
        this.episodesCount = 0
      }
    },

    async loadUsersCount () {
      try {
        const query = qs.stringify({
          pagination: {
            pageSize: 1
          }
        })
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}users?${query}`)
        const data = await response.json()
        this.usersCount = data.meta?.pagination?.total || data.length || 0
      } catch (error) {
        console.error('Error loading users count:', error)
        this.usersCount = 0
      }
    },

    async loadReportsCount () {
      try {
        const query = qs.stringify({
          filters: {
            fixed: false
          },
          pagination: {
            pageSize: 1
          }
        })
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports?${query}`)
        const data = await response.json()
        this.reportsCount = data.meta?.pagination?.total || 0
      } catch (error) {
        console.error('Error loading reports count:', error)
        this.reportsCount = 0
      }
    },

    async loadRecentActivity () {
      try {
        const activities = []

        // Cargar series recientes (últimas 5)
        try {
          const seriesQuery = qs.stringify({
            sort: ['createdAt:desc'],
            pagination: {
              pageSize: 5
            }
          })
          const seriesResponse = await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${seriesQuery}`)
          const seriesData = await seriesResponse.json()

          if (seriesData.data && seriesData.data.length > 0) {
            seriesData.data.forEach((serie) => {
              activities.push({
                icon: 'mdi-plus-circle',
                color: 'primary',
                text: `Nueva serie "${serie.title || 'Sin nombre'}" agregada`,
                time: this.formatTimeAgo(serie.createdAt),
                timestamp: new Date(serie.createdAt)
              })
            })
          }
        } catch (error) {
          console.error('Error loading recent series:', error)
        }

        // Cargar episodios recientes (últimos 5)
        try {
          const episodesQuery = qs.stringify({
            sort: ['createdAt:desc'],
            pagination: {
              pageSize: 5
            },
            populate: ['serie']
          })
          const episodesResponse = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${episodesQuery}`)
          const episodesData = await episodesResponse.json()

          if (episodesData.data && episodesData.data.length > 0) {
            episodesData.data.forEach((episode) => {
              const serieInfo = episode.serie || {}
              activities.push({
                icon: 'mdi-upload',
                color: 'warning',
                text: `Episodio ${episode.episode_number || 'nuevo'} de "${serieInfo.title || 'serie'}" subido`,
                time: this.formatTimeAgo(episode.createdAt),
                timestamp: new Date(episode.createdAt)
              })
            })
          }
        } catch (error) {
          console.error('Error loading recent episodes:', error)
        }

        // Cargar usuarios recientes (últimos 3)
        try {
          const usersQuery = qs.stringify({
            sort: ['createdAt:desc'],
            pagination: {
              pageSize: 3
            }
          })
          const usersResponse = await fetch(`${this.$config.API_STRAPI_ENDPOINT}users?${usersQuery}`)
          const usersData = await usersResponse.json()

          if (usersData && usersData.length > 0) {
            usersData.forEach((user) => {
              activities.push({
                icon: 'mdi-account-plus',
                color: 'info',
                text: `Usuario "${user.username || 'usuario'}" se registró`,
                time: this.formatTimeAgo(user.createdAt),
                timestamp: new Date(user.createdAt)
              })
            })
          }
        } catch (error) {
          console.error('Error loading recent users:', error)
        }

        // Cargar comentarios recientes (últimos 4)
        try {
          const commentsQuery = qs.stringify({
            sort: ['createdAt:desc'],
            pagination: {
              pageSize: 4
            },
            populate: ['author']
          })
          const commentsResponse = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments?${commentsQuery}`)
          const commentsData = await commentsResponse.json()

          if (commentsData.data && commentsData.data.length > 0) {
            commentsData.data.forEach((comment) => {
              const authorInfo = comment.author || {}
              activities.push({
                icon: 'mdi-comment',
                color: 'success',
                text: `${authorInfo.username || 'Usuario'} comentó en un ${comment.comment_type || 'contenido'}`,
                time: this.formatTimeAgo(comment.createdAt),
                timestamp: new Date(comment.createdAt)
              })
            })
          }
        } catch (error) {
          console.error('Error loading recent comments:', error)
        }

        // Cargar reportes recientes (últimos 3)
        try {
          const reportsQuery = qs.stringify({
            sort: ['createdAt:desc'],
            pagination: {
              pageSize: 3
            },
            populate: ['user', 'episode', 'episode.serie']
          })
          const reportsResponse = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports?${reportsQuery}`)
          const reportsData = await reportsResponse.json()

          if (reportsData.data && reportsData.data.length > 0) {
            reportsData.data.forEach((report) => {
              const userInfo = report.user || {}
              const episodeInfo = report.episode || {}
              const serieInfo = episodeInfo.serie || {}

              activities.push({
                icon: 'mdi-flag',
                color: 'error',
                text: `${userInfo.username || 'Usuario'} reportó problema en "${serieInfo.title || 'serie'}" ep. ${episodeInfo.episode_number || '?'}`,
                time: this.formatTimeAgo(report.createdAt),
                timestamp: new Date(report.createdAt)
              })
            })
          }
        } catch (error) {
          console.error('Error loading recent reports:', error)
        }

        // Ordenar por timestamp y tomar solo los más recientes
        activities.sort((a, b) => b.timestamp - a.timestamp)
        this.recentActivitiesReal = activities.slice(0, 15)
      } catch (error) {
        console.error('Error loading recent activity:', error)
        this.recentActivitiesReal = []
      }
    },

    formatTimeAgo (dateString) {
      if (!dateString) { return 'Fecha desconocida' }

      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 60) {
        return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
      }

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) {
        return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
      }

      const diffInDays = Math.floor(diffInHours / 24)
      return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`
    }

  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
}

/* Métricas Principales */
.metrics-row {
  margin-bottom: 0;
}

.metric-card {
  position: relative;
  border-radius: 16px !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 180px;
  border: 2px solid transparent;
}

.metric-card:hover {
  transform: translateY(-8px);
  border-color: var(--v-primary-base);
}

.series-card {
  background: var(--v-primary-base) !important;
}

.episodes-card {
  background: var(--v-secondary-base) !important;
}

.users-card {
  background: var(--v-info-base) !important;
}

.reports-card {
  background: var(--v-warning-base) !important;
}

.metric-content {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.metric-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-info {
  flex: 1;
}

.metric-number {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  animation: countUp 1s ease-out;
  color: white;
}

.metric-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
}

.metric-trend {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-trend.positive {
  color: var(--v-success-base);
}

.metric-trend.negative {
  color: var(--v-error-base);
}

.metric-trend.neutral {
  color: var(--v-accent-base);
}

.metric-action {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 0.75rem !important;
}

/* Actividad Reciente */
.activity-card {
  border-radius: 16px !important;
  border: 1px solid var(--v-primary-base);
}

.activity-header {
  background: var(--v-primary-base) !important;
  color: var(--v-primary-contrast) !important;
  border-radius: 16px 16px 0 0 !important;
}

.activity-timeline {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  background: var(--v-primary-lighten3);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 4px 0;
  font-weight: 500;
}

.activity-time {
  font-size: 0.8rem;
  opacity: 0.7;
}

.no-activity {
  text-align: center;
  padding: 40px 20px;
}

.no-activity-text {
  margin-top: 16px;
  font-size: 0.9rem;
  opacity: 0.7;
}
/* Animaciones */
@keyframes countUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .metric-card {
    height: 160px;
  }

  .metric-number {
    font-size: 1.8rem;
  }
}

@media (max-width: 600px) {
  .dashboard-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 8px;
  }

  .metric-content {
    padding: 16px;
    gap: 12px;
  }

    .metric-card {
    height: 140px;
  }
}
</style>
