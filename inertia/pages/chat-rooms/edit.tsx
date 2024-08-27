import { Head, Link, router } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
import { useState } from 'react'
import ChatRoom from '#models/chat_room'
const title = 'ルームを編集'
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
    <>
      <Head title={title} />
      <div style={{ padding: '6rem' }}>
        <h2>{title}</h2>
        <Link href="/chat-rooms">戻る</Link>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '20rem',
            marginTop: '1rem',
          }}
          onSubmit={handleSubmit}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <label
              style={{
                flex: 0.5,
              }}
              htmlFor="name"
            >
              名前
            </label>
            <input
              type="text"
              value={name}
              style={{
                flex: 2,
              }}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </div>
          {props.errors?.name && <p style={{ color: 'red' }}>{props.errors.name.join(', ')}</p>}
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
            type="submit"
          >
            更新
          </button>
        </form>
      </div>
    </>
  )
}
