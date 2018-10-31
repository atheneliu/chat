import keyMirror from 'keymirror'

export const Feedback = keyMirror({
  UPDATE_USER_INFO: 'update/userinfo',
  ADD_DIALOGUE: 'add/dialogue',
  UPDATE_DIALOGUE_LIST: 'update/dialogueList',
  INIT_SENDSTATUS: 'init/sendStatus',
  GET_NEW_MESSAGE: 'get/newMessage',
  NOT_GET_NEW_MESSAGE: 'get/noNewMessage',
})

export const SaveType = {
  SAVE_FAILED: 'FAILED',
  SAVE_SUCCESS: 'SUCCESS',
}

export const RquestStatus = {
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS',
}

export default {
  Feedback, SaveType, RquestStatus,
}
