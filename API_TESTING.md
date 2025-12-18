# API Testing Commands

Kumpulan command untuk testing API MyKasir menggunakan curl atau Postman.

## 🔐 Authentication

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mykasir.com",
    "password": "admin123",
    "name": "Admin Kasir",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mykasir.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "email": "admin@mykasir.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Simpan token untuk request selanjutnya!**

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📦 Products

### Get All Products
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Products with Search
```bash
curl -X GET "http://localhost:3000/api/products?search=kopi" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kopi Susu",
    "category": "Minuman",
    "price": 15000,
    "stock": 50,
    "minStock": 10
  }'
```

### Update Product
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kopi Susu Premium",
    "price": 18000,
    "stock": 45
  }'
```

### Update Stock Only
```bash
curl -X PATCH http://localhost:3000/api/products/1/stock \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 100
  }'
```

### Delete Product
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Low Stock Products
```bash
curl -X GET http://localhost:3000/api/products/low-stock \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👥 Customers

### Get All Customers
```bash
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```

### Update Customer
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

### Delete Customer
```bash
curl -X DELETE http://localhost:3000/api/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💳 Transactions

### Get All Transactions
```bash
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Transactions by Date Range
```bash
curl -X GET "http://localhost:3000/api/transactions?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "productName": "Kopi Susu",
        "unitPrice": 15000,
        "quantity": 3
      },
      {
        "productName": "Nasi Goreng",
        "unitPrice": 20000,
        "quantity": 2
      }
    ]
  }'
```

**Note:** Total akan dihitung otomatis (3 * 15000 + 2 * 20000 = 85000)

### Delete Transaction
```bash
curl -X DELETE http://localhost:3000/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Reports

### Get Sales Report (Today)
```bash
curl -X GET "http://localhost:3000/api/reports/sales?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Sales Report (This Week)
```bash
curl -X GET "http://localhost:3000/api/reports/sales?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Sales Report (This Month)
```bash
curl -X GET "http://localhost:3000/api/reports/sales?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Sales Report (Custom Date Range)
```bash
curl -X GET "http://localhost:3000/api/reports/sales?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Detailed Report
```bash
curl -X GET "http://localhost:3000/api/reports/detailed?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Complete Test Flow

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login (simpan token dari response)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### 2. Create Products
```bash
TOKEN="YOUR_TOKEN_HERE"

# Product 1
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kopi Susu","category":"Minuman","price":15000,"stock":50,"minStock":10}'

# Product 2
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nasi Goreng","category":"Makanan","price":20000,"stock":30,"minStock":5}'

# Product 3
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Es Teh Manis","category":"Minuman","price":5000,"stock":100,"minStock":20}'
```

### 3. Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pelanggan Setia"}'
```

### 4. Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"productName":"Kopi Susu","unitPrice":15000,"quantity":2},
      {"productName":"Nasi Goreng","unitPrice":20000,"quantity":1}
    ]
  }'
```

### 5. Check Reports
```bash
curl -X GET "http://localhost:3000/api/reports/sales?period=today" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 PowerShell Version

Untuk Windows PowerShell, gunakan format ini:

```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"admin@mykasir.com","password":"admin123"}'

$token = $response.token
Write-Host "Token: $token"

# Get Products
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
  -Method Get `
  -Headers $headers
```

---

## 📱 Testing dari Postman

1. **Import Collection** (jika ada file Postman collection)
2. **Atau buat manual:**
   - Buat Environment baru: `MyKasir`
   - Tambah variable: `baseUrl` = `http://localhost:3000`
   - Tambah variable: `token` = (akan diisi setelah login)
3. **Setup Authorization:**
   - Type: Bearer Token
   - Token: `{{token}}`

---

## ✅ Expected Responses

Semua endpoint yang berhasil akan return:
```json
{
  "status": "success",
  "message": "...",  // optional
  "data": {...}      // optional
}
```

Endpoint yang error akan return:
```json
{
  "status": "error",
  "message": "Error message here"
}
```

---

## 🎯 Tips

1. Simpan token setelah login di variabel environment
2. Test endpoint secara berurutan (register → login → create data → test fitur)
3. Cek database MySQL untuk validasi data tersimpan
4. Gunakan Postman untuk testing yang lebih mudah
5. Cek terminal backend untuk log error jika ada masalah
