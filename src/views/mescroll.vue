<template>
  <div>
    <!--mescroll滚动区域的基本结构-->
    <mescroll-vue ref="mescroll" :down="mescrollDown" @init="mescrollInit">
      <!--内容...-->
      <div v-for="(item , index) in dialogueList" :key="index" class="test">{{item}}</div>
    </mescroll-vue>
  </div>
</template>
			
<script>
// 引入mescroll的vue组件
import MescrollVue from 'mescroll.js/mescroll.vue'
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'


export default {
  name: 'mescroll',
  components: {
    MescrollVue // 注册mescroll组件
  },
  computed: {
    ...mapGetters([
      'dialogueList',
      'sendStatus',
      'lastTime'
    ]),
  },
  data () {
    return {
      mescroll: null, // mescroll实例对象
      mescrollDown: { // 上拉加载的配置.
        callback: this.downCallback, // 上拉回调,此处简写; 相当于 callback: function(page, mescroll) { }
        htmlNodata: '<p class="upwarp-nodata">-- END --</p>',
      },
    }
  },
  methods: {
    // mescroll组件初始化的回调,可获取到mescroll对象
    mescrollInit (mescroll) {
      this.mescroll = mescroll
    },
    downCallback () {
      (async (lastTime) => {
        await this.getDialogueList(lastTime)
      })(this.lastTime)
      this.$nextTick(() => {
        this.mescroll.endSuccess()
      })
    },
    ...mapActions([
      'getDialogueList',
    ]),
  }
}
</script>

<style scope>
  /*通过fixed固定mescroll的高度*/
  .mescroll {
    position: fixed;
    top: 20px;
    bottom: 0;
    height: auto;
    width: 100%;
  }

  .test {
    margin: 20px 0px;
    background: pink;
    width: 100%;
    overflow: hidden;
  }
</style>