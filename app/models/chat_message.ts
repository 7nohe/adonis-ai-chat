import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import ChatRoom from './chat_room.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ChatMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare chatRoomId: number

  @belongsTo(() => ChatRoom)
  declare user: BelongsTo<typeof ChatRoom>

  @column()
  declare message: string

  @column()
  declare role: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
