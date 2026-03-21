// src/components/common/Tabs.jsx
import React, { useState } from 'react'

const Tabs = ({ 
  tabs, 
  defaultTab, 
  onChange,
  className = '',
  variant = 'underline',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const variants = {
    underline: {
      container: 'border-b border-bg-secondary',
      tab: (active) => `
        pb-3 text-sm font-medium transition-colors relative
        ${active ? 'text-main' : 'text-text-muted hover:text-text'}
      `,
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-main',
    },
    pills: {
      container: 'bg-bg rounded-xl p-1',
      tab: (active) => `
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active ? 'bg-main text-bg' : 'text-text-muted hover:text-text'}
      `,
      indicator: '',
    },
    buttons: {
      container: 'flex gap-2',
      tab: (active) => `
        px-4 py-2 rounded-xl text-sm font-medium transition-all border-2
        ${active 
          ? 'bg-main text-bg border-main' 
          : 'border-bg-secondary text-text hover:border-main'
        }
      `,
      indicator: '',
    },
  }

  const style = variants[variant]

  return (
    <div className={className}>
      <div className={`flex gap-6 ${style.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={style.tab(activeTab === tab.id)}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2 inline" />}
            {tab.label}
            {activeTab === tab.id && style.indicator && (
              <span className={style.indicator} />
            )}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default Tabs