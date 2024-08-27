## AdonisJS Hands-on

## About AdonisJS

https://docs.adonisjs.com/guides/preface/introduction

## プロジェクト作成

https://docs.adonisjs.com/guides/getting-started/installation

```bash
npm init adonisjs@latest adonis-ai-chat
```

- スターターキット: Inertia Starter Kit
- 認証ガード: Session
- データベースドライバー: PostgreSQL
- フロントエンドアダプター: React
- SSR設定: なし

```bash
cd adonis-ai-chat
cp .env.example .env
```

## DB設定

compose.yaml作成

```yaml
services:
  postgresql:
    image: postgres:16
    environment:
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - 5432:5432
    volumes:
      - postgres:/var/lib/postgresql/data
volumes:
  postgres:
```

```bash
docker compose up -d
```

.env編集

```
DB_DATABASE=postgres
```

```bash
npm run dev
```

## Model/Migration

https://docs.adonisjs.com/guides/database/lucid

```bash
node ace make:model ChatRoom --migration --factory
```

app/models/chat_room.tsを編集

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ChatRoom extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

xxxxxx_create_chat_rooms_tableを編集

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

```bash
node ace migration:run
```

REPLで動作確認

```bash
node ace repl
```

```bash
// メソッド確認
> (js) .ls

// Lucidモデル読み込み
> (js) loadModels()

// レコード作成
> (js) await models.chat_room.create({ name: "MyRoom" })

// レコード取得
> (js) const room = await models.chat_room.first()
> (js) room.name
'MyRoom'

// 検索
> (js) await models.chat_room.query().where('name', 'MyRoom').first()


// 終了
> (js) .exit

```

## Controller

https://docs.adonisjs.com/guides/basics/controllers#controllers

```bash
node ace make:controller ChatRoom -r
```

app/controllers/chat_rooms_controller.ts

```ts
import type { HttpContext } from '@adonisjs/core/http'

export default class ChatRoomsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

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
  async show({ params }: HttpContext) {}

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
```

routes.tsにルートを設定

```diff ts
import router from '@adonisjs/core/services/router'
+ const ChatRoomsController = () => import('#controllers/chat_rooms_controller')
- router.on('/').renderInertia('home', { version: 6 })
+ router.on('/').redirect('/chat-rooms')
+ router.resource('chat-rooms', ChatRoomsController)
```

indexアクションを編集

```diff ts
import ChatRoom from '#models/chat_room'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChatRoomsController {
  async index({}: HttpContext) {
+    const rooms = await ChatRoom.all()
+    return rooms
  }

  async show({ params }: HttpContext) {
+   const room = await ChatRoom.findOrFail(params.id)
+   return room
  }
}
```

`http://localhost:3333/chat-rooms` と `http://localhost:3333/chat-rooms/1` へアクセスしてみる

## View

https://docs.adonisjs.com/guides/views-and-templates/inertia

一覧画面のinertia/pages/chat-rooms/index.tsxを手動で作成

```tsx
import { Link, Head } from '@inertiajs/react'
import ChatRoom from '#models/chat_room'
const title = 'チャット履歴'
export default function Index(props: { rooms: ChatRoom[] }) {
  return (
    <>
      <Head title={title} />
      <div style={{ padding: '6rem' }}>
        <h2>{title}</h2>
        <ul>
          {props.rooms.map((room) => (
            <li key={room.id}>
              <Link href={`/chat-rooms/${room.id}`}>{room.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
```

詳細画面のinertia/pages/chat-rooms/show.tsxを手動で作成

```tsx
import { Head, Link } from '@inertiajs/react'
import ChatRoom from '#models/chat_room'
export default function Show(props: { room: ChatRoom }) {
  const { room } = props
  return (
    <>
      <Head title={room.name} />
      <div style={{ padding: '6rem' }}>
        <h2>{room.name}</h2>
        <Link href="/chat-rooms">戻る</Link>
        <p>ここにチャットUI作成予定</p>
      </div>
    </>
  )
}
```

app/controllers/chat_rooms_controller.tsを変更

```diff ts
-async index({ }: HttpContext) {
+async index({ inertia }: HttpContext) {
  const rooms = await ChatRoom.all()
-  return rooms
+  return inertia.render('chat-rooms/index', { rooms })
}

-async show({ params }: HttpContext) {
+async show({ params, inertia }: HttpContext) {
  const room = await ChatRoom.findOrFail(params.id)
-  return room
+  return inertia.render('chat-rooms/show', { room })
}
```

`http://localhost:3333/chat-rooms`へアクセスしてみる

(オプショナル) propsの型をControllerとReactで共有する

