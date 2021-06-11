const reportCountEl = document.getElementById('reportCount')
const reportListEl = document.getElementById('reportList')

fetch('/reports')
  .then((res) => res.json())
  .then((reports) => {
    updateUi(reports)
  })

function updateUi(reports) {
  reportCountEl.innerText = reports.length
  const reportsHTML = reports.map((report) => {
    const { credit, date } = report
    const time = new Date(date).toLocaleTimeString()
    const day = new Date(date).toDateString()
    return `<div><div>${report['source_event_id']}</div><div>${report['trigger_data']}</div><div>${credit}</div><div>${time} ${day}</div></div>`
  })
  reportListEl.innerHTML = reportsHTML.reduce((acc, c) => `${acc}${c}`, '')
}
