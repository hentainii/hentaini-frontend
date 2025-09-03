<template>
  <v-footer
    height="auto"
    dark
    color="grey darken-4"
    class="py-8 px-4 footer-container"
  >
    <v-container fluid>
      <v-row>
        <!-- Left Column -->
        <v-col cols="12" md="6" class="content-col left-col">
          <h2 class="mb-4 text-h5 text-uppercase font-weight-bold section-title">
            Hentai Online in HD!
          </h2>
          <p class="mb-6 section-text">
            Our mission is to bring you the best hentai as soon as possible.
            At Hni, you can browse a wide variety of titles in our <strong><a to="/explore">Hentais Section</a></strong>,
            filtering by categories, ongoing or finished series. <strong>No censorship!</strong>
            You can also add your favorite hentais, making it easier to recall which anime you were
            "getting busy" with!
          </p>

          <h3 class="mb-2 text-h6 font-weight-medium subsection-title">
            What Is Hentai?
          </h3>
          <p class="mb-6 section-text">
            Are you really reading this section? Then let's put it simply!
            Anime porn or hentai anime, however you want to call it.
            Just like in regular anime, many hentai episodes have their own manga version—though
            that's not a rule, it's just common. So if you ever feel like reading some steamy manga,
            we might offer that option soon as well!
          </p>

          <h3 class="mb-2 text-h6 font-weight-medium subsection-title">
            Hentai Fetishes
          </h3>
          <p class="section-text">
            We're heading into a darker zone, but it's real, not fake—who the heck
            gets excited by tentacles?! Don't judge me. I'm just saying this because
            it's one of the more popular categories. Often, a girl (usually) has
            sexual relations with some kind of tentacled monster, and you know what
            happens next… So yeah, you can find this category in our directory as
            <strong><a to="/explore?genre=tentacles">Tentacles</a></strong>
          </p>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" md="6" class="content-col right-col">
          <h2 class="mb-4 text-h5 text-uppercase font-weight-bold section-title">
            Hentai Without Censorship
          </h2>
          <p class="mb-6 section-text">
            Everyone wants uncensored hentai, but that can be tricky due to the penal codes
            in Japan that prohibit the publication of "morally harmful" material. In practice,
            it means that audiovisual works can't show the genital parts of the characters
            explicitly, leading to pixelated or blacked-out areas. (That's why hentai has these
            sensors instead of live-action porn censorship!)
            However, at Hentaini we care about you, which is why we have a very special
            <strong>Uncensored Hentai</strong> section in our listing or <a to="/explore">Hentais Section</a>
          </p>

          <h3 class="mb-2 text-h6 font-weight-medium subsection-title">
            The Most Popular Hentai Genres
          </h3>
          <p class="section-text">
            Of course, everybody loves loli—actually, let's be careful with that claim! According
            to our statistics, the most popular genres in Hentai are <strong><a to="/explore?genre=yaoi">Yaoi</a></strong> and
            <strong><a to="/explore?genre=yuri">Yuri</a></strong>. I don't think I need to explain what each of these is. If you
            don't know, I jokingly encourage you to exit Hentaini and go read up on it.
            Just kidding—maybe I should explain quickly:
          </p>
          <ul class="mb-4 ml-4 genre-list">
            <li><strong>Yaoi:</strong> Boys having relationships with boys!</li>
            <li><strong>Yuri:</strong> Girls hooking up with girls — you could call it "bread with bread"!</li>
          </ul>
          <p class="section-text">
            If I'm wrong about any of this, feel free to correct me!
          </p>

          <!-- Logo at the bottom -->
          <div class="text-center mt-8 logo-container">
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
  background-color: #1e1e1e;
  color: #eee;
  position: relative;
  overflow: hidden;
}

.footer-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--v-primary-base), #6B66FF, var(--v-primary-base));
  background-size: 200% 100%;
  animation: gradientMove 8s linear infinite;
}

.content-col {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s forwards;
}

.left-col {
  animation-delay: 0.2s;
}

.right-col {
  animation-delay: 0.4s;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--v-primary-base);
  border-radius: 3px;
}

.subsection-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: #e0e0e0;
}

.section-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #bdbdbd;
  transition: color 0.3s ease;
}

.section-text:hover {
  color: white;
}

.genre-list li {
  margin-bottom: 8px;
  position: relative;
  padding-left: 16px;
}

.genre-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--v-primary-base);
}

.logo-container {
  margin-top: 2rem;
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1);
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}
</style>
