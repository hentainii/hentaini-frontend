<template>
  <v-container class="episode-container pa-4">
    <!-- Skeleton for Breadcrumbs -->
    <v-row class="d-none d-md-flex">
      <v-col style="padding-top:0">
        <v-skeleton-loader type="text" width="60%" class="pl-0 pb-0" />
      </v-col>
    </v-row>

    <v-row>
      <!-- Columna principal con el reproductor -->
      <v-col cols="12" md="8" class="pb-0">
        <v-card class="overflow-hidden rounded-lg mb-4 elevation-3">
          <!-- Skeleton para el reproductor de video -->
          <v-skeleton-loader
            type="image"
            width="100%"
            height="360"
            class="video-skeleton"
          />

          <!-- Skeleton para los controles del reproductor -->
          <v-card-actions class="player-controls py-2 px-0 pa-sm-2">
            <v-skeleton-loader
              type="button, button, button"
              class="mx-auto d-flex justify-space-between"
              width="100%"
            />
          </v-card-actions>
        </v-card>

        <!-- Skeleton para Título y Navegación -->
        <v-row align="center" class="mb-2 px-1">
          <v-col cols="12" md="8" class="py-2">
            <v-skeleton-loader type="heading" class="mb-2" />
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-center justify-md-end py-2">
            <v-skeleton-loader type="button, button, button" class="d-flex" />
          </v-col>
        </v-row>

        <!-- Skeleton para sección de comentarios -->
        <v-card class="mb-4 rounded-lg elevation-3">
          <v-card-title>
            <v-skeleton-loader type="heading" width="30%" />
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader type="text, text, text" class="mb-2" />
          </v-card-text>
        </v-card>

        <!-- Skeleton para Series Similares -->
        <v-card class="mb-4 rounded-lg elevation-3">
          <v-card-title>
            <v-skeleton-loader type="heading" width="40%" />
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col
                v-for="i in 4"
                :key="i"
                cols="6"
                class="serie-item"
              >
                <v-skeleton-loader
                  type="card"
                  class="mx-auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Columna lateral con información y episodios -->
      <v-col cols="12" md="4">
        <!-- Skeleton para Información de la serie -->
        <v-card class="rounded-lg mb-4 elevation-3">
          <v-card-title>
            <v-skeleton-loader type="heading" width="60%" />
          </v-card-title>

          <v-card-text class="pt-2">
            <v-skeleton-loader type="text, text" class="mb-3" />

            <v-divider class="my-3" />

            <!-- Skeleton para Géneros -->
            <v-skeleton-loader type="heading" width="30%" class="mb-2" />
            <v-skeleton-loader
              type="chip, chip, chip, chip"
              class="d-flex flex-wrap"
            />
          </v-card-text>
        </v-card>

        <!-- Skeleton para Lista de episodios -->
        <v-card class="rounded-lg mb-4 elevation-3">
          <v-card-title class="d-flex justify-space-between align-center">
            <v-skeleton-loader type="heading" width="40%" />
            <v-skeleton-loader type="button" />
          </v-card-title>

          <v-list class="episode-list py-0">
            <v-list-item
              v-for="i in 5"
              :key="i"
              class="episode-list-item"
            >
              <v-list-item-avatar
                class="mr-3"
              >
                <v-skeleton-loader type="avatar" width="32" height="32" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-skeleton-loader type="text" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Skeleton para Anuncios -->
        <v-row class="justify-center">
          <v-skeleton-loader
            type="image"
            width="100%"
            height="250"
            class="mb-4 rounded-lg"
          />
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'EpisodeRenderSkeleton'
}
</script>

<style scoped>
.episode-container {
  background-color: rgba(0, 0, 0, 0.02);
}

.video-skeleton {
  border-radius: 8px;
  overflow: hidden;
}

.player-controls {
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.episode-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.serie-item {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Staggered animation for skeleton items */
.serie-item:nth-child(1) { animation-delay: 0.1s; }
.serie-item:nth-child(2) { animation-delay: 0.2s; }
.serie-item:nth-child(3) { animation-delay: 0.3s; }
.serie-item:nth-child(4) { animation-delay: 0.4s; }
</style>
