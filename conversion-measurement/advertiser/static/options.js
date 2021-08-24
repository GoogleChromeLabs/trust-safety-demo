async function editSetting(e) {
  const prioCheckboxEl = document.getElementById('prio')
  const dedupCheckboxEl = document.getElementById('dedup')

  const data = {
    dedup: dedupCheckboxEl.checked,
    prio: prioCheckboxEl.checked
  }
  await fetch('/demo-settings', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

document.getElementById('prio').addEventListener('change', editSetting)
document.getElementById('dedup').addEventListener('change', editSetting)