inertia/pages/chat-rooms/index.tsxを変更

```diff tsx
import { Link, Head } from '@inertiajs/react'
-import ChatRoom from '#models/chat_room'
+import { InferPageProps } from '@adonisjs/inertia/types'
+import ChatRoomsController from '#controllers/chat_rooms_controller'
const title = 'チャット履歴'
-export default function Index(props: { rooms: ChatRoom[] }) {
+export default function Index(props: InferPageProps<ChatRoomsController, 'index'>) {
  return (
    <>
      <Head title={title} />
      <div style={{ padding: '6rem' }}>
        <h2>{title}</h2>
        <ul>
          {props.rooms.map((room) => (
            <li key={room.id}>
              <Link href={`/chat-rooms/${room.id}`}>{room.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
```

inertia/pages/chat-rooms/show.tsxを変更

```diff tsx
import { Head, Link } from '@inertiajs/react'
-import ChatRoom from '#models/chat_room'
+import { InferPageProps } from '@adonisjs/inertia/types'
+import ChatRoomsController from '#controllers/chat_rooms_controller'
-export default function Show(props: { room: ChatRoom }) {
+export default function Show(props: InferPageProps<ChatRoomsController, 'show'>) {
  const { room } = props
  return (
    <>
      <Head title={room.name} />
      <div style={{ padding: '6rem' }}>
        <h2>{room.name}</h2>
        <Link href="/chat-rooms">戻る</Link>
        <p>ここにチャットUI作成予定</p>
      </div>
    </>
  )
}
```

app/controllers/chat_rooms_controller.tsを変更（Modelのシリアライズ）

https://docs.adonisjs.com/guides/views-and-templates/inertia#model-serialization

```diff ts
async index({ inertia }: HttpContext) {
  const rooms = await ChatRoom.all()
-  return inertia.render('chat-rooms/index', { rooms })
+  return inertia.render('chat-rooms/index', {
+    rooms: rooms.map((r) => ({
+      id: r.id,
+      name: r.name,
+    })),
+  })
}

async show({ params, inertia }: HttpContext) {
  const room = await ChatRoom.findOrFail(params.id)
-  return inertia.render('chat-rooms/show', { room })
+  return inertia.render('chat-rooms/show', {
+    room: {
+      id: room.id,
+      name: room.name,
+    },
+  })
}
```

## Validation

https://docs.adonisjs.com/guides/basics/validation

```bash
node ace make:validator ChatRoom --resource
```

app/validators/chat_room.ts

```ts
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
  })
)
```

app/controllers/chat_rooms_controller.tsを変更

```diff ts
+ import { createChatRoomValidator, updateChatRoomValidator } from '#validators/chat_room'

-  async create({}: HttpContext) {
+  async create({ inertia }: HttpContext) {
+    return inertia.render('chat-rooms/create')
  }

-  async store({ request }: HttpContext) {
+  async store({ request, response }: HttpContext) {
+    const payload = await request.validateUsing(createChatRoomValidator)
+    const room = await ChatRoom.create(payload)

+    return response.redirect(`/chat-rooms/${room.id}`)
  }

-  async edit({ params }: HttpContext) {
+  async edit({ params, inertia }: HttpContext) {
+    const room = await ChatRoom.findOrFail(params.id)
+    return inertia.render('chat-rooms/edit', {
+      room: {
+        id: room.id,
+        name: room.name,
+      },
+    })
  }

-  async update({ params, request }: HttpContext) {}
+  async update({ params, request, response }: HttpContext) {
+    const payload = await request.validateUsing(updateChatRoomValidator)
+    const room = await ChatRoom.findOrFail(params.id)
+    room.merge(payload)
+    await room.save()

+    return response.redirect(`/chat-rooms/${room.id}`)
  }
```

inertia/pages/chat-rooms/create.tsxを作成

```tsx
import ChatRoom from '#models/chat_room'
import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
const title = 'ルームを作成'
export default function Create(props: {
  errors?: { [key in keyof Pick<ChatRoom, 'name'>]: string[] }
}) {
  const { errors } = props
  const [name, setName] = useState('')
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await router.post('/chat-rooms', { name })
  }
  return (
    <>
      <Head title={title} />
      <div style={{ padding: '6rem' }}>
        <h2>{title}</h2>
        <Link href="/chat-rooms">戻る</Link>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '20rem',
            marginTop: '1rem',
          }}
          onSubmit={handleSubmit}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <label
              style={{
                flex: 0.5,
              }}
              htmlFor="name"
            >
              名前
            </label>
            <input
              type="text"
              value={name}
              style={{
                flex: 2,
              }}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </div>
          {errors?.name && <p style={{ color: 'red' }}>{errors.name.join(', ')}</p>}
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
            type="submit"
          >
            作成
          </button>
        </form>
      </div>
    </>
  )
}

```

