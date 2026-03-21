import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../../components/common/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>)
    expect(container.firstChild).toHaveClass('bg-main')
  })

  it('applies size styles', () => {
    const { container } = render(<Badge size="xs">Small</Badge>)
    expect(container.firstChild).toHaveClass('text-xs')
  })

  it('renders with dot', () => {
    const { container } = render(<Badge dot>With Dot</Badge>)
    const dot = container.querySelector('.w-2.h-2.rounded-full')
    expect(dot).toBeInTheDocument()
  })
})
