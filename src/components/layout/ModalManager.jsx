import { useState, useEffect } from 'react'
import { useAppStore } from '../../context/AppContext'
import UploadModal from '../apps/UploadModal'
import AppDetails from '../apps/AppDetails'

const ModalManager = ({ selectedApp, setSelectedApp, showUpload, setShowUpload }) => {
  const { addApp } = useAppStore()

  return (
    <>
      {/* App Details Modal */}
      {selectedApp && (
        <AppDetails app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={addApp}
      />
    </>
  )
}

export default ModalManager
