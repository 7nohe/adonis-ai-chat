import ChatRoom from '#models/chat_room'
import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
const title = 'ルームを作成'
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
          {errors?.name && <p style={{ color: 'red' }}>{errors.name.join(', ')}</p>}
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
            作成
          </button>
        </form>
      </div>
    </>
  )
}
