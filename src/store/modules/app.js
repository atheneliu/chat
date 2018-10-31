// eslint-disable-next-line
import request from '@/utils/request.js' 
// eslint-disable-next-line
import { Feedback, RquestStatus } from '@/constants/ActionTypes.js'
import uuid from 'node-uuid'
import Vue from 'vue'
import Literal from '@/constants/Literal'

const MESSAGE_TEXT = 'TEXT'
const MESSAGE_USER = 1

const app = {
  state: {
    dialogueList: [],
    userInfo: {},
    sendStatus: false,
    lastTime: new Date(),
    newMessageFlag: false,
    isLoadedNewMessage: false,
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
      state.dialogueList = [...dialogueList, ...state.dialogueList]
      console.log('UPDATE_DIALOGUE_LIST', dialogueList[0].createdAt)
      state.lastTime = dialogueList.length ? dialogueList[0].createdAt : state.lastTime
    },
    [Feedback.INIT_SENDSTATUS](state) {
      state.sendStatus = false
    },
    [Feedback.GET_NEW_MESSAGE](state, newMessage) {
     state.dialogueList = [...state.dialogueList, ...newMessage]
     state.newMessageFlag = true
     state.isLoadedNewMessage = true
    },
    [Feedback.NOT_GET_NEW_MESSAGE](state) {
     state.newMessageFlag = false
    },
    [Feedback.LOADING_NEW_MESSAGE](state) {
      state.isLoadedNewMessage = false
    }
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
    async sendMessage({ commit, state }, { inputValue, imageUrl = [], messageType = Literal.MESSAGE_TEXT }) {
      const {
        userId, deviceId, appName, appVersion, model, fullName, roleId,
      } = state.userInfo
      const messageInfo = {
        role: roleId,
        userName: fullName,
        userId,
        message: inputValue,
        messageType,
        deviceId,
        appName,
        appVersion,
        model,
        type: MESSAGE_USER,
        messageId: uuid.v4(),
        imageUrl: JSON.stringify(imageUrl),
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
    async getDialogueList({ commit }, lastTime) {
      console.log('getDialogueList-->', lastTime)
      const res = await request.get('/api/dialogue', { lastTime, random: Math.random() })
      if (res.result === RquestStatus.SUCCESS) {
        commit(Feedback.UPDATE_DIALOGUE_LIST, res.dialogue)
      } else {
        Vue.toast('获取聊天记录失败，请退出该页面重试')
      }
    },
    async recordData(recordId) {
      const res = request.put(`/api/record/${recordId}`)
      console.log('res-->', res)
    },
    async getNewMessages({ commit, getters }) {
      const { appName, userId, deviceId } = getters.userInfo
      const senderId = userId || deviceId
      const res = await request.get(`/api/message/un-read/${senderId}`, { appName })
      commit(Feedback.LOADING_NEW_MESSAGE)
      if (res.result === RquestStatus.SUCCESS) {
        if(res.unreadMessages.results.length !== 0) {
          commit(Feedback.GET_NEW_MESSAGE, res.unreadMessages.results)
          return
        }
        commit(Feedback.NOT_GET_NEW_MESSAGE)
      } else {
        Vue.toast('获取新消息失败，请退出该页面重试')
      }
    }
  },
  getters: {
    userInfo: state => state.userInfo,
    dialogueList: state => state.dialogueList,
    sendStatus: state => state.sendStatus,
    lastTime: state => state.lastTime,
    newMessageFlag: state => state.newMessageFlag,
    isLoadedNewMessage: state => state.isLoadedNewMessage,
  },
}

export default app
