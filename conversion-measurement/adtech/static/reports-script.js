const reportCountEl = document.getElementById('reportCount')
const reportListEl = document.getElementById('reportList')

fetch('/reports')
  .then((res) => res.json())
  .then((reports) => {
    updateUi(reports)
  })

function updateUi(reports) {
  reportCountEl.innerText = reports.length

  const reportsHTML = reports.map(
    (report) =>
      `<div><div>${report['impression-data']}</div><div>${report['conversion-data']}</div><div>${report['credit']}</div></div>`
  )
  reportListEl.innerHTML = reportsHTML.reduce((acc, c) => `${acc}${c}`, '')
}
