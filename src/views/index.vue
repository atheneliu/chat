<template>
  <div class="feedback" >
    <div class="content" ref="dialog" id="myData">
      <div v-if="!dialogueList.length" class="tips">
        <p>吐槽不好用的功能、有错误的内容、报告您发现的问题，我们将为您不断改进。</p>
        <p><a href="tel:400-686-9762">400-686-9762</a></p>
      </div>
      <mescroll-vue ref="mescroll" :down="mescrollDown" @init="mescrollInit">
        <!-- <div v-change1 id="myUl" slot="list"> -->
        <section v-for="(item,index) in dialogueList" :key="index">
          <div class="time" v-if="showTime(index)">{{item.createdAt | formatDate}}</div>
          <div :class="item.type === Literal.MESSAGE_USER ? 'right' : 'left'" class="item">
            <img class="avatar" :src="item.type === Literal.MESSAGE_USER ? (userInfo.avatar || userPic) : adminPic">
            <div class="msg-box">
              <div class="msg-pic" v-if="item.messageType === Literal.MESSAGE_PIC">
                <img 
                  :src="item"
                  v-for="(item,imageIndex) in JSON.parse(item.imageUrl)" 
                  :key="item"
                  @click="browseImage(index, imageIndex)"
                />
              </div>
              <div class="msg-link" v-if="item.messageType === Literal.MESSAGE_CASE">
                <p v-html="formatMsg(item.message)"></p>
                <a @click="openCase(item.caseId)" style="color: rgb(252, 145, 83)">点击前往 ></a>
              </div>
              <div class="msg-link" v-if="item.messageType === Literal.MESSAGE_WEBVIEW">
                <p v-html="formatMsg(item.message)"></p>
                <a :href="item.locationUrl" style="color: rgb(252, 145, 83)">点击前往 ></a>`
              </div>
              <div class="msg-link" v-if="item.messageType === Literal.MESSAGE_CIRCLE">
                  <p v-html="formatMsg(item.message)"></p>
                  <a style="color: rgb(252, 145, 83)" @click="goCirCle(item.locationUrl)">点击前往 ></a>
              </div>
              <div class="msg-link" v-if="item.messageType === Literal.MESSAGE_TEXT_PIC">
                  <!-- <a :href="item.url" @click="saTrack(item)"> -->
                  <a @click="saTrack(item)">
                    <header>{{item.title}}</header>
                    <p v-html="formatMsg(item.message)"></p>
                    <img v-if="item.imageUrl" :src="item.imageUrl" >
                  </a>
              </div>
              <div class="msg-default" v-else>
                <p v-html="formatMsg(item.message)"></p>
              </div>
            </div>
          </div>
        </section>
        <!-- </div> -->
       </mescroll-vue>
    </div>
    <div class="comment-btn">
      <img :src="uploadPic" alt="" class="comment-right" @click="postImageMessage">
      <div class="comment-left" @click="closeComment">请输入产品使用的问题、建议...</div>
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
  import moment from 'moment'
  // eslint-disable-next-line
  import { Feedback } from '@/constants/ActionTypes.js'
  import pullRefresh from '../components/PullFresh'
  // eslint-disable-next-line
  import Literal from '@/constants/Literal'
  import formatDate from '@/utils/formatDate'
  import { isArray, checkUrl } from '@/utils/lang'
  import R from 'ramda'
  import adminPic from '../assets/admin_default.png'
  import userPic from '../assets/user_default.png'
  import uploadPic from '../assets/upload.png'
  import MescrollVue from 'mescroll.js/mescroll.vue'



  let height = 0
  export default {
    name: 'Feedback',
    created() {
      this.getDialogueList()
    },
    components: {
      MescrollVue // 注册mescroll组件
    },
    watch: {
      // 监听发送状态，成功时关闭 输入框，自动滚动到最底部
      sendStatus: function (val) {
        if (val) {
          this.showComment = false
          // this.scrollToBottom()
          this.initSendStatus()
        }
      }
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'dialogueList',
        'sendStatus',
        'lastTime',
        'newMessageFlag',
        'isLoadedNewMessage'
      ]),
    },
    filters: {
      formatDate(time) {
        return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss');
      }
    },
    async mounted() {
      this.getNoRead()
      //  window.addEventListener('scroll', this.scroll)
    },
    data() {
      return {
        showComment: false,
        inputValue: '',
        Literal,
        adminPic,
        userPic,
        uploadPic,
        mescroll: null, // mescroll实例对象
        mescrollDown: { // 上拉加载的配置.
          callback: this.downCallback, // 上拉回调,此处简写; 相当于 callback: function(page, mescroll) { }
          htmlNodata: '<p class="upwarp-nodata">-- END --</p>',
        },
        limit: 9,
        timer: null,
      }
    },
    methods: {
      ...mapMutations({
        initSendStatus: Feedback.INIT_SENDSTATUS,
      }),
      ...mapActions([
        'getDialogueList',
        'sendMessage',
        'recordData',
        'getNewMessages',
      ]),
      closeComment() {
        this.showComment = !this.showComment
        this.inputValue = ''
      },
      scrollToBottom() {
        // console.log('scrollToBottom-->')
        // document.getElementById('myData').scrollTop = document.getElementById('myData').scrollHeight
      },
      scroll() {
        // console.log('scrollToTop-->', this.$el.scrollTop, this.$el.scrollHeight, this.$el.offsetHeight)
      },
      async refresh() {
       await this.getDialogueList(this.lastTime)
      },
      showTime(index) {
        const nowItem = this.dialogueList[index]
        const nowTime = new Date(nowItem.createdAt).getTime()
        const preTime = this.dialogueList[index - 1] ? new Date(this.dialogueList[index - 1].createdAt).getTime() : nowTime
        // 第一条+图文消息+间隔三分钟的消息 显示时间
        return nowItem.isFirst || nowItem.messageType === Literal.MESSAGE_TEXT_PIC || (nowTime - preTime) / 1000 > 180
      },
      formatMsg(message) {
        if (!message) return
        // 将文字中的链接替换出来：实现文本中的连接可以跳转
        const optLinks = isArray(message.match(Literal.urlRegex)) ? message.match(Literal.urlRegex).map(item => (`<a href="${item}">${item}</a>`)) : ''
        const otherContents = message.replace(Literal.urlRegex, '|&&|').split('|&&|')
        return otherContents.map((content, index) => {
          const textBr = content.replace(Literal.brRegex, '<br/>').split('<br/>')
          const textP = isArray(textBr) && textBr.map((item) => (`<p>${item}</p>`))

          const fontMsg = isArray(textP) && textP.join('') || content
          const linkMsg = isArray(optLinks) && optLinks[index] || ''
          // console.log('fontMsg-->', fontMsg, linkMsg, optLinks)
          return fontMsg + linkMsg
        }).join('')
      },
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
      postImageMessage() {
        this.$optionSelect([
          { title: '拍照', onClick: this.takePictureClick },
          { title: '相册', onClick: this.selectPictureClick }
        ])
      },
      async takePictureClick(closeOptions) {
        closeOptions()
        const res = await window.$bridge.takePicture(this.limit)
        const imageUrl = await this.uploadImages(res)
        this.sendMessage({ imageUrl, messageType: Literal.MESSAGE_PIC })
      },
      async selectPictureClick(closeOptions) {
        closeOptions()
        const res = await window.$bridge.selectPicture(this.limit)
        const imageUrl = await this.uploadImages(res)
        this.sendMessage({ imageUrl, messageType: Literal.MESSAGE_PIC })
      },
      async uploadImages(res) {
        // 拿到图片后直接上传
        const { uploadDomain, userId } = this.userInfo
        const imageKeys = res.images.map(({ filename }) => filename)
        const bizUid = String(Date.now())
        await bridge.uploadImage({
          images: imageKeys,
          bizUid,
          bucket: 'feedback',
        })
        return imageKeys.map(key => `${uploadDomain}${userId}/${bizUid}/${key}`)
      },
      browseImage(index, imageIndex) {
        const ImgUrls = JSON.parse(this.dialogueList[index].imageUrl).map(imageUrl => ({ param: imageUrl, type: 'URL' }))
        window.$bridge.browseImage({ urls: ImgUrls, index })
      },
      openCase(caseId) {
        window.$bridge.goRecordDetail(caseId)
        // return true
      },
      goCirCle(url) {
        if (checkUrl(url)) window.$bridge.goCircle(url)
      },
      saTrack({ recordId, title, message, appName }) {
        try {
          // this.recordData(recordId)
          // window.sa.track('push', {
          //   page: '杏服小秘书',
          //   message_id: recordId,
          //   action: 'click',
          //   title,
          //   description: message,
          //   app_name: appName,
          // })
        } catch (error) {
          console.log('error in saTrack ', error)
        }
      },
      getNoRead() {
        this.setTimer()
        this.getNewMessages()
      },
      setTimer() {
        this.timer = setTimeout(() => {
          this.getRequestFlag()
        }, 2000)
      },
      getRequestFlag() {
        clearTimeout(this.timer)
        if (this.isLoadedNewMessage) {
          this.getNoRead()
        } else {
          this.setTimer()
        }
      },
    },
    directives: {
      change1: {
        inserted(el) {
          // console.log(height)
          // height += +el.scrollHeight
          // document.getElementById('myData').scrollTop = height
        },
      },
    },
  }
</script>

<style lang="scss">
.right{
  a:-webkit-any-link {
    color: #fff;
  }
}

.left {
  a:-webkit-any-link {
    color: #444;
  }
}
</style>


<style lang="scss" scoped>

  .tips {
    text-align: center;
    margin-top: 0.3rem;
    font-size: 17px;
    line-height: 35px;
    color: #444;

    p {
      line-height: 30px;
    }
  }

  .orange {
    color: rgb(252, 145, 83);
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

  .time {
    color: #bbbbbb;
    font-size: 13px;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    margin: 0.14rem 0px;
    text-align: center;
  }
  
  .item {
    padding: 0.15rem 0;
    display: block;
    overflow: hidden;

    .msg-box {
      border-radius: 4px;
      position: relative;
      color: rgb(255, 255, 255);
      display: inline-block;
      min-height: 0.75rem;
      max-width: 66%;
      box-sizing: border-box;
      padding: 0.16rem;
      font-size: 15px;
      line-height: 0.5rem;
      font-weight: 500;

      img {
        width: 100%;
      }
    }

    .avatar {
      float: left;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
    }
  }

  .left {
    .msg-box {
      float: left;
      position: relative;
      background-color: #fff;
      color: rgb(68, 68, 68);
    }

    .msg-box::after {
      width: 0;
      height: 0;
      border-top: 0.1rem solid transparent;
      border-right: 0.2rem solid #fff;
      border-bottom: 0.1rem solid transparent;
      position: absolute;
      left: -0.19rem;
      top: 0.1rem;
      content: '';
    }

    a:-webkit-any-link {
      color: rgb(68, 68, 68);
    }

    .avatar {
      float: left;
      margin-right: 0.3rem;
    }
  }

  .right {
    .msg-box {
      background-color: rgb(97, 212, 157);
      color: #fff;
      float: right;
    }

    .msg-box::after {
      width: 0;
      height: 0;
      border-top: 0.1rem solid transparent;
      border-left: 0.2rem solid rgb(97, 212, 157);
      border-bottom: 0.1rem solid transparent;
      position: absolute;
      right: -0.19rem;
      top: 0.1rem;
      content: '';
    }

    .avatar {
      float: right;
      margin-left: 0.3rem;
    }
  }

  .mescroll {
    position: fixed;
    top: 0px;
    bottom: 0;
    height: auto;
    width: 100%;
    margin-bottom: 0.9rem;
  }
  
</style>

