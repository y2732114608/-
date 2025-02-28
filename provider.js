async function scheduleHtmlProvider() {
  await loadTool('AIScheduleTools')
  try {
    await loadTool('AIScheduleTools')
    let tableElement = document.getElementById('kbgrid_table_0')
      return tableElement.outerHTML
  } catch (error) {
    await AIScheduleAlert('请确定你已经登陆了课表页面')
    return 'do not continue'
  }
}