# Sneaker API

API RESTful cho ứng dụng bán giày sneaker được xây dựng với Node.js và Express.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/v1/products` - Lấy tất cả sản phẩm
- `GET /api/v1/products/:id` - Lấy sản phẩm theo ID
- `POST /api/v1/products` - Tạo sản phẩm mới
- `PUT /api/v1/products/:id` - Cập nhật sản phẩm
- `DELETE /api/v1/products/:id` - Xóa sản phẩm

### Users
- `GET /api/v1/users` - Lấy tất cả người dùng
- `GET /api/v1/users/:id` - Lấy người dùng theo ID
- `POST /api/v1/users` - Tạo người dùng mới
- `PUT /api/v1/users/:id` - Cập nhật người dùng
- `DELETE /api/v1/users/:id` - Xóa người dùng

### Health Check
- `GET /health` - Kiểm tra trạng thái API

## Cấu trúc thư mục

```
app-sneaker-api/
├── src/
│   ├── controllers/     # Controllers xử lý logic
│   ├── routes/          # Định nghĩa routes
│   ├── app.js           # Cấu hình Express app
│   └── server.js        # Entry point
├── .env                 # Biến môi trường
├── .gitignore
├── package.json
└── README.md
```

## Công nghệ sử dụng

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variables
- **Nodemon** - Auto-restart server (dev)

## Phan Văn Phát -- 221302026
