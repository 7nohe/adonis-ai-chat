import factory from '@adonisjs/lucid/factories'
import ChatRoom from '#models/chat_room'

export const ChatRoomFactory = factory
  .define(ChatRoom, async ({ faker }) => {
    return {}
  })
  .build()