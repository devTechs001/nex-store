// src/components/categories/CategoryCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const CategoryCard = ({ category, isActive, onClick, showCount, count }) => {
  const navigate = useNavigate()
  const Icon = category.icon

  const handleClick = () => {
    if (onClick) {
      onClick(category.id)
    } else {
      navigate(`/category/${category.slug}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300
        min-w-[110px] group
        ${isActive
          ? 'bg-main text-bg shadow-[0_0_20px_var(--main-color)] scale-105'
          : 'bg-bg-secondary text-text hover:bg-main/20 hover:scale-105'
        }
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
          ${isActive ? 'bg-bg/20' : 'bg-bg group-hover:bg-bg/50'}
        `}
        style={{ color: isActive ? 'inherit' : category.color }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
      {showCount && count !== undefined && (
        <span className={`text-xs ${isActive ? 'text-bg/70' : 'text-text-muted'}`}>
          {count} apps
        </span>
      )}
    </button>
  )
}

export default CategoryCard