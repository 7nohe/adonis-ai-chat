/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
router.on('/').redirect('/chat-rooms')

const ChatRoomsController = () => import('#controllers/chat_rooms_controller')
const ChatMessagesController = () => import('#controllers/chat_messages_controller')

router.resource('chat-rooms', ChatRoomsController)
router.resource('chat-rooms.chat-messages', ChatMessagesController)
