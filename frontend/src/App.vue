<template>
  <div class="app">
    <header>
      <RouterLink to="/"><strong>Enchères publiques</strong></RouterLink>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
body { margin: 0; font-family: system-ui, sans-serif; color: #222; }
.app { max-width: 780px; margin: 0 auto; padding: 0 16px; }
header { padding: 16px 0; border-bottom: 1px solid #eee; margin-bottom: 24px; }
header a { text-decoration: none; color: inherit; }
h1 { font-size: 22px; }
</style>