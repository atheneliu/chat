function r (resizeNum) {
  let num = resizeNum
  // 核心适配代码
  const winW = window.innerWidth
  document.getElementsByTagName('html')[0].style.fontSize = `${winW * 0.15625}px`
  // 核心适配代码
  if (winW > window.screen.width && num <= 10) {
    num += 1
    setTimeout(() => {
      r(num)
    }, 100)
  } else {
    document.getElementsByTagName('body')[0].style.opacity = 1
  }
}

window.onresize = r
setTimeout(() => r(0))
