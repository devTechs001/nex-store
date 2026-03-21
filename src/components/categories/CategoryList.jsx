// src/components/categories/CategoryList.jsx
import React from 'react'
import { CATEGORIES } from '../../data/categories'
import CategoryCard from './CategoryCard'

const CategoryList = ({ 
  selectedCategory = 'all', 
  onSelect, 
  showCount = false,
  apps = []
}) => {
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return apps.length
    return apps.filter(app => app.category === categoryId).length
  }

  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-3 min-w-max">
        {CATEGORIES.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onClick={onSelect}
            showCount={showCount}
            count={getCategoryCount(category.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryList