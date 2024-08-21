import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new chat room.
 */
export const createChatRoomValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing chat room.
 */
export const updateChatRoomValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
    params: vine.object({
      id: vine.number().positive(),
    }),
  })
)

export const showChatRoomValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().positive(),
    }),
  })
)

export const editChatRoomValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().positive(),
    }),
  })
)

export const deleteChatRoomValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().positive(),
    }),
  })
)
