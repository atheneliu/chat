// eslint-disable-next-line
import request from '@/utils/request.js' 
// eslint-disable-next-line
import { Feedback, RquestStatus } from '@/constants/ActionTypes.js'
import uuid from 'node-uuid'
import Vue from 'vue'

const MESSAGE_TEXT = 'TEXT'
const MESSAGE_USER = 1

const app = {
  state: {
    dialogueList: [],
    userInfo: {},
    sendStatus: false,
  },
  mutations: {
    [Feedback.UPDATE_USER_INFO](state, userInfo) {
      state.userInfo = userInfo
    },
    // 新增一条+关闭对话框+滚到最底部
    [Feedback.ADD_DIALOGUE](state, message) {
      state.dialogueList = [...state.dialogueList, message]
      state.sendStatus = true
    },
    [Feedback.UPDATE_DIALOGUE_LIST](state, dialogueList) {
      state.dialogueList = dialogueList
    },
    [Feedback.INIT_SENDSTATUS](state) {
      state.sendStatus = false
    },
  },
  actions: {
    async getUserInfo({ commit }) {
      const res = await request.get('/api/current')
      if (res.result === RquestStatus.SUCCESS) {
        commit(Feedback.UPDATE_USER_INFO, res.initInfo)
      } else {
        Vue.toast('获取用户信息失败，请退出该页面重试')
      }
    },
    async sendMessage({ commit, state }, { inputValue }) {
      const {
        userId, deviceId, appName, appVersion, model, fullName, roleId,
      } = state.userInfo
      const messageInfo = {
        role: roleId,
        userName: fullName,
        userId,
        message: inputValue,
        messageType: MESSAGE_TEXT,
        deviceId,
        appName,
        appVersion,
        model,
        type: MESSAGE_USER,
        messageId: uuid.v4(),
        imageUrl: JSON.stringify([]),
      }
      const data = await request.post('/api/message', { messageInfo })
      console.log('data-->', data)
      if (data.result === RquestStatus.SUCCESS) {
        // this.scrollToBottom()
        commit(Feedback.ADD_DIALOGUE, messageInfo)
      } else {
        Vue.toast('发送失败，请重试')
      }
      // this.closeComment()
    },
    async getDialogueList({ commit }) {
      const res = await request.get('/api/dialogue')
      if (res.result === RquestStatus.SUCCESS) {
        commit(Feedback.UPDATE_DIALOGUE_LIST, res.dialogue)
      } else {
        Vue.toast('获取聊天记录失败，请退出该页面重试')
      }
    },
  },
  getters: {
    userInfo: state => state.userInfo,
    dialogueList: state => state.dialogueList,
    sendStatus: state => state.sendStatus,
  },
}

export default app