import { Head, Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
const title = 'チャット履歴'
export default function Index(props: InferPageProps<ChatRoomsController, 'index'>) {
  return (
    <>
      <Head title={title} />
      <div style={{ padding: '6rem' }}>
        <h2>{title}</h2>
        <Link href="/chat-rooms/create">新規作成</Link>
        <ul>
          {props.rooms.map((room) => (
            <li key={room.id}>
              <Link href={`/chat-rooms/${room.id}`}>{room.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
