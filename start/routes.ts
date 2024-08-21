/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
router.on('/').renderInertia('home', { version: 6 })

const ChatRoomsController = () => import('#controllers/chat_rooms_controller')
router.resource('chat-rooms', ChatRoomsController)
