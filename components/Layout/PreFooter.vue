<template>
  <footer class="relative overflow-hidden bg-neutral-900 text-neutral-100 py-12 px-4">
    <!-- Animated gradient bar -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary animate-gradientMove"></div>
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
      <!-- Left Column -->
      <div class="flex-1 opacity-0 translate-y-5 animate-fadeUp animation-delay-200">
        <h2 class="mb-4 text-2xl font-extrabold uppercase tracking-wide section-title">
          Hentai Online in HD!
        </h2>
        <p class="mb-6 text-base leading-relaxed text-neutral-300 hover:text-white transition">
          Our mission is to bring you the best hentai as soon as possible.
          At Hni, you can browse a wide variety of titles in our
          <strong><NuxtLink to="/explore" class="text-primary underline">Hentais Section</NuxtLink></strong>,
          filtering by categories, ongoing or finished series. <strong>No censorship!</strong>
          You can also add your favorite hentais, making it easier to recall which anime you were
          "getting busy" with!
        </p>
        <h3 class="mb-2 text-lg font-semibold text-neutral-200">What Is Hentai?</h3>
        <p class="mb-6 text-base leading-relaxed text-neutral-300 hover:text-white transition">
          Are you really reading this section? Then let's put it simply!
          Anime porn or hentai anime, however you want to call it.
          Just like in regular anime, many hentai episodes have their own manga version—though
          that's not a rule, it's just common. So if you ever feel like reading some steamy manga,
          we might offer that option soon as well!
        </p>
        <h3 class="mb-2 text-lg font-semibold text-neutral-200">Hentai Fetishes</h3>
        <p class="text-base leading-relaxed text-neutral-300 hover:text-white transition">
          We're heading into a darker zone, but it's real, not fake—who the heck
          gets excited by tentacles?! Don't judge me. I'm just saying this because
          it's one of the more popular categories. Often, a girl (usually) has
          sexual relations with some kind of tentacled monster, and you know what
          happens next… So yeah, you can find this category in our directory as
          <strong><NuxtLink to="/explore?genre=tentacles" class="text-primary underline">Tentacles</NuxtLink></strong>
        </p>
      </div>
      <!-- Right Column -->
      <div class="flex-1 opacity-0 translate-y-5 animate-fadeUp animation-delay-400">
        <h2 class="mb-4 text-2xl font-extrabold uppercase tracking-wide section-title">
          Hentai Without Censorship
        </h2>
        <p class="mb-6 text-base leading-relaxed text-neutral-300 hover:text-white transition">
          Everyone wants uncensored hentai, but that can be tricky due to the penal codes
          in Japan that prohibit the publication of "morally harmful" material. In practice,
          it means that audiovisual works can't show the genital parts of the characters
          explicitly, leading to pixelated or blacked-out areas. (That's why hentai has these
          sensors instead of live-action porn censorship!)
          However, at Hentaini we care about you, which is why we have a very special
          <strong>Uncensored Hentai</strong> section in our listing or <NuxtLink to="/explore" class="text-primary underline">Hentais Section</NuxtLink>
        </p>
        <h3 class="mb-2 text-lg font-semibold text-neutral-200">The Most Popular Hentai Genres</h3>
        <p class="text-base leading-relaxed text-neutral-300 hover:text-white transition">
          Of course, everybody loves loli—actually, let's be careful with that claim! According
          to our statistics, the most popular genres in Hentai are <strong><NuxtLink to="/explore?genre=yaoi" class="text-primary underline">Yaoi</NuxtLink></strong> and
          <strong><NuxtLink to="/explore?genre=yuri" class="text-primary underline">Yuri</NuxtLink></strong>. I don't think I need to explain what each of these is. If you
          don't know, I jokingly encourage you to exit Hentaini and go read up on it.
          Just kidding—maybe I should explain quickly:
        </p>
        <ul class="mb-4 ml-4 list-disc text-neutral-300">
          <li><strong>Yaoi:</strong> Boys having relationships with boys!</li>
          <li><strong>Yuri:</strong> Girls hooking up with girls — you could call it \"bread with bread\"!</li>
        </ul>
        <p class="text-base leading-relaxed text-neutral-300 hover:text-white transition">
          If I'm wrong about any of this, feel free to correct me!
        </p>
        <div class="text-center mt-8 scale-90 hover:scale-100 transition-transform duration-300">
          <LayoutLogo />
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
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
.animate-fadeUp {
  animation: fadeUp 0.8s forwards;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}
.animation-delay-400 {
  animation-delay: 0.4s;
}
.animate-gradientMove {
  background-size: 200% 100%;
  animation: gradientMove 8s linear infinite;
}
.bg-primary {
  /* Usa tu color primario de Tailwind aquí, o personalízalo en tailwind.config.js */
  background-color: #0072ef;
}
.text-primary {
  color: #0072ef;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: #0072ef;
  border-radius: 3px;
}
</style>