inertia/pages/chat-rooms/edit.tsxを作成

```tsx
import { Head, Link, router } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
import { useState } from 'react'
import ChatRoom from '#models/chat_room'
const title = 'ルームを編集'
export default function Edit(
  props: InferPageProps<ChatRoomsController, 'edit'> & {
    errors?: { [key in keyof Pick<ChatRoom, 'name'>]: string[] }
  }
) {
  const { room } = props
  const [name, setName] = useState(room.name)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.put(`/chat-rooms/${room.id}`, { name })
  }
  return (
    <>
      <Head title={title} />
      <div style={{ padding: '6rem' }}>
        <h2>{title}</h2>
        <Link href="/chat-rooms">戻る</Link>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '20rem',
            marginTop: '1rem',
          }}
          onSubmit={handleSubmit}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <label
              style={{
                flex: 0.5,
              }}
              htmlFor="name"
            >
              名前
            </label>
            <input
              type="text"
              value={name}
              style={{
                flex: 2,
              }}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </div>
          {props.errors?.name && <p style={{ color: 'red' }}>{props.errors.name.join(', ')}</p>}
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
            type="submit"
          >
            更新
          </button>
        </form>
      </div>
    </>
  )
}

```

index.tsxに新規作成リンクを追加

```diff tsx
<h2>{title}</h2>
+ <Link href="/chat-rooms/create">新規作成</Link>
```

show.tsxに編集リンクを追加

```diff tsx
<h2>{room.name}</h2>
-<Link href="/chat-rooms">戻る</Link>
+<div
+  style={{
+    display: 'flex',
+    flexDirection: 'row',
+    gap: '0.5rem',
+    width: '100%',
+  }}
+>
+  <Link
+    style={{
+      width: 'fit-content',
+    }}
+    href={`/chat-rooms/${room.id}/edit`}
+  >
+    編集
+  </Link>
+  <Link
+    style={{
+      width: 'fit-content',
+    }}
+    href="/chat-rooms"
+  >
+    戻る
+  </Link>
+</div>
```

(オプショナル) paramsのバリデーション

https://docs.adonisjs.com/guides/basics/validation#validating-cookies-headers-and-route-params

app/validators/chat_room.tsを変更

```ts
export const deleteChatRoomValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().positive(),
    }),
  })
)
```

app/controllers/chat_rooms_controller.tsを変更

```diff ts
-  async destroy({ params }: HttpContext) {
+  async destroy({ request, response }: HttpContext) {
+    const { params } = await request.validateUsing(deleteChatRoomValidator)
+    const room = await ChatRoom.findOrFail(params.id)
+    await room.delete()
+    return response.redirect('/chat-rooms')
  }
```

inertia/pages/chat-rooms/show.tsxに削除ボタンを追加

```tsx
<Link
  style={{
    color: 'red',
    width: 'fit-content',
    border: 'none',
    textDecoration: 'underline',
    fontSize: '1rem',
    cursor: 'pointer',
  }}
  href={`/chat-rooms/${room.id}`}
  method="delete"
  as="button"
>
  削除
</Link>
```

## (optional) Database seeders

https://lucid.adonisjs.com/docs/seeders

```bash
node ace make:seeder ChatRoom
```

database/seeders/chat_room_seeder.tsを編集

```ts
import ChatRoom from '#models/chat_room'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ChatRoom.createMany([
      {
        name: 'Lobby',
      },
      {
        name: 'General',
      },
      {
        name: 'Random',
      },
    ])
  }
}

```


```bash
node ace db:seed
# or
node ace db:seed --files "./database/seeders/chat_room_seeder.ts"
```

Factoryを使用する場合はchat_room_factory.tsを編集

```ts
import factory from '@adonisjs/lucid/factories'
import ChatRoom from '#models/chat_room'

export const ChatRoomFactory = factory
  .define(ChatRoom, async ({ faker }) => {
    return {
      name: faker.lorem.words(2),
    }
  })
  .build()

```

chat_room_seeder.tsを編集

```ts
import { ChatRoomFactory } from '#database/factories/chat_room_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ChatRoomFactory.createMany(10)
  }
}
```

https://lucid.adonisjs.com/docs/model-factories


## Relationships

https://lucid.adonisjs.com/docs/relationships

