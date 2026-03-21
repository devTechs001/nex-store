// src/components/apps/AppGrid.jsx
import React from 'react'
import AppCard from './AppCard'
import { Skeleton, EmptyState } from '../common'
import { Package } from 'lucide-react'

const AppGrid = ({
  apps,
  view = 'grid',
  loading = false,
  emptyTitle = 'No apps found',
  emptyDescription = 'Try adjusting your search or filters',
  columns = 4,
}) => {
  if (loading) {
    return (
      <div className={
        view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
      }>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton.Card key={i} />
        ))}
      </div>
    )
  }

  if (!apps || apps.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  }

  return (
    <div className={
      view === 'grid'
        ? `grid ${gridCols[columns] || gridCols[4]} gap-4`
        : 'space-y-3'
    }>
      {apps.map((app) => (
        <AppCard key={app.id} app={app} view={view} />
      ))}
    </div>
  )
}

export default AppGrid