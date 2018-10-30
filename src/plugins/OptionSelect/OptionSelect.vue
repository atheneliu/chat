<template>
  <mask-wrapper v-show="show" @click="close">
    <div class="wrapper" @click.stop>
      <div
        class="each-option"
        v-for="(option, index) in options"
        :key="index"
        @click="onResult(index)">
        {{ option.title }}
      </div>
      <div :class="{ 'each-option': true, cancel: true }" @click="close">取消</div>
    </div>
  </mask-wrapper>
</template>

<script>
import MaskWrapper from '../Mask.vue'

export default {
  data() {
    return {
      show: false,
      options: [],
    }
  },
  components: {
    MaskWrapper,
  },
  methods: {
    close() {
      this.show = false
    },
    onResult(index) {
      const handler = this.options[index].onClick
      if (handler) {
        handler(this.close)
      } else {
        this.close()
      }
    },
  },
}
</script>

<style scoped>
.wrapper {
  width: 100%;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  background: #fff;
  font-size: 18px;
}

.each-option {
  color: rgb(80, 88, 100);
  font-size: 16;
  letter-spacing: 1;
  background-color: #fff;
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: 1px solid rgba(200, 199, 204, 0.5);
  text-align: center;
}


.cancel {
  border-top: 10px solid rgba(0, 0, 0, 0.3);
}

</style>
