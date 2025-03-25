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
              class="mt-2"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-row>

    <v-row>
      <v-container>
        <v-row>
          <!-- Sidebar skeleton -->
          <v-col
            cols="12"
            lg="3"
            class="pr-lg-6"
          >
            <div class="d-none d-lg-block sticky-sidebar">
              <v-card class="mb-6 rounded-lg elevation-1">
                <v-card-title class="subtitle-1 font-weight-bold">
                  <v-skeleton-loader type="text" width="80" />
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="py-0">
                  <v-list-item
                    v-for="n in 3"
                    :key="`filter-${n}`"
                  >
                    <v-list-item-icon class="mr-2">
                      <v-skeleton-loader type="avatar" width="20" height="20" />
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-skeleton-loader type="text" width="120" />
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>

              <v-card class="mb-6 rounded-lg elevation-1">
                <v-card-title class="subtitle-1 font-weight-bold">
                  <v-skeleton-loader type="text" width="100" />
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="py-0">
                  <v-list-item
                    v-for="n in 2"
                    :key="`order-${n}`"
                  >
                    <v-list-item-icon class="mr-2">
                      <v-skeleton-loader type="avatar" width="20" height="20" />
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-skeleton-loader type="text" width="100" />
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>

              <v-card class="rounded-lg elevation-1">
                <v-card-title class="subtitle-1 font-weight-bold">
                  <v-skeleton-loader type="text" width="60" />
                </v-card-title>
                <v-divider></v-divider>
                <v-list dense class="py-0" style="max-height: 300px;">
                  <v-list-item
                    v-for="n in 6"
                    :key="`genre-${n}`"
                  >
                    <v-list-item-icon class="mr-2">
                      <v-skeleton-loader type="avatar" width="20" height="20" />
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-skeleton-loader type="text" width="80" />
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </div>
          </v-col>

          <!-- Mobile filter buttons skeleton -->
          <v-col cols="12" class="d-lg-none px-4 mb-3">
            <v-row class="mx-n1 mb-2">
              <v-col cols="6" class="pa-1">
                <v-skeleton-loader
                  type="button"
                  class="rounded-lg"
                  height="42"
                />
              </v-col>
              <v-col cols="6" class="pa-1">
                <v-skeleton-loader
                  type="button"
                  class="rounded-lg"
                  height="42"
                />
              </v-col>
            </v-row>
            <v-row class="mx-n1">
              <v-col cols="12" class="pa-1">
                <v-skeleton-loader
                  type="button"
                  class="rounded-lg"
                  height="42"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- Series grid skeleton -->
          <v-col
            cols="12"
            lg="9"
          >
            <!-- Series grid pagination skeleton -->
            <v-row class="justify-center mb-4">
              <v-skeleton-loader
                type="button, button, button"
                class="d-flex justify-center"
                width="200"
              />
            </v-row>

            <!-- Series grid skeleton -->
            <v-row>
              <v-col
                v-for="n in 12"
                :key="`card-${n}`"
                cols="6"
                sm="4"
                md="4"
                lg="3"
                class="pa-2"
              >
                <v-card class="rounded-lg elevation-1">
                  <v-skeleton-loader
                    type="image, list-item-two-line"
                    class="mx-auto"
                    height="280"
                  />
                </v-card>
              </v-col>
            </v-row>

            <!-- Bottom pagination skeleton -->
            <v-row class="justify-center mt-6 mb-8">
              <v-skeleton-loader
                type="button, button, button"
                class="d-flex justify-center"
                width="200"
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
  name: 'ExploreSkeleton'
}
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.v-card .v-card-title {
  padding: 12px 16px;
}

.sticky-sidebar {
  position: sticky;
  top: 16px;
  height: calc(100vh - 32px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  padding-right: 8px;
}

.sticky-sidebar::-webkit-scrollbar {
  width: 5px;
}

.sticky-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sticky-sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>
