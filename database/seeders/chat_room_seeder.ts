import { ChatRoomFactory } from '#database/factories/chat_room_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ChatRoomFactory.createMany(10)
  }
}
