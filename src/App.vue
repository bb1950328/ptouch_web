<template>
  <Suspense>
    <AppImpl />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script>
import AppImpl from "@/AppImpl.vue";

export default {
  name: 'App',
  components: {AppImpl},
}
</script>

<style scoped>

</style>
