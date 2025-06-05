<template>
  <v-container fluid>
    <v-row>
      <v-container class="pb-0">
        <!-- Breadcrumb skeleton -->
        <v-row>
          <v-col cols="12" class="px-4 pb-0">
            <v-skeleton-loader
              type="breadcrumb"
              width="300"
            />
          </v-col>
        </v-row>

        <!-- Title section skeleton -->
        <v-row>
          <v-col cols="12" class="mt-2 px-4">
            <v-skeleton-loader
              type="heading"
              width="250"
              class="mb-2"
            />
            <v-skeleton-loader
              type="text"
              width="400"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-row>

    <v-row>
      <v-container>
        <v-row>
          <!-- Sidebar skeleton - desktop -->
          <v-col
            cols="12"
            lg="3"
            class="pr-lg-6"
          >
            <div class="d-none d-lg-block">
              <!-- Order filter skeleton -->
              <v-card class="mb-6 rounded-lg elevation-1">
                <v-card-title class="subtitle-1">
                  <v-skeleton-loader
                    type="text"
                    width="100"
                    height="20"
                  />
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-2">
                  <v-skeleton-loader
                    type="list-item"
                    class="mb-1"
                  />
                  <v-skeleton-loader
                    type="list-item"
                    class="mb-1"
                  />
                  <v-skeleton-loader
                    type="list-item"
                    class="mb-1"
                  />
                  <v-skeleton-loader
                    type="list-item"
                  />
                </v-card-text>
              </v-card>

              <!-- Search skeleton -->
              <v-card class="rounded-lg elevation-1">
                <v-card-title class="subtitle-1">
                  <v-skeleton-loader
                    type="text"
                    width="80"
                    height="20"
                  />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-skeleton-loader
                    type="text-field"
                  />
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <!-- Main content skeleton -->
          <v-col
            cols="12"
            lg="9"
          >
            <!-- Mobile filters skeleton -->
            <v-row class="d-lg-none mb-4">
              <v-col cols="6">
                <v-skeleton-loader
                  type="button"
                  height="40"
                />
              </v-col>
              <v-col cols="6">
                <v-skeleton-loader
                  type="button"
                  height="40"
                />
              </v-col>
            </v-row>

            <!-- Cards grid skeleton -->
            <v-row>
              <v-col
                v-for="i in 12"
                :key="`card-${i}`"
                cols="6"
                sm="4"
                md="4"
                lg="3"
                class="pa-2"
              >
                <v-card class="rounded-lg elevation-1">
                  <v-skeleton-loader
                    type="image"
                    height="140"
                  />
                  <v-card-text class="pa-3">
                    <v-skeleton-loader
                      type="text"
                      width="100%"
                      class="mb-2"
                    />
                    <v-skeleton-loader
                      type="text"
                      width="80%"
                      class="mb-2"
                    />
                    <div class="d-flex gap-1">
                      <v-skeleton-loader
                        type="chip"
                        width="60"
                      />
                      <v-skeleton-loader
                        type="chip"
                        width="60"
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Bottom pagination skeleton -->
            <v-row class="justify-center mt-6 mb-8">
              <v-skeleton-loader
                type="text"
                width="300"
                height="40"
              />
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ProducersSkeleton'
}
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.v-card .v-card-title {
  padding: 12px 16px;
}
</style>
