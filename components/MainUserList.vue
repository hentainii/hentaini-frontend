<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search by Username or Email"
          single-line
          outlined
          hide-details="auto"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="users"
          :search="search"
          :options="pagination"
          :page.sync="page"
          :items-per-page="itemsPerPage"
          hide-default-footer
          class="elevation-1"
          @page-count="pageCount = $event"
        >
          <template #[`item.actions`]="{ item }">
            <v-btn
              small
              :to="`/panel/user/${item.id}/edit`"
            >
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="6"
          circle
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  data () {
    return {
      search: '',
      headers: [
        {
          text: 'Username',
          align: 'start',
          sortable: false,
          value: 'username'
        },
        { text: 'Email', value: 'email' },
        { text: 'Actions', value: 'actions' }
      ],
      page: 1,
      pageCount: 0,
      itemsPerPage: 10
    }
  },
  computed: {
    users () {
      return this.$store.state.user.users
    }
  },
  watch: {
    '$store.state.user.userListPagination' (val) {
      Object.assign(this.pagination, val)
    },
    'pagination.page': {
      handler () {
        this.getSeries()
      },
      deep: false
    }
  },
  mounted () {
    this.getUsers()
  },
  methods: {
    getUsers () {
      this.$store.dispatch('user/getUsers', {
        token: this.$store.state.auth.token,
        pagination: this.pagination
      })
    }
  }
}
</script>
