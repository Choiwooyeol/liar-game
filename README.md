# 🎭 Liar Game (라이어 게임)

![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)

**실시간 멀티플레이어 소셜 추리 게임**

플레이어 중 한 명은 라이어(거짓말쟁이)가 되어 제시어를 모르는 상태로 게임에 참여합니다. 
라이어는 들키지 않게 거짓말을 하고, 시민들은 라이어를 찾아내야 합니다!

🎮 **[게임 플레이하기](https://choiwooyeol.github.io/liar-game/)**

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [게임 흐름](#-게임-흐름)
- [설치 및 실행](#-설치-및-실행)
- [환경 설정](#-환경-설정)
- [배포](#-배포)
- [프로젝트 구조](#-프로젝트-구조)

---

## ✨ 주요 기능

### 🎨 **현대적인 UI/UX**
- **Black & White 테마**: 세련된 흑백 디자인
- **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 지원
- **부드러운 애니메이션**: 페이드인, 호버 효과 등
- **직관적인 인터페이스**: 명확한 상태 표시 및 안내

### 🎮 **게임 기능**
- **실시간 멀티플레이어**: Firebase Realtime Database 기반
- **4자리 방 코드**: 간편한 방 생성 및 입장
- **자동 턴 관리**: 랜덤 순서 배정 및 자동 진행
- **60초 준비 시간**: 게임 시작 전 제시어 확인 시간
- **게임 타이머**: 게임 시작 후 경과 시간 표시 (00:00 형식)
- **다중 라운드 지원**: 1~8라운드 선택 가능
- **실시간 채팅**: 게임 중 자유로운 의사소통
- **발언 기록**: 이전 발언 내용 확인 가능
- **투표 시스템**: 라이어 지목 및 결과 확인
- **최후의 변론**: 라이어의 역전 기회

### 📖 **게임 설명 모달**
- 게임 방법을 단계별로 설명
- 대기실에서 언제든지 확인 가능

### 👥 **플레이어 관리**
- 호스트 권한 시스템
- 플레이어 목록 실시간 업데이트
- 본인 표시 및 호스트 배지

---

## 🛠 기술 스택

### **Frontend**
- **React 18.2.0** - UI 라이브러리
- **Vite 5.0.8** - 빌드 도구 및 개발 서버
- **Vanilla CSS** - 스타일링 (CSS Variables 활용)

### **Backend & Database**
- **Firebase Realtime Database** - 실시간 데이터 동기화
- **Firebase Hosting** (선택사항)

### **Deployment**
- **GitHub Pages** - 정적 사이트 호스팅
- **gh-pages** - 자동 배포 도구

### **Development Tools**
- **ESLint** - 코드 품질 관리
- **Git** - 버전 관리

---

## 🎯 게임 흐름

### 1️⃣ **대기실 (Lobby)**
```
플레이어 입장 → 닉네임 입력 → 방 만들기 or 방 입장
```
- 4자리 방 코드로 간편하게 입장
- 게임 설명 버튼으로 규칙 확인 가능

### 2️⃣ **대기방 (Room)**
```
플레이어 대기 → 호스트가 라운드 선택 → 게임 시작
```
- 플레이어 목록 실시간 확인
- 호스트만 게임 시작 가능
- 1~8라운드 중 선택

### 3️⃣ **게임 준비 (60초)**
```
게임 시작 → 60초 카운트다운 → 제시어 확인
```
- **시민**: 실제 제시어 확인
- **라이어**: 가짜 제시어 확인 (또는 제시어 없음)
- 준비 시간 동안 전략 수립

### 4️⃣ **발언 진행**
```
순서대로 발언 → 각자 한 문장씩 설명 → 다음 라운드 or 투표
```
- 랜덤 순서로 진행
- 현재 차례인 플레이어 강조 표시
- 발언 기록 확인 가능
- 실시간 채팅으로 자유 토론

### 5️⃣ **투표**
```
모든 라운드 종료 → 라이어 투표 → 최다 득표자 지목
```
- 각 플레이어가 한 명씩 지목
- 투표 현황 실시간 표시
- 최다 득표자 자동 선정

### 6️⃣ **최후의 변론**
```
지목된 플레이어 → 제시어 맞추기 시도
```
- **라이어가 맞게 지목됨**: 라이어가 제시어를 맞추면 라이어 승리, 틀리면 시민 승리
- **시민이 잘못 지목됨**: 라이어 즉시 승리

### 7️⃣ **결과 화면**
```
승자 발표 → 라이어 공개 → 제시어 공개 → 대기실로 복귀
```
- 승리 진영 표시 (라이어 vs 시민)
- 라이어 및 제시어 공개
- 호스트가 대기실로 복귀

---

## 🚀 설치 및 실행

### **필수 요구사항**
- Node.js 16.x 이상
- npm 또는 yarn

### **1. 저장소 클론**
```bash
git clone https://github.com/Choiwooyeol/liar-game.git
cd liar-game
```

### **2. 의존성 설치**
```bash
npm install
```

### **3. 환경 변수 설정**
프로젝트 루트에 `.env` 파일 생성:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **4. 개발 서버 실행**
```bash
npm run dev
```
→ `http://localhost:5173` 에서 확인

---

## � 환경 설정

### **Firebase 설정**

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. **Realtime Database** 활성화
3. **Database Rules** 설정 (개발용):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
⚠️ **프로덕션 환경에서는 보안 규칙을 강화하세요!**

4. 프로젝트 설정에서 웹 앱 추가 후 구성 정보 복사
5. `.env` 파일에 Firebase 구성 정보 입력

### **보안 주의사항**
- ✅ `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다
- ✅ Firebase 토큰은 환경 변수로 관리됩니다
- ⚠️ `.env` 파일을 절대 공개 저장소에 업로드하지 마세요

---

## 📦 배포

### **GitHub Pages 자동 배포**

```bash
npm run deploy
```

이 명령어는 자동으로:
1. 모든 변경사항을 Git에 커밋
2. 프로젝트 빌드
3. GitHub Pages에 배포

### **수동 배포**
```bash
# 1. 변경사항 커밋
git add .
git commit -m "Update"

# 2. 빌드 및 배포
npm run build
npm run deploy
```

### **배포 확인**
- 배포 후 1-2분 대기
- `https://[username].github.io/liar-game/` 접속
- 브라우저 캐시 삭제 또는 시크릿 모드로 확인

---

## 📁 프로젝트 구조

```
liar-game/
├── src/
│   ├── components/
│   │   ├── Lobby.jsx           # 대기실 (방 생성/입장)
│   │   ├── Room.jsx            # 대기방 (게임 시작 전)
│   │   ├── Game.jsx            # 메인 게임 로직
│   │   ├── Chat.jsx            # 실시간 채팅
│   │   └── game/
│   │       ├── PlayerHeader.jsx    # 플레이어 목록 헤더
│   │       ├── HistoryModal.jsx    # 발언 기록 모달
│   │       ├── InputModal.jsx      # 발언 입력 모달
│   │       └── RuleModal.jsx       # 게임 설명 모달
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   ├── firebase.js             # Firebase 설정
│   ├── words.js                # 게임 단어 목록
│   ├── index.css               # 글로벌 스타일
│   └── main.jsx                # 앱 진입점
├── .env                        # 환경 변수 (Git 제외)
├── .gitignore                  # Git 제외 파일 목록
├── package.json                # 프로젝트 설정
├── vite.config.js              # Vite 설정
└── README.md                   # 프로젝트 문서
```

---

## 🎨 디자인 특징

### **Color Palette**
- **Background**: `#050505` (거의 검정)
- **Card Background**: `#111111` (어두운 회색)
- **Text**: `#FFFFFF` (흰색)
- **Muted Text**: `#888888` (회색)
- **Border**: `#333333` (어두운 테두리)

### **Typography**
- **Font Family**: Inter, system-ui
- **Heading**: 800 weight, uppercase
- **Body**: 400 weight

### **Responsive Breakpoints**
- Mobile: `< 600px`
- Tablet: `600px - 1024px`
- Desktop: `> 1024px`

---

## 🐛 알려진 이슈

- Firebase Realtime Database가 "test mode"로 설정되어 있어 보안이 취약합니다 (프로덕션 환경에서는 규칙 강화 필요)
- 플레이어가 중간에 나가면 게임이 중단될 수 있습니다

---

## 📝 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

---

## 👨‍💻 개발자

**Made by 우철탄**

---

## 🙏 감사의 말

이 프로젝트는 친구들과 즐겁게 플레이할 수 있는 게임을 만들고자 시작되었습니다.
