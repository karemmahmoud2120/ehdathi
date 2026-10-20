# المرحلة الأولى: بناء التطبيق
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# المرحلة الثانية: تشغيل التطبيق باستخدام serve
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

# Railway بيحدد البورت في متغير اسمه PORT، لو مش موجود هيستخدم 3000
ENV PORT=3000
EXPOSE 3000

# تشغيل التطبيق على البورت اللي Railway بيديه
CMD sh -c "serve -s dist -l ${PORT}"