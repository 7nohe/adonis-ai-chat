import { Head, Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
import { useState } from 'react'

function getCookie(name: string) {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}

export default function Show(props: InferPageProps<ChatRoomsController, 'show'>) {
  const { room } = props
  const [message, setMessage] = useState('')
  const initialMessages = room.chatMessages.map((m) => ({
    content: m.message,
    role: m.role as 'user' | 'system',
  }))
  const [chatMessages, setChatMessages] = useState<
    {
      content: string
      role: 'user' | 'system'
    }[]
  >(initialMessages)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newMessagesWithInput = [...chatMessages]
    newMessagesWithInput.push({ role: 'user', content: message })
    setChatMessages(newMessagesWithInput)
    setMessage('')

    const xsrfToken = getCookie('XSRF-TOKEN')
    try {
      const res = await fetch(`/chat-rooms/${room.id}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': xsrfToken ?? '',
        },
        body: JSON.stringify({
          message,
          chatRoomId: room.id,
        }),
      })
      const reader = res.body?.getReader()
      if (!reader) return
      let decoder = new TextDecoder()
      let content = ''
      let done = false
      let isFirst = true
      while (!done) {
        const data = await reader.read()
        done = data.done
        if (done) break
        const text = decoder.decode(data.value, { stream: true })
        content += text
        let newMessages = [...newMessagesWithInput]
        if (isFirst) {
          newMessages.push({
            role: 'system',
            content,
          })
        } else {
          newMessages.splice(-1, 1, {
            role: 'system',
            content,
          })
        }
        setChatMessages(newMessages)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Head title={room.name} />
      <div style={{ padding: '6rem', display: 'flex', flexDirection: 'column' }}>
        <h2>{room.name}</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            width: '100%',
          }}
        >
          <Link
            style={{
              width: 'fit-content',
            }}
            href={`/chat-rooms/${room.id}/edit`}
          >
            編集
          </Link>
          <Link
            style={{
              color: 'red',
              width: 'fit-content',
              border: 'none',
              textDecoration: 'underline',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            href={`/chat-rooms/${room.id}`}
            method="delete"
            as="button"
          >
            削除
          </Link>
          <Link
            style={{
              width: 'fit-content',
            }}
            href="/chat-rooms"
          >
            戻る
          </Link>
        </div>
        {/* Chat UI */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          {chatMessages.map((m, index) => (
            <div key={index}>
              <p>
                {m.role === 'user' ? '🙂' : '🤖'}: {m.content}
              </p>
            </div>
          ))}
        </div>

        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '2rem',
          }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid black',
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  )
}
