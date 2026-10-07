FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "if [ \"$MODE\" = 'development' ]; then npm run dev; else npm start; fi"]


