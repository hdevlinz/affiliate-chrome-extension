import './Popup.css'

export const Popup = () => {
  const handleStart = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'start' })
      }
    })
  }

  const handleStop = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'stop' })
      }
    })
  }

  const handleExportCSV = () => {
    chrome.storage.sync.get(['crawledData'], ({ crawledData }) => {
      if (!crawledData || !crawledData.length)
        return alert('No data to export! Please crawl some data first.')

      const keys = Object.keys(crawledData[0])
      const csvData = [
        keys.join(','),
        ...crawledData.map((item: any) => keys.map((k) => JSON.stringify(item[k] || '')).join(',')),
      ].join('\n')

      const now = new Date()
      const date = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
      const blob = new Blob([csvData], { type: 'text/csv' })
      const filename = `creator_data_${date}.csv`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <main>
      <h3>Creator Crawler</h3>
      <div className="container">
        <button onClick={handleStart}>
          Start
        </button>
        <button onClick={handleStop}>
          Stop
        </button>
        <button onClick={handleExportCSV}>
          Export To CSV
        </button>
      </div>
    </main>
  )
}

export default Popup
