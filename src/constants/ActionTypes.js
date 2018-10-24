import keyMirror from 'keymirror'

export const Feedback = keyMirror({
  loadingDialogueList: null,
  getDialogueList: null,
  failedDialogueList: null,
  loadingSubmitDialogue: null,
  submitDialogue: null,
  getNoReadMessages: null,
  loadingNoReadMessages: null,
  showWrapper: null,
  hideWrapper: null,
  setInputValue: null,
  loadingSubmitAgain: null,
  failedSubmitDialogue: null,
  clearNewMessage: null,
  recordData: null,
  imageLoaded: null,
})

export const Environment = keyMirror({
  loadingEnvironment: null,
  initEnvironment: null,
})

export const Load = keyMirror({
  clear: null,
  loading: null,
  loaded: null,
})
export const SaveType = {
  SAVE_FAILED: 'FAILED',
  SAVE_SUCCESS: 'SUCCESS',
}

export default {
  Feedback, SaveType, Environment,
}
