import ChatRoom from '#models/chat_room'
import {
  createChatRoomValidator,
  deleteChatRoomValidator,
  editChatRoomValidator,
  showChatRoomValidator,
  updateChatRoomValidator,
} from '#validators/chat_room'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChatRoomsController {
  /**
   * Display a list of resource
   */
  async index({ inertia }: HttpContext) {
    const rooms = await ChatRoom.all()
    return inertia.render('chat-rooms/index', {
      rooms: rooms.map((r) => ({
        id: r.id,
        name: r.name,
      })),
    })
  }

  /**
   * Display form to create a new record
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('chat-rooms/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createChatRoomValidator)
    const room = await ChatRoom.create(payload)

    return response.redirect(`/chat-rooms/${room.id}`)
  }

  /**
   * Show individual record
   */
  async show({ request, inertia }: HttpContext) {
    const { params } = await request.validateUsing(showChatRoomValidator)
    const room = await ChatRoom.findOrFail(params.id)
    return inertia.render('chat-rooms/show', {
      room: {
        id: room.id,
        name: room.name,
      },
    })
  }

  /**
   * Edit individual record
   */
  async edit({ request, inertia }: HttpContext) {
    const { params } = await request.validateUsing(editChatRoomValidator)
    const room = await ChatRoom.findOrFail(params.id)
    return inertia.render('chat-rooms/edit', {
      room: {
        id: room.id,
        name: room.name,
      },
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateChatRoomValidator)
    const { params, ...data } = payload
    const room = await ChatRoom.findOrFail(params.id)
    room.merge(data)
    await room.save()

    return response.redirect(`/chat-rooms/${room.id}`)
  }

  /**
   * Delete record
   */
  async destroy({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(deleteChatRoomValidator)
    const room = await ChatRoom.findOrFail(params.id)
    await room.delete()
    return response.redirect('/chat-rooms')
  }
}
