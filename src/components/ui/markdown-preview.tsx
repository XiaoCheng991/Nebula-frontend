import ReactMarkdown from 'react-markdown'

interface Props {
  content?: string
  maxLen?: number
  className?: string
}

function decodeHtmlEntities(str: string, len: number): string {
  const div = document.createElement('div')
  div.innerHTML = str
  let text = div.textContent || div.innerText || ''
  text = text.replace(/\s{2,}/g, ' ').trim()
  return text.length > len ? text.slice(0, len) + '...' : text
}

export function MarkdownPreview({ content, maxLen = 100, className }: Props) {
  if (!content) return null

  const decoded = decodeHtmlEntities(content, maxLen)

  return (
    <ReactMarkdown className={className}>
      {decoded}
    </ReactMarkdown>
  )
}
