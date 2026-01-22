# Тестовое задание: REST API «Комментарии к задачам»

Стек: **Node.js, NestJS, TypeORM, PostgreSQL, TypeScript**, JWT (access + refresh), Swagger, валидация DTO.

## Быстрый старт

1) Установить зависимости:
```bash
npm i
```

2) Поднять PostgreSQL:
```bash
cp .env.example .env
docker compose up -d
```

3) Запустить API:
```bash
npm run start:dev
```

Swagger: `http://localhost:3000/swagger`

## Переменные окружения

См. `.env.example`. Минимально нужны:
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`

`TYPEORM_SYNCHRONIZE=true` включён по умолчанию для простого запуска тестового (в проде это обычно выключают и используют миграции).

Примечание: по умолчанию `docker-compose.yml` пробрасывает Postgres на **5433**, чтобы не конфликтовать с локальным Postgres на 5432.

## Архитектура

Модули:
- `AuthModule` — регистрация/логин/refresh/logout (refresh токен хранится в БД **в виде хеша**).
- `UsersModule` — CRUD пользователей.
- `TasksModule` — CRUD задач.
- `CommentsModule` — CRUD комментариев к задачам.

Общее:
- `ValidationPipe` глобально: `whitelist=true`, `forbidNonWhitelisted=true`, `transform=true`.
- JWT доступ через `Authorization: Bearer <accessToken>`.
- Swagger доступен на `/swagger`.

## Роли и бизнес-правила

Роли: `user` и `author`.

Реализовано:
1) **Только `user` может создать задачу** (`POST /tasks`).
2) **Только `author` может создать комментарий** (`POST /comments`).
3) **Редактировать/удалять комментарий может только его владелец** (сравнение `comment.userId` с `JWT.sub`).
4) **Задачи и комментарии возвращаются отсортированными по дате (новые первыми)**.
5) **Связь 1:N**: у задачи много комментариев, комментарий принадлежит ровно одной задаче.

Дополнительно (логично для CRM и безопасности): редактировать/удалять задачу может только её владелец.

## Эндпоинты

### Auth
- `POST /auth/register` — создать пользователя и вернуть пару токенов
- `POST /auth/login` — логин (минимально: `id + password`) и вернуть пару токенов
- `POST /auth/refresh` — обновить пару токенов (ротация refresh)
- `POST /auth/logout` — инвалидировать refresh токен

Алиасы под базой `/users` (чтобы формально закрыть часть “авторизация/регистрация пользователя” в рамках Users):
- `POST /users/register`
- `POST /users/login`
- `POST /users/refresh`
- `POST /users/logout`

### Users
- `POST /users` — создать пользователя (по смыслу эквивалент регистрации)
- `GET /users/:id` — получить пользователя по id (JWT)
- `GET /users` — список пользователей (JWT)
- `PATCH /users/:id` — редактировать (только владелец) (JWT)
- `DELETE /users/:id` — удалить (только владелец) (JWT)

### Tasks (JWT обязателен)
- `POST /tasks` — создать задачу (только `user`, `description` и `comment` обязательны)
- `GET /tasks/:id` — получить задачу по id
- `GET /tasks` — список задач (новые первыми)
- `PATCH /tasks/:id` — редактировать (только владелец, только `user`)
- `DELETE /tasks/:id` — удалить (только владелец, только `user`)

### Comments (JWT обязателен)
- `POST /comments` — создать комментарий (только `author`)
- `GET /comments?task_id=...` — список комментариев к задаче (новые первыми)
- `GET /comments/:id` — получить комментарий по id
- `PATCH /comments/:id` — редактировать (только владелец)
- `DELETE /comments/:id` — удалить (только владелец)

## E2E тесты

Тесты поднимают приложение in-memory и подключаются к Postgres из `docker-compose.yml`.
```bash
docker compose up -d
npm run test:e2e
```

## Примечания по моделям

В тестовом описании у `Users` присутствует поле `task_id`. При этом по бизнес-логике задача принадлежит пользователю и корректная связь — `User 1:N Task`.

Чтобы **и не потерять поле из спецификации**, и **сохранить нормальную модель**, поле `users.task_id` добавлено как *nullable* и не используется в основной доменной логике. Основная связь делается через `tasks.user_id`.