```bash
node ace make:model  ChatMessage -m -c
```

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('chat_room_id').unsigned().references('chat_rooms.id').onDelete('CASCADE')
      table.string('message').notNullable()
      table.string('role').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

```bash
node ace migration:run
```

```ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import ChatMessage from './chat_message.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class ChatRoom extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @hasMany(() => ChatMessage)
  declare chatMessages: HasMany<typeof ChatMessage>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

```ts
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
```

chat_rooms_controller.ts:

```ts
  async show({ request, inertia }: HttpContext) {
    const { params } = await request.validateUsing(showChatRoomValidator)
    const room = await ChatRoom.findOrFail(params.id)
    await room.load('chatMessages')
    return inertia.render('chat-rooms/show', {
      room: {
        id: room.id,
        name: room.name,
        chatMessages:
          room.chatMessages?.map((m) => ({
            id: m.id,
            chatRoomId: m.chatRoomId,
            message: m.message,
            role: m.role,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          })) ?? [],
      },
    })
  }
```

Replでデータを作成して表示されるか確認

```bash
node ace repl
> (js) loadModels()
> (js) const chatRoom = await models.chat_room.first()
> (js) await chatRoom.related('chatMessages').create({ role: 'user', message: 'Hi!' })
> (js) await models.chat_message.first()
```

show.tsxに以下を追加

```tsx
{/* Chat UI */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '2rem',
  }}
>
  {room.chatMessages.map((m, index) => (
    <div key={index}>
      <p>
        {m.role === 'user' ? '🙂' : '🤖'}: {m.message}
      </p>
    </div>
  ))}
</div>
```

## Streaming

start/routes.ts:

```ts
import router from '@adonisjs/core/services/router'

const ChatRoomsController = () => import('#controllers/chat_rooms_controller')
const ChatMessagesController = () => import('#controllers/chat_messages_controller')

router.resource('chat-rooms', ChatRoomsController)
router.resource('chat-rooms.chat-messages', ChatMessagesController)
```

```bash
npm install openai
```

.env:

```text
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXX
```

chat_messages_controller.ts:

```ts
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
```

inertia/pages/chat-rooms/show.tsx:

```tsx
import { Head, Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
import { useState } from 'react'

function getCookie(name: string) {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}

export default function Show(props: InferPageProps<ChatRoomsController, 'show'>) {
  const { room } = props
  const [message, setMessage] = useState('')
  const initialMessages = room.chatMessages.map((m) => ({
    content: m.message,
    role: m.role as 'user' | 'system',
  }))
  const [chatMessages, setChatMessages] = useState<
    {
      content: string
      role: 'user' | 'system'
    }[]
  >(initialMessages)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newMessagesWithInput = [...chatMessages]
    newMessagesWithInput.push({ role: 'user', content: message })
    setChatMessages(newMessagesWithInput)
    setMessage('')

    const xsrfToken = getCookie('XSRF-TOKEN')
    try {
      const res = await fetch(`/chat-rooms/${room.id}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': xsrfToken ?? '',
        },
        body: JSON.stringify({
          message,
          chatRoomId: room.id,
        }),
      })
      const reader = res.body?.getReader()
      if (!reader) return
      let decoder = new TextDecoder()
      let content = ''
      let done = false
      let isFirst = true
      while (!done) {
        const data = await reader.read()
        done = data.done
        if (done) break
        const text = decoder.decode(data.value, { stream: true })
        content += text
        let newMessages = [...newMessagesWithInput]
        if (isFirst) {
          newMessages.push({
            role: 'system',
            content,
          })
        } else {
          newMessages.splice(-1, 1, {
            role: 'system',
            content,
          })
        }
        setChatMessages(newMessages)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Head title={room.name} />
      <div style={{ padding: '6rem', display: 'flex', flexDirection: 'column' }}>
        <h2>{room.name}</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            width: '100%',
          }}
        >
          <Link
            style={{
              width: 'fit-content',
            }}
            href={`/chat-rooms/${room.id}/edit`}
          >
            編集
          </Link>
          <Link
            style={{
              color: 'red',
              width: 'fit-content',
              border: 'none',
              textDecoration: 'underline',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            href={`/chat-rooms/${room.id}`}
            method="delete"
            as="button"
          >
            削除
          </Link>
          <Link
            style={{
              width: 'fit-content',
            }}
            href="/chat-rooms"
          >
            戻る
          </Link>
        </div>
        {/* Chat UI */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          {chatMessages.map((m, index) => (
            <div key={index}>
              <p>
                {m.role === 'user' ? '🙂' : '🤖'}: {m.content}
              </p>
            </div>
          ))}
        </div>

        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '2rem',
          }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid black',
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  )
}
```
