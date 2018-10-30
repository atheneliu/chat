<template>
  <div class="mask" @click="onClick">
    <slot></slot>
  </div>
</template>

<script>
export default {
  mounted() {
    document.body.style.overflow = 'hidden'
  },
  destroyed() {
    document.body.style.overflow = 'visible'
  },
  methods: {
    onClick() {
      this.$emit('click')
    },
  },
}
</script>

<style scoped>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
</style>
