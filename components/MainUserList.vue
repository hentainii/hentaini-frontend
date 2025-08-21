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
          :page.sync="page"
          :items-per-page.sync="itemsPerPage"
          hide-default-footer
          class="elevation-1"
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
      pagination: {
        page: 1,
        itemsPerPage: 10
      }
    }
  },
  computed: {
    users () {
      return this.$store.state.user.users
    },
    page: {
      get () {
        return this.pagination.page
      },
      set (value) {
        this.pagination.page = value
      }
    },
    itemsPerPage: {
      get () {
        return this.pagination.itemsPerPage
      },
      set (value) {
        this.pagination.itemsPerPage = value
      }
    },
    pageCount () {
      return this.$store.state.user.usersListPagination.pageCount || 0
    }
  },
  watch: {
    'pagination.page': {
      handler () {
        this.getUsers()
      },
      deep: false
    },
    'pagination.itemsPerPage': {
      handler () {
        this.pagination.page = 1
        this.getUsers()
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
