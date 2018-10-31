<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    name: 'app',
    computed: {
      ...mapGetters([
        'userInfo',
      ]),
    },
    methods: {
      ...mapActions([
        'getUserInfo',
      ]),
    },
    async created() {
      await this.getUserInfo()
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
