# Waitlist API Documentation

이 문서는 Lovable로 개발된 프론트엔드 애플리케이션의 API 요구사항을 분석하여 작성되었습니다.

## 개요

Waitlist 애플리케이션은 사용자가 대기 목록을 생성하고 관리할 수 있는 서비스입니다. 주요 기능은 다음과 같습니다:

- 조직자(Organizer) 인증 및 계정 관리
- 서비스(Waitlist) 생성 및 관리
- 대기자(Participant) 등록 및 관리
- 통계 및 분석 데이터 제공

## Base URL

```
https://api.waitlist.com/api
```

## 인증 (Authentication)

### 1. 회원가입 (Sign Up)

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. 로그인 (Login)

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

## 대시보드 (Dashboard)

### 3. 대시보드 통계 조회

**Endpoint:** `GET /dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalServices": 3,
    "totalParticipants": 1247,
    "activeWaitlists": 3,
    "recentSignups": 52
  }
}
```

## 서비스 관리 (Service Management)

### 4. 서비스 목록 조회

**Endpoint:** `GET /services`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service_id_1",
        "name": "Premium App Launch",
        "slug": "premium-app-launch",
        "participantCount": 523,
        "waitlistUrl": "/waitlist/premium-app-launch",
        "createdAt": "2024-01-15T10:00:00Z",
        "isActive": true
      }
    ]
  }
}
```

### 5. 서비스 생성

**Endpoint:** `POST /services`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "New Service Name",
  "slug": "new-service-slug",
  "description": "Service description",
  "backgroundImage": "image_url" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "new_service_id",
      "name": "New Service Name",
      "slug": "new-service-slug",
      "description": "Service description",
      "participantCount": 0,
      "waitlistUrl": "/waitlist/new-service-slug",
      "createdAt": "2024-01-20T10:00:00Z",
      "isActive": true
    }
  }
}
```

### 6. 서비스 상세 조회

**Endpoint:** `GET /services/{serviceId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service_id",
      "name": "Premium App Launch",
      "slug": "premium-app-launch",
      "description": "Join thousands of users...",
      "participantCount": 523,
      "participants": [
        {
          "id": "participant_id",
          "email": "user@example.com",
          "joinedAt": "2024-01-16T10:00:00Z"
        }
      ],
      "waitlistUrl": "/waitlist/premium-app-launch",
      "createdAt": "2024-01-15T10:00:00Z",
      "isActive": true,
      "settings": {
        "requireEmailVerification": false,
        "sendWelcomeEmail": true,
        "customSuccessMessage": "You're on the list!"
      }
    }
  }
}
```

### 7. 서비스 업데이트

**Endpoint:** `PUT /services/{serviceId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Updated Service Name",
  "description": "Updated description",
  "isActive": true,
  "settings": {
    "requireEmailVerification": true,
    "sendWelcomeEmail": true,
    "customSuccessMessage": "Custom message"
  }
}
```

### 8. 서비스 삭제

**Endpoint:** `DELETE /services/{serviceId}`

**Headers:**
```
Authorization: Bearer {token}
```

## 공개 API (Public API)

### 9. 공개 대기 목록 정보 조회

**Endpoint:** `GET /public/waitlists/{slug}`

**Response:**
```json
{
  "success": true,
  "data": {
    "waitlist": {
      "title": "Premium App Launch",
      "description": "Join thousands of users waiting for our revolutionary productivity app...",
      "background": "https://example.com/background.jpg",
      "currentParticipants": 523
    }
  }
}
```

### 10. 대기 목록 참여

**Endpoint:** `POST /public/waitlists/{slug}/join`

**Request Body:**
```json
{
  "email": "participant@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully joined the waitlist",
    "participant": {
      "id": "participant_id",
      "email": "participant@example.com",
      "joinedAt": "2024-01-20T10:00:00Z",
      "position": 524
    }
  }
}
```

## 참가자 관리 (Participant Management)

### 11. 참가자 목록 조회

**Endpoint:** `GET /services/{serviceId}/participants`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 50)
- `search`: 이메일 검색어

**Response:**
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "id": "participant_id",
        "email": "user@example.com",
        "joinedAt": "2024-01-16T10:00:00Z",
        "position": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 523,
      "totalPages": 11
    }
  }
}
```

### 12. 참가자 삭제

**Endpoint:** `DELETE /services/{serviceId}/participants/{participantId}`

**Headers:**
```
Authorization: Bearer {token}
```

## 에러 응답 형식

모든 API 에러는 다음과 같은 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

### 주요 에러 코드

- `UNAUTHORIZED`: 인증되지 않은 요청
- `FORBIDDEN`: 권한이 없는 리소스 접근
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `VALIDATION_ERROR`: 입력 데이터 유효성 검사 실패
- `DUPLICATE_EMAIL`: 이미 등록된 이메일
- `DUPLICATE_SLUG`: 이미 사용 중인 slug
- `INTERNAL_ERROR`: 서버 내부 오류

## 추가 고려사항

1. **Rate Limiting**: API 호출 제한 구현 필요
2. **CORS**: 프론트엔드 도메인에 대한 CORS 설정 필요
3. **Webhook**: 참가자 등록 시 외부 서비스 연동을 위한 webhook 지원
4. **Export**: 참가자 목록 CSV/Excel 내보내기 기능
5. **Analytics**: 상세한 통계 및 분석 API
6. **Email Service**: 이메일 발송 서비스 통합