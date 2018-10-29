<template>
  <div class="feedback" @scroll="scroll">
    <div class="content" ref="dialog" id="myData">
      <div v-if="!dialogueList.length" class="tips">
        <p>吐槽不好用的功能、有错误的内容、报告您发现的问题，我们将为您不断改进。</p>
        <p><a href="tel:400-686-9762">400-686-9762</a></p>
      </div>
      <pull-refresh :next="refresh">
        <ul v-change1 id="myUl" slot="list">
          <li :class="item.type === 2 ? 'right' : 'left'" v-for="(item,index) in dialogueList" :key="index" class="item">
            <img class="avatar" src="">
            <span class="msg">{{item.message}}</span>
          </li>
        </ul>
      </pull-refresh>
    </div>
    <div class="comment-btn" @click="closeComment">
      <img src="" alt="" class="comment-right">
      <div class="comment-left">请输入产品使用的问题、建议...</div>
    </div>
    <div class="mask" v-if="showComment" @click.self="closeComment">
      <div class="comment-box">
        <div class="btn-group">
          <button class="cancel-btn" @click="closeComment">取消</button>
          <button class="send-btn" @click="sendMessage({ inputValue })">发送</button>
        </div>
        <textarea class="comment-input" placeholder="请输入产品使用的问题、建议..." v-model="inputValue"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
  // eslint-disable-next-line
  import { Feedback } from '@/constants/ActionTypes.js'
  import pullRefresh from '../components/PullFresh'

  let height = 0
  export default {
    name: 'Feedback',
    created() {
      this.getDialogueList()
    },
    components: {
      pullRefresh
    },
    watch: {
      // 监听发送状态，成功时关闭 输入框，自动滚动到最底部
      sendStatus: function (val) {
        if (val) {
          this.showComment = false
          this.scrollToBottom()
          this.initSendStatus()
        }
      }
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'dialogueList',
        'sendStatus',
        'lastTime'
      ])
    },
    async mounted() {
       window.addEventListener('scroll', this.scroll)
    },
    data() {
      return {
        showComment: false,
        inputValue: '',
      }
    },
    methods: {
      ...mapMutations({
        initSendStatus: Feedback.INIT_SENDSTATUS,
      }),
      ...mapActions([
        'getDialogueList',
        'sendMessage',
      ]),
      closeComment() {
        this.showComment = !this.showComment
        this.inputValue = ''
      },
      scrollToBottom() {
        console.log('scrollToBottom-->')
        document.getElementById('myData').scrollTop = document.getElementById('myData').scrollHeight
      },
      scroll() {
        console.log('scrollToTop-->', this.$el.scrollTop, this.$el.scrollHeight, this.$el.offsetHeight)
      },
      async refresh() {
       await this.getDialogueList(this.lastTime)
      }
    },
    directives: {
      change1: {
        inserted(el) {
          console.log(height)
          height += +el.scrollHeight
          document.getElementById('myData').scrollTop = height
        },
      },
    },
  }
</script>

<style lang="scss" scoped>

  .tips {
    text-align: center;
    margin-top: 1.2rem;
    font-size: 15px;
    line-height: 30px;

    p {
      line-height: 30px;
    }
  }


  .loading {
    width: 100%;
    height: 1rem;
    line-height: 1rem;
    text-align: center;
    background: pink;
  }

  .content {
    margin-bottom: 1rem;
  }

  .feedback {
    position: relative;
    padding: 0.2rem;
  }

  .comment-btn {
    position: fixed;
    // height: 1.75rem;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background: rgb(246, 247, 248);
    box-shadow: rgb(228, 230, 233) 0px -1px 0px 0px;
    align-items: center;
    padding: 0.16rem 0.2rem;
    display: flex;
    align-items: center;

    .comment-left {
      // margin: 0.15rem 0px;
      background: rgb(255, 255, 255);
      color: rgb(187, 187, 187);
      // height: 2rem;
      // line-height: 2rem;
      border: 1px solid rgb(198, 202, 206);
      border-radius: 100px;
      padding: 0.1rem 0.2rem;
      font-size: 16px;
      flex: 1 1 0%;
    }

    img {
      width: 0.45rem;
      height: 0.45rem;
      background: pink;
      margin-right: 0.1rem;
    }
  }

  .mask {
    height: 100%;
    background: rgba(225, 225, 225, 0.8);
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    justify-content: center;
    padding-top: 60px;
  }

  .comment-box {
    margin: 0.48rem 0.5rem;
    border-radius: 4px;
    overflow: hidden;
    background: white;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-flex: 1;
    -ms-flex: 1 1 0%;
    flex: 1 1 0%;
    padding: 0.1rem;
  }

  .btn-group {
    padding: 0.12rem;
    display: flex;
    justify-content: space-between;

    button {
      text-align: center;
      height: 0.5rem;
      border: none;
      display: block;
      padding: 0.1rem 0.2rem;
      border-radius: 4px;
      line-height: 0.14rem;
      font-size: 13px;
      letter-spacing: 2px;
    }

    .cancel-btn {
      color: rgb(102, 102, 102);
      background-color: rgb(238, 238, 238);
    }

    .send-btn {
      color: rgb(255, 255, 255);
      background-color: rgb(87, 173, 87);
    }
  }

  .comment-input {
    height: 1.8rem;
    resize: none;
    border: none;
    outline: none;
    padding: 0.2rem;
    -webkit-box-flex: 1;
    -ms-flex: 1 1 0%;
    flex: 1 1 0%;
    font-size: 0.14rem;
    width: 100%;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  .item {
    padding: 0.15rem 0;
  }

  .left {
    display: block;
    overflow: hidden;
    line-height: 0.75rem;
  }

  .right {
    display: block;
    overflow: hidden;
    line-height: 0.75rem;
  }

  .avatar {
    float: left;
    width: 0.75rem;
    height: 0.75rem;
  }

  .right .avatar {
    margin-right: 0.3rem;
  }

  .left .avatar {
    float: right;
    margin-left: 0.3rem;
  }

  .left .msg {
    float: right;
  }
  
</style>

