# Етап збірки
FROM node:20-alpine AS build

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності (включаючи lru-cache)
RUN npm install

# Копіюємо весь вихідний код
COPY . .

# Фінальний етап (runtime)
FROM node:20-alpine

WORKDIR /app

# Копіюємо тільки необхідне з етапу збірки
COPY --from=build /app /app

# Створюємо не-root користувача для безпеки (Best Practice #10)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]