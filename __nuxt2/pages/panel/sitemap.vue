<template>
  <v-card>
    <v-card-title>
      Sitemap Generator
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                <h2>Generate Sitemap</h2>
              </v-card-title>
              <v-card-text>
                Serie count {{ series.length }} - episode count {{ episodes.length }}
              </v-card-text>
              <v-card-text>
                <v-btn
                  color="primary"
                  @click="generateSitemap"
                >
                  Update Sitemap
                </v-btn>
              </v-card-text>
              <v-card-text>
                <span>Last updated</span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  layout: 'panel',
  middleware: 'authenticated',
  data () {
    return {
      series: [],
      episodes: []
    }
  },
  async mounted () {
    await this.getSeries()
    await this.getEpisodes()
  },
  methods: {
    async getSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        pagination: {
          limit: 1000
        }
      })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
      const series = await res.json()
      this.series = series.data
    },
    async getEpisodes () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'serie'
        ],
        pagination: {
          limit: 10000
        }
      })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
      const episodes = await res.json()
      this.episodes = episodes.data
    },
    generateSitemap () {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://hentaini.com</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
          </url>
          <url>
            <loc>https://hentaini.com/explore</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
          </url>
          ${this.series.map(serie => `
          <url>
            <loc>https://hentaini.com/h/${serie.url}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
          </url>
          `).join('')}
          ${this.episodes.map(episode => `
          <url>
            <loc>https://hentaini.com/h/${episode.serie?.url}/${episode.episode_number}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.5</priority>
          </url>
          `).join('')}
        </urlset>`
      fetch(`${this.$config.API_STRAPI_ENDPOINT}sitemap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: JSON.stringify({
          sitemap
        })
      })
    }
  }
}
</script>

<style>

</style>
