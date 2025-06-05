<template>
  <v-container fluid>
    <v-row>
      <v-container class="pb-0">
        <v-row>
          <v-col cols="12" class="mt-4 px-4">
            <v-skeleton-loader
              type="heading"
              class="mb-2"
            />
            <v-skeleton-loader
              type="text"
              width="60%"
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
            class="pr-lg-6 d-none d-lg-block"
          >
            <v-card class="mb-6 rounded-lg elevation-1">
              <v-card-title>
                <v-skeleton-loader type="text" width="80%" />
              </v-card-title>
              <v-divider />
              <v-list dense class="py-0">
                <v-list-item v-for="i in 2" :key="`view-${i}`">
                  <v-list-item-icon class="mr-2">
                    <v-skeleton-loader type="avatar" width="24" height="24" />
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-skeleton-loader type="text" width="70%" />
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>

            <v-card class="mb-6 rounded-lg elevation-1">
              <v-card-title>
                <v-skeleton-loader type="text" width="60%" />
              </v-card-title>
              <v-divider />
              <v-list dense class="py-0">
                <v-list-item v-for="i in 4" :key="`order-${i}`">
                  <v-list-item-icon class="mr-2">
                    <v-skeleton-loader type="avatar" width="24" height="24" />
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-skeleton-loader type="text" width="80%" />
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>

            <v-card class="rounded-lg elevation-1">
              <v-card-title>
                <v-skeleton-loader type="text" width="50%" />
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-skeleton-loader type="text-field" />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Mobile filter buttons skeleton -->
          <v-col cols="12" class="d-lg-none px-4 mb-3">
            <v-row class="mx-n1 mb-2">
              <v-col v-for="i in 3" :key="`mobile-filter-${i}`" cols="4" class="pa-1">
                <v-skeleton-loader
                  type="button"
                  height="42"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- Content grid skeleton -->
          <v-col
            cols="12"
            lg="9"
          >
            <!-- Pagination skeleton -->
            <v-row class="justify-center mb-4">
              <v-skeleton-loader
                type="text"
                width="300"
                height="40"
              />
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
                    />
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
  name: 'StudiosSkeleton'
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
