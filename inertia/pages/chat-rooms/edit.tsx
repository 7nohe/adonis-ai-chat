import { Link, router } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
import { useState } from 'react'
import ChatRoom from '#models/chat_room'
export default function Edit(
  props: InferPageProps<ChatRoomsController, 'edit'> & {
    errors?: { [key in keyof Pick<ChatRoom, 'name'>]: string[] }
  }
) {
  const { room } = props
  const [name, setName] = useState(room.name)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.put(`/chat-rooms/${room.id}`, { name })
  }
  return (
    <div style={{ padding: '6rem' }}>
      <h2>ルームを編集</h2>
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
          {props.errors?.name && <p style={{ color: 'red' }}>{props.errors.name.join(', ')}</p>}
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  )
}
