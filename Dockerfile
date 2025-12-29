FROM node:jod-alpine

WORKDIR /app

# Đang build image, cope file trước để cài thư viện
COPY package*.json ./
RUN npm install

# Chạy lúc container start, đã map thư mục backend > app
CMD ["npm", "run" ,"dev"]
