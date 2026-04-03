'use client'

import React, { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // 解析内容提取标题
  useEffect(() => {
    const items: TocItem[] = []
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = `toc-${Math.random().toString(36).substr(2, 9)}`
      }
      items.push({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      })
    })

    setTocItems(items)
  }, [content])

  // 监听滚动高亮当前标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [tocItems])

  const scrollToItem = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (tocItems.length === 0) {
    return (
      <div className={cn('p-4 text-sm text-muted-foreground', className)}>
        暂无目录，开始写作吧！
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="space-y-1 p-2">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToItem(item.id)}
            className={cn(
              'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors hover:bg-muted',
              activeId === item.id ? 'bg-muted font-medium text-primary' : 'text-muted-foreground',
              {
                'pl-2': item.level === 2,
                'pl-4': item.level === 3,
                'pl-6': item.level === 4,
                'pl-8': item.level === 5,
                'pl-10': item.level === 6,
              }
            )}
          >
            {item.text}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
