import ChatRoom from '#models/chat_room'
import type { HttpContext } from '@adonisjs/core/http'
import OpenAI from 'openai'
import env from '#start/env'

const openai = new OpenAI({
  apiKey: env.get('OPENAI_API_KEY'),
})

export default class ChatMessagesController {
  async store({ request, response }: HttpContext) {
    const { message, chatRoomId } = request.body()
    const chatRoom = await ChatRoom.findOrFail(chatRoomId)
    await chatRoom.related('chatMessages').create({
      message,
      role: 'user',
    })

    const chatMessages = await chatRoom
      .related('chatMessages')
      .query()
      .orderBy('created_at', 'asc')
      .exec()

    const messages = chatMessages.map((m) => ({
      role: m.role as 'user' | 'system',
      content: m.message,
    }))

    const chatStream = await openai.beta.chat.completions.stream({
      model: 'gpt-4',
      messages,
      stream: true,
    })

    let responseText = ''

    for await (const part of chatStream) {
      const content = part.choices[0]?.delta?.content ?? ''
      responseText += content
      response.response.write(content)
    }
    response.response.on('close', async () => {
      await chatRoom.related('chatMessages').create({
        message: responseText,
        role: 'system',
      })

      response.response.end()
    })
  }
}
