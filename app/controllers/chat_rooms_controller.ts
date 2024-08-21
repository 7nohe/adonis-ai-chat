import ChatRoom from '#models/chat_room'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChatRoomsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    const rooms = await ChatRoom.all()
    return rooms
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
  async show({ params }: HttpContext) {
    const room = await ChatRoom.find(params.id)
    return room
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
