# 📘 DebtWatch API Documentation

> Backend: FastAPI + Firestore  
> Base URL: `http://localhost:8000`

---

## 📂 Users

### `POST /users/{user_id}`

**Deskripsi:** Tambah user baru  
**Body JSON:**

```json
{
  "full_name": "Fauzan Haris",
  "email": "fauzan@mail.com",
  "age": 24,
  "occupation": "Freelancer",
  "marital_status": "Single",
  "location": "Bandung"
}
```

---

### `GET /users/{user_id}`

Ambil profil user berdasarkan ID

---

### `PATCH /users/{user_id}`

Update sebagian data user

---

## 💳 Transactions

### `POST /users/{user_id}/transactions`

Tambah transaksi baru  
**Body JSON:**

```json
{
  "amount": 150000,
  "category": "makanan",
  "type": "expense", // atau "income"
  "note": "contoh catatan"
}
```

### `GET /users/{user_id}/transactions`

Ambil semua transaksi user

---

## 🏦 Active Loans

### `POST /users/{user_id}/active_loans`

Tambah utang aktif  
**Body JSON:**

```json
{
  "loan_type": "KTA",
  "monthly_payment": 750000,
  "remaining_months": 8,
  "total_loan_amount": 6000000
}
```

### `GET /users/{user_id}/active_loans`

Ambil semua utang aktif user

---

## 👨‍👩‍👧 Dependents

### `PATCH /users/{user_id}/dependents`

Update jumlah tanggungan

```json
{
  "dependents_count": 2
}
```

### `GET /users/{user_id}/dependents`

Ambil jumlah tanggungan

---

## 📉 Credit History

### `PATCH /users/{user_id}/credit_history`

Update riwayat kredit

```json
{
  "total_loans_taken": 3,
  "missed_payments": 1,
  "has_default_history": false
}
```

### `GET /users/{user_id}/credit_history`

Ambil data riwayat kredit user

---

## 🤖 Risk Score

### `GET /users/{user_id}/risk_scores/latest`

Ambil skor risiko terakhir (jika sudah dihitung)

### `POST /users/{user_id}/score` _(belum aktif)_

Hitung skor risiko dengan AI (akan aktif setelah model tersedia)

---

## ✅ Status

- Semua endpoint dapat diuji di [http://localhost:8000/docs](http://localhost:8000/docs)
- Import Postman Collection dari file: `API_collection.json`

---
