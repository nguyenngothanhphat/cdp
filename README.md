# Customer Data Platform (CDP) Integration Service

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</p>

## 🚀 Giới thiệu

Dự án này là một Customer Data Platform (CDP) Integration Service được xây dựng bằng NestJS và Node.js, tận dụng các dịch vụ cốt lõi của AWS (như S3, Secrets Manager, RDS, DynamoDB, ElastiCache cho Redis) để tích hợp dữ liệu khách hàng từ nhiều nguồn khác nhau (cơ sở dữ liệu SQL và API RESTful) vào một định dạng thống nhất trong cơ sở dữ liệu NoSQL.

Giải pháp này được thiết kế để xử lý lượng lớn dữ liệu bằng cách sử dụng hệ thống hàng đợi BullMQ (dựa trên Redis), đảm bảo tính bền vững, khả năng mở rộng và chịu lỗi.

## ✨ Các tính năng chính

- **Tích hợp đa nguồn**: Thu thập dữ liệu khách hàng từ SQL Database (PostgreSQL/MySQL) và RESTful APIs
- **Chuyển đổi & Hợp nhất dữ liệu**: Chuyển đổi dữ liệu thô từ các nguồn thành một định dạng khách hàng thống nhất và hợp nhất các bản ghi trùng lặp
- **Xử lý bất đồng bộ với Queue**: Sử dụng BullMQ và Redis để quản lý các tác vụ xử lý dữ liệu
- **Lưu trữ NoSQL**: Lưu trữ dữ liệu khách hàng đã được chuẩn hóa và hợp nhất vào MongoDB (hoặc DynamoDB trên AWS)
- **Bảo mật dữ liệu**: Triển khai các biện pháp bảo mật từ truyền tải, lưu trữ đến quản lý thông tin xác thực
- **Khả năng mở rộng**: Kiến trúc microservice/worker cho phép mở rộng các thành phần độc lập

## 🏛️ Kiến trúc Giải pháp

```
+----------------+       +-------------------+       +--------------------+       +---------------------+
|   SQL Database | ----> |   NestJS/NodeJS   | ----> |     Message Queue  | ----> |   NestJS/NodeJS     |
| (PostgreSQL/MySQL) |     |   (Data Ingestion |       |   (BullMQ/Redis)   |       |   (Data Processing  |
|                |       |     Service)      |       |                    |       |     Service)      |
+----------------+       +-------------------+       +--------------------+       +---------------------+
                                  |                                                       |
                                  |                                                       V
+----------------+       +-------------------+       +--------------------+       +---------------------+
|  RESTful API   | ----> |   NestJS/NodeJS   | ----> |     Message Queue  | ----> |   NoSQL Database    |
|                |       |   (Data Ingestion |       |   (BullMQ/Redis)   |       |   (MongoDB/DynamoDB)|
|                |       |     Service)      |       |                    |       |                     |
+----------------+       +-------------------+       +--------------------+       +---------------------+
```

## 🛠️ Công nghệ & Công cụ

- **Ngôn ngữ**: TypeScript
- **Framework**: NestJS
- **Runtime**: Node.js
- **Hàng đợi**: BullMQ (dựa trên Redis)
- **Cơ sở dữ liệu**:
  - SQL Source: PostgreSQL / MySQL (qua TypeORM)
  - NoSQL Target: MongoDB (qua Mongoose)
  - Cache/Queue Storage: Redis
- **Tích hợp API**: Axios (qua @nestjs/axios)
- **Quản lý bí mật**: AWS Secrets Manager
- **Triển khai**: Docker, AWS EC2 / ECS / Lambda, AWS RDS, AWS DynamoDB, AWS ElastiCache

## ⚙️ Cài đặt & Chạy Dự án

### Yêu cầu Tiên quyết

- Node.js (phiên bản 18 trở lên)
- npm hoặc Yarn
- Docker (để chạy các dịch vụ DB/Redis cục bộ)
- Instance PostgreSQL/MySQL, MongoDB, Redis đang chạy

### 1. Sao chép Repository

```bash
git clone <URL_repository_của_bạn>
cd customer-data-platform
```

### 2. Cài đặt Dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình Biến môi trường

Tạo file `.env` trong thư mục gốc của dự án:

```env
# Cấu hình ứng dụng
APP_PORT=3000
NODE_ENV=development

# Cấu hình SQL Database
SQL_DB_HOST=localhost
SQL_DB_PORT=5432
SQL_DB_USERNAME=your_sql_user
SQL_DB_PASSWORD=your_sql_password
SQL_DB_NAME=customer_db_sql
SQL_DB_SYNCHRONIZE=false

# Cấu hình NoSQL Database
NOSQL_DB_URI=mongodb://localhost:27017/customer_cdp_db

# Cấu hình Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Cấu hình RESTful API Source
REST_API_BASE_URL=http://localhost:4000/api
REST_API_KEY=your_rest_api_key

# Cấu hình AWS
AWS_REGION=ap-southeast-1
AWS_SECRETS_MANAGER_SECRET_ID=your-cdp-secrets
```

### 4. Chạy các dịch vụ Database và Redis (Local)

```bash
docker-compose up -d
```

### 5. Build ứng dụng

```bash
npm run build
# hoặc
yarn build
```

### 6. Chạy ứng dụng

#### Chạy Main Application (API & Producer)

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

#### Chạy Worker (Consumer)

```bash
# Development
npm run start:worker:dev

# Production
npm run start:worker:prod
```

## 💡 Cách sử dụng

### 1. Kích hoạt Ingestion dữ liệu

```bash
# Tích hợp từ SQL (full load)
curl -X POST http://localhost:3000/api/v1/ingest/sql

# Tích hợp từ SQL (incremental load)
curl -X POST "http://localhost:3000/api/v1/ingest/sql?lastSyncTime=2025-06-01T00:00:00Z"

# Tích hợp từ REST API
curl -X POST http://localhost:3000/api/v1/ingest/api

# Tích hợp từ cả hai nguồn
curl -X POST http://localhost:3000/api/v1/ingest/all
```

### 2. Giám sát quá trình xử lý

- Theo dõi logs của Main Application và Worker
- Sử dụng Redis CLI để kiểm tra trạng thái queue
- Cài đặt Bull Board để có giao diện quản lý queue

### 3. Kiểm tra dữ liệu

Kết nối với MongoDB/DynamoDB để kiểm tra dữ liệu đã được xử lý.

## 🔒 Bảo mật Dữ liệu

- Mã hóa khi truyền tải (HTTPS/SSL/TLS)
- Mã hóa khi lưu trữ
- Quản lý bí mật qua AWS Secrets Manager
- Kiểm soát truy cập theo nguyên tắc quyền tối thiểu
- Ghi log an toàn, tránh lưu thông tin PII

## 📝 License

[MIT licensed](LICENSE)
