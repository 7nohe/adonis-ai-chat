import { Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
export default function Show(props: InferPageProps<ChatRoomsController, 'show'>) {
  const { room } = props
  return (
    <div style={{ padding: '6rem' }}>
      <h2>{room.name}</h2>
      <Link href="/chat-rooms">戻る</Link>
      <p>ここにチャットUI作成予定</p>
    </div>
  )
}
