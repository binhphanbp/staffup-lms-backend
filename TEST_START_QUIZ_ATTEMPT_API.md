# Test Flow: Start Quiz Attempt API (Simplified)

## Mục đích

Test API bắt đầu làm quiz - validate max attempts, tạo quiz attempt, sinh attempt_no

## Endpoint

```
POST /api/v1/quiz-attempts/start
```

---

## Quick Test với Postman (2 bước)

### Bước 1: Login để lấy Token

**Request:**

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "student1@example.com",
  "password": "Test1234"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Copy `token`

---

### Bước 2: Start Quiz Attempt với Data có sẵn từ Seed

**Request:**

```
POST http://localhost:3000/api/v1/quiz-attempts/start
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "quizId": "1",
  "enrollmentId": "1"
}
```

**Note:** Dùng ID từ seed data. Nếu không work, thử các ID khác: quizId: "2", "3", enrollmentId: "2", "3"

---

## Test Cases

### Test Case 1: Start Quiz Attempt (Success)

**Request:**

```
POST http://localhost:3000/api/v1/quiz-attempts/start
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "quizId": "1",
  "enrollmentId": "1"
}
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "attemptId": "1",
    "attemptNo": 1,
    "quizId": "1",
    "quizTitle": "Node.js Basics Quiz",
    "timeLimitMinutes": 30,
    "totalQuestions": 5,
    "startedAt": "2026-04-06T14:30:00.000Z"
  },
  "message": "Quiz attempt started successfully"
}
```

---

### Test Case 2: Start Again (Should Fail - In Progress)

**Request:** (Same request)

```
POST http://localhost:3000/api/v1/quiz-attempts/start
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "quizId": "1",
  "enrollmentId": "1"
}
```

**Expected Response (400 Bad Request):**

```json
{
  "success": false,
  "status": "fail",
  "message": "You already have an in-progress attempt for this quiz. Please complete or abandon it first."
}
```

---

### Test Case 3: Invalid Quiz ID

**Request:**

```
POST http://localhost:3000/api/v1/quiz-attempts/start
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "quizId": "99999",
  "enrollmentId": "1"
}
```

**Expected Response (404 Not Found):**

```json
{
  "success": false,
  "status": "fail",
  "message": "Quiz not found in this course"
}
```

---

### Test Case 4: Invalid Enrollment ID

**Request:**

```
POST http://localhost:3000/api/v1/quiz-attempts/start
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "quizId": "1",
  "enrollmentId": "99999"
}
```

**Expected Response (404 Not Found):**

```json
{
  "success": false,
  "status": "fail",
  "message": "Enrollment not found"
}
```

---

### Test Case 5: Missing Token

**Request:**

```
POST http://localhost:3000/api/v1/quiz-attempts/start
Content-Type: application/json

{
  "quizId": "1",
  "enrollmentId": "1"
}
```

**Expected Response (401 Unauthorized):**

```json
{
  "success": false,
  "status": "fail",
  "message": "No token provided"
}
```

---

## Seed Data Reference

Từ `prisma/seed.js`:

**Test Accounts:**

- Email: `student1@example.com` / Password: `Test1234`
- Email: `student2@example.com` / Password: `Test1234`

**Typical IDs (có thể khác tùy database):**

- quizId: 1, 2, 3...
- enrollmentId: 1, 2, 3...
- courseId: 1, 2, 3...

**Nếu không biết ID chính xác:**

1. Check database trực tiếp
2. Hoặc dùng pgAdmin/DBeaver để xem data
3. Hoặc thử các ID từ 1-10

---

## Postman Quick Setup

1. **Create Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/quiz-attempts/start`

2. **Headers:**
   - `Authorization`: `Bearer {YOUR_TOKEN}`
   - `Content-Type`: `application/json`

3. **Body (raw JSON):**

   ```json
   {
     "quizId": "1",
     "enrollmentId": "1"
   }
   ```

4. **Send!**

---

## Troubleshooting

**Lỗi: "Enrollment not found"**
→ Thử enrollmentId khác: "2", "3", "4"...

**Lỗi: "Quiz not found in this course"**
→ Quiz không thuộc course của enrollment đó. Thử quizId khác hoặc enrollmentId khác

**Lỗi: "Quiz has no questions"**
→ Quiz chưa có câu hỏi. Thử quiz khác

**Lỗi: 401 Unauthorized**
→ Token sai hoặc hết hạn. Login lại

**Lỗi: 500 Internal Server Error**
→ Check server logs: `docker-compose logs api`

---

## Expected Behavior

✅ **Lần 1:** Tạo attempt thành công, attemptNo = 1
✅ **Lần 2:** Lỗi "already have in-progress attempt"
✅ **Questions được shuffle** nếu quiz.shuffleQuestions = true
✅ **Options được shuffle** nếu quiz.shuffleOptions = true
✅ **Snapshot data** được lưu để đảm bảo consistency
