import ChatRoom from '#models/chat_room'
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
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params, inertia }: HttpContext) {
    const room = await ChatRoom.findByOrFail(params.id)
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
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
