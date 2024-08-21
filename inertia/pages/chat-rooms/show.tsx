import { Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
export default function Show(props: InferPageProps<ChatRoomsController, 'show'>) {
  const { room } = props
  return (
    <div style={{ padding: '6rem', display: 'flex', flexDirection: 'column' }}>
      <h2>{room.name}</h2>
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
      <p>ここにチャットUI作成予定</p>
    </div>
  )
}
