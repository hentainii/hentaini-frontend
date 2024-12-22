<template>
  <v-footer
    height="auto"
    dark
    color="grey darken-4"
    class="py-8 px-4 footer-container"
  >
    <v-container>
      <v-row>
        <!-- Left Column -->
        <v-col cols="12" md="6">
          <h2 class="mb-4 text-h5 text-uppercase font-weight-bold">
            Hentai Online in HD!
          </h2>
          <p class="mb-6">
            Our mission is to bring you the best hentai as soon as possible.
            At Hni, you can browse a wide variety of titles in our <strong><a to="/explore">Hentais Section</a></strong>,
            filtering by categories, ongoing or finished series. <strong>No censorship!</strong>
            You can also add your favorite hentais, making it easier to recall which anime you were
            “getting busy” with!
          </p>

          <h3 class="mb-2 text-h6 font-weight-medium">
            What Is Hentai?
          </h3>
          <p class="mb-6">
            Are you really reading this section? Then let’s put it simply!
            Anime porn or hentai anime, however you want to call it.
            Just like in regular anime, many hentai episodes have their own manga version—though
            that’s not a rule, it’s just common. So if you ever feel like reading some steamy manga,
            we might offer that option soon as well!
          </p>

          <h3 class="mb-2 text-h6 font-weight-medium">
            Hentai Fetishes
          </h3>
          <p>
            We’re heading into a darker zone, but it’s real, not fake—who the heck
            gets excited by tentacles?! Don’t judge me. I’m just saying this because
            it’s one of the more popular categories. Often, a girl (usually) has
            sexual relations with some kind of tentacled monster, and you know what
            happens next… So yeah, you can find this category in our directory as
            <strong><a to="/explore?genre=tentacles">Tentacles</a></strong>
          </p>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" md="6">
          <h2 class="mb-4 text-h5 text-uppercase font-weight-bold">
            Hentai Without Censorship
          </h2>
          <p class="mb-6">
            Everyone wants uncensored hentai, but that can be tricky due to the penal codes
            in Japan that prohibit the publication of “morally harmful” material. In practice,
            it means that audiovisual works can’t show the genital parts of the characters
            explicitly, leading to pixelated or blacked-out areas. (That’s why hentai has these
            sensors instead of live-action porn censorship!)
            However, at Hentaini we care about you, which is why we have a very special
            <strong>Uncensored Hentai</strong> section in our listing or <a to="/explore">Hentais Section</a>
          </p>

          <h3 class="mb-2 text-h6 font-weight-medium">
            The Most Popular Hentai Genres
          </h3>
          <p>
            Of course, everybody loves loli—actually, let’s be careful with that claim! According
            to our statistics, the most popular genres in Hentai are <strong><a to="/explore?genre=yaoi">Yaoi</a></strong> and
            <strong><a to="/explore?genre=yuri">Yuri</a></strong>. I don’t think I need to explain what each of these is. If you
            don’t know, I jokingly encourage you to exit Hentaini and go read up on it.
            Just kidding—maybe I should explain quickly:
          </p>
          <ul class="mb-4 ml-4">
            <li><strong>Yaoi:</strong> Boys having relationships with boys!</li>
            <li><strong>Yuri:</strong> Girls hooking up with girls — you could call it “bread with bread”!</li>
          </ul>
          <p>
            If I’m wrong about any of this, feel free to correct me!
          </p>

          <!-- A little branding or logo at the bottom, if desired -->
          <div class="text-center mt-8">
            <LayoutLogo />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: 'SiteFooter'
}
</script>

<style scoped>
.footer-container {
  /* Adjust spacing, text color, or background images if desired */
  background-color: #1e1e1e;
  color: #eee;
}

.text-uppercase {
  text-transform: uppercase;
}

.text-h5 {
  font-size: 1.25rem;
}

.text-h6 {
  font-size: 1.125rem;
}
</style>
