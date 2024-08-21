import ChatRoom from '#models/chat_room'
import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
export default function Create(props: {
  errors?: { [key in keyof Pick<ChatRoom, 'name'>]: string[] }
}) {
  const { errors } = props
  const [name, setName] = useState('')
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await router.post('/chat-rooms', { name })
  }
  return (
    <div style={{ padding: '6rem' }}>
      <h2>ルームを作成</h2>
      <Link href="/chat-rooms">戻る</Link>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
          />
          {errors?.name && <p style={{ color: 'red' }}>{errors.name.join(', ')}</p>}
        </div>
        <button type="submit">作成</button>
      </form>
    </div>
  )
}
