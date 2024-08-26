## プロジェクト作成

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
  declare name: string;

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

```ts
const ChatRoomsController = () => import('#controllers/chat_rooms_controller')
router.resource('chat-rooms', ChatRoomsController)
```

indexアクションを編集

```ts
  async index({}: HttpContext) {
    const rooms = await ChatRoom.all()
    return rooms
  }

  async show({ params }: HttpContext) {
    const room = await ChatRoom.findOrFail(params.id)
    return room
  }
```

`http://localhost:3333/chat-rooms` と `http://localhost:3333/chat-rooms/1` へアクセスしてみる


## View

一覧画面のinertia/pages/chat-rooms/index.tsxを手動で作成

```tsx
import { Link } from '@inertiajs/react'
import ChatRoom from '#models/chat_room'
export default function Index(props: { rooms: ChatRoom[] }) {
  return (
    <div style={{ padding: '6rem' }}>
      <h2>チャット履歴</h2>
      <ul>
        {props.rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/chat-rooms/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

詳細画面のinertia/pages/chat-rooms/show.tsxを手動で作成

```tsx
import { Link } from '@inertiajs/react'
import ChatRoom from '#models/chat_room'
export default function Show(props: { room: ChatRoom }) {
  const { room } = props
  return (
    <div style={{ padding: '6rem' }}>
      <h2>{room.name}</h2>
      <Link href="/chat-rooms">戻る</Link>
      <p>ここにチャットUI作成予定</p>
    </div>
  )
}

```


app/controllers/chat_rooms_controller.tsを変更


```ts
async index({ inertia }: HttpContext) {
  const rooms = await ChatRoom.all()
  return inertia.render('chat-rooms/index', { rooms })
}

async show({ params, inertia }: HttpContext) {
  const room = await ChatRoom.findOrFail(params.id)
  return inertia.render('chat-rooms/show', { room })
}
```


(オプショナル) propsの型をControllerとReactで共有する


inertia/pages/chat-rooms/index.tsxを変更

```ts
import { Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
export default function Index(props: InferPageProps<ChatRoomsController, 'index'>) {
  return (
    <div style={{ padding: '6rem' }}>
      <h2>チャット履歴</h2>
      <ul>
        {props.rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/chat-rooms/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

inertia/pages/chat-rooms/show.tsxを変更

```tsx
import { Link } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
export default function Show(props: InferPageProps<ChatRoomsController, 'show'>) {
  const { room } = props
  return (
    <div style={{ padding: '6rem' }}>
      <h2>{room.name}</h2>
      <Link href="/chat-rooms">戻る</Link>
      <p>ここにチャットUI作成予定</p>
    </div>
  )
}
```

app/controllers/chat_rooms_controller.tsを変更（Modelのシリアライズ）

https://docs.adonisjs.com/guides/views-and-templates/inertia#model-serialization

```ts
async index({ inertia }: HttpContext) {
  const rooms = await ChatRoom.all()
  return inertia.render('chat-rooms/index', {
    rooms: rooms.map((r) => ({
      id: r.id,
      name: r.name,
    })),
  })
}

async show({ params, inertia }: HttpContext) {
  const room = await ChatRoom.findOrFail(params.id)
  return inertia.render('chat-rooms/show', {
    room: {
      id: room.id,
      name: room.name,
    },
  })
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

```ts
  async create({ inertia }: HttpContext) {
    return inertia.render('chat-rooms/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createChatRoomValidator)
    const room = await ChatRoom.create(payload)

    return response.redirect(`/chat-rooms/${room.id}`)
  }

  async edit({ params, inertia }: HttpContext) {
    const room = await ChatRoom.findOrFail(params.id)
    return inertia.render('chat-rooms/edit', {
      room: {
        id: room.id,
        name: room.name,
      },
    })
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateChatRoomValidator)
    const room = await ChatRoom.findOrFail(params.id)
    room.merge(payload)
    await room.save()

    return response.redirect(`/chat-rooms/${room.id}`)
  }
```

inertia/pages/chat-rooms/create.tsxを作成

```tsx
import ChatRoom from '#models/chat_room'
import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
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
    <div style={{ padding: '6rem' }}>
      <h2>ルームを作成</h2>
      <Link href="/chat-rooms">戻る</Link>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
          />
          {errors?.name && <p style={{ color: 'red' }}>{errors.name.join(', ')}</p>}
        </div>
        <button type="submit">作成</button>
      </form>
    </div>
  )
}

```


inertia/pages/chat-rooms/edit.tsxを作成

```tsx
import { Link, router } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'
import ChatRoomsController from '#controllers/chat_rooms_controller'
import { useState } from 'react'
import ChatRoom from '#models/chat_room'
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
    <div style={{ padding: '6rem' }}>
      <h2>ルームを編集</h2>
      <Link href="/chat-rooms">戻る</Link>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
          />
          {props.errors?.name && <p style={{ color: 'red' }}>{props.errors.name.join(', ')}</p>}
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  )
}

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
```ts
  async destroy({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(deleteChatRoomValidator)
    const room = await ChatRoom.findOrFail(params.id)
    await room.delete()
    return response.redirect('/chat-rooms')
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
