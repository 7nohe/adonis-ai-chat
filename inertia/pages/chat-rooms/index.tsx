import { Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
export default function Index(props: InferPageProps<ChatRoomsController, 'index'>) {
  return (
    <div style={{ padding: '6rem' }}>
      <h2>チャット履歴</h2>
      <ul>
        {props.rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/chat-rooms/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
