<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template #activator="{ on: onDialog, attrs }">
        <v-tooltip bottom>
          <template #activator="{ on: onTootip }">
            <v-btn
              color="red lighten-2 ml-2 mt-2"
              v-bind="attrs"
              v-on="{...onDialog, ...onTootip}"
            >
              <v-icon>mdi-flag</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('episode.report.title') }}</span>
        </v-tooltip>
      </template>

      <v-card>
        <v-alert
          v-if="error"
          type="error"
          dismissible
          colored
          outlined
          dark
          elevation="2"
          icon="mdi-alert"
        >
          {{ $t('episode.report.already_reported') }}
        </v-alert>
        <v-card-title class="text-h5">
          {{ $t('episode.report.title') }}
        </v-card-title>

        <v-card-text v-if="!sent">
          <v-radio-group v-model="reason" @change="error = false">
            <v-radio
              :label="$t('episode.report.reasons.a')"
              value="broken-players"
            />
            <v-radio
              :label="$t('episode.report.reasons.b')"
              value="broken-subs"
            />
            <v-radio
              :label="$t('episode.report.reasons.c')"
              value="broken-audio"
            />
          </v-radio-group>
          <v-textarea
            v-model="details"
            :label="$t('episode.report.details')"
            outlined
            rows="3"
            clearable
            max="200"
            :rules="rules"
          />
          <p>{{ $t('episode.report.info') }}</p>
        </v-card-text>
        <v-card-text v-else>
          <v-alert
            type="success"
            dismissible
            colored
            outlined
            dark
            elevation="2"
            icon="mdi-check"
          >
            {{ $t('episode.report.success') }}
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="!sent"
            color="primary"
            text
            @click="reportEpisode"
          >
            {{ $t('episode.report.submit') }}
          </v-btn>
          <v-btn
            v-else
            color="primary"
            text
            @click="dialog = false, sent = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: {
    episode: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      dialog: false,
      reason: null,
      details: null,
      error: false,
      errorMessage: '',
      sent: false,
      rules: [
        v => (v && v.length <= 200) || 'Details must be less than 200 characters'
      ]
    }
  },
  methods: {
    reportEpisode () {
      if (!this.reason) {
        this.error = true
        this.errorMessage = 'Please select a reason'
        return
      }
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          episode: this.episode.id,
          reason: this.reason,
          fixed: false
        }
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}reports?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(({ data: reports }) => {
          if (reports.length > 9) {
            this.error = true
            this.errorMessage = 'This episode has reached the maximum number of reports'
            return
          }
          fetch(`${this.$config.API_STRAPI_ENDPOINT}reports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: {
                reason: this.reason,
                details: this.details,
                episode: this.episode.id,
                user: this.$store.state.auth.id || null
              }
            })
          })
            .then(res => res.json())
            .then((_) => {
              this.sent = true
              this.error = false
              this.reason = null
              this.details = null
            })
        })
    }
  }
}
</script>
