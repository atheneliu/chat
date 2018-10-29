<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    name: 'app',
    methods: {
      ...mapActions([
        'getUserInfo',
      ]),
    },
    async created() {
      this.getUserInfo()
    }
  }
</script>

<style>
#app {
  font-size: 12px;
  height: 100%;
  background: #f3f4f5;
}
</style>
