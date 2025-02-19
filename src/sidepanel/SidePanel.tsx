import { useState, useEffect } from 'react'

import './SidePanel.css'

export const SidePanel = () => {
  const [countSync, setCountSync] = useState(0)

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCountSync(result.count || 0)
    })

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        setCountSync(request.count || 0)
      }
    })
  }, [])

  return (
    <main>
      <h3>SidePanel Page</h3>
      <h4>Count from Popup: {countSync}</h4>
    </main>
  )
}

export default SidePanel
