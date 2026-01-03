# Liar Game: 라이어 게임 만들기 가이드

이 문서는 초보자도 쉽게 따라 할 수 있도록 개발 환경 설정부터 GitHub Pages 배포까지의 모든 과정을 담고 있습니다.

---

## 1. 필수 준비물 (설치 필요)

개발을 시작하기 전에 컴퓨터에 다음 프로그램들이 설치되어 있어야 합니다.

1.  **Node.js (필수)**
    *   **역할**: 자바스크립트 프로그램을 실행해 주는 도구입니다.
    *   **설치**: [Node.js 공식 홈페이지](https://nodejs.org/ko/)에서 **LTS 버전**을 다운로드하여 설치하세요.
    *   **확인**: 설치가 끝나면 VS Code를 껐다가 다시 켜고, 터미널(Ctrl + `)에 `node -v`를 입력하여 버전 숫자가 나오면 성공입니다.

2.  **Git (필수)**
    *   **역할**: 소스 코드를 저장하고 GitHub에 업로드하는 도구입니다.
    *   **설치**: [Git for Windows](https://gitforwindows.org/)에서 다운로드하여 설치하세요 (설정은 기본값 그대로 'Next' 계속 클릭).

---

## 2. 프로젝트 실행하기 (로컬 컴퓨터)

내 컴퓨터에서 게임을 실행해 보는 단계입니다.

1.  **패키지 설치**
    *   VS Code 터미널에서 아래 명령어를 입력하여 필요한 도구들을 다운로드합니다. (인터넷 연결 필요)
    ```bash
    npm install
    ```

2.  **Firebase 설정**
    *   [Firebase 콘솔](https://console.firebase.google.com/)에 접속하여 구글 아이디로 로그인합니다.
    *   **'프로젝트 만들기'** 버튼을 누르고 이름을 `liar-game` 등으로 지어주세요.
    *   **Realtime Database 생성**:
        *   왼쪽 메뉴에서 `Build` -> `Realtime Database` 클릭.
        *   `데이터베이스 만들기` -> 위치는 `us-central1` (또는 가까운 곳) -> **보안 규칙**에서 **'테스트 모드에서 시작'** 선택 (중요!).
    *   **앱 키 가져오기**:
        *   왼쪽 메뉴 상단의 톱니바퀴 -> `프로젝트 설정`.
        *   맨 아래 `내 앱` 섹션에서 `</>` 아이콘(웹) 클릭.
        *   앱 닉네임 입력 -> `콘솔로 이동` (호스팅 설정은 나중에 해도 됨).
        *   `SDK 설정 및 구성`에서 `firebaseConfig` 객체 내용(`const firebaseConfig = { ... }`)을 복사합니다.
    *   **코드에 붙여넣기**:
        *   VS Code에서 `src/firebase.js` 파일을 엽니다.
        *   `const firebaseConfig = { ... }` 부분을 복사한 내용으로 바꿔치기합니다.

3.  **게임 실행**
    ```bash
    npm run dev
    ```
    *   터미널에 뜨는 주소(예: `http://localhost:5173`)를 Ctrl+클릭하여 브라우저에서 엽니다.
    *   방 만들기, 입장하기가 잘 되는지 확인합니다.

---

## 3. 전 세계에 배포하기 (GitHub Pages)

내 컴퓨터가 꺼져 있어도 친구들이 접속할 수 있도록 인터넷에 올리는 과정입니다.

### 1단계: GitHub 저장소 만들기
1.  [GitHub](https://github.com/)에 로그인합니다.
2.  오른쪽 위 `+` 버튼 -> `New repository`.
3.  Repository name에 `liar-game` 입력.
4.  Public 선택 -> `Create repository` 클릭.

### 2단계: 코드 업로드 (초기 설정)
VS Code 터미널에서 다음 명령어들을 한 줄씩 순서대로 입력하세요. (이미 Git이 초기화되어 있다면 에러가 날 수 있으니 무시하고 진행하세요)

```bash
# 1. git 초기화 (처음 한 번만)
git init

# 2. 모든 파일을 업로드 대기 상태로 만듦
git add .

# 3. 저장 설명 적기
git commit -m "첫 번째 버전 완성"

# 4. 아까 만든 GitHub 저장소 연결 (주소는 본인 것으로 바꿔야 함!)
# 예: git remote add origin https://github.com/Start-T/liar-game.git
git remote add origin <당신의_GITHUB_저장소_주소>

# 5. 코드 강제 업로드 (주의: 기존 GitHub 내용 덮어씀)
git push -u origin master --force
```

### 3단계: 배포 실행 (매우 중요!!)
이제 마법의 명령어 하나면 웹 사이트가 만들어집니다.

```bash
npm run deploy
```

*   이 명령어를 치면 자동으로 빌드(`npm run build`)가 되고, `gh-pages` 브랜치에 업로드되어 웹 사이트가 생성됩니다.

#### 🌐 접속 주소 확인하기
배포가 성공했다면, 약 2~3분 뒤에 다음 주소로 접속할 수 있습니다.

**`https://choiwooyeol.github.io/<저장소이름>/`**

*   예를 들어, GitHub 저장소 이름을 `liar-world`로 만들었다면:
    👉 `https://choiwooyeol.github.io/liar-world/`
*   저장소 이름을 `liar-game`으로 만들었다면:
    👉 `https://choiwooyeol.github.io/liar-game/`

> **참고**: 만약 뒤에 붙는 이름 없이 깔끔하게 `https://choiwooyeol.github.io`로 접속하게 하고 싶다면?
> GitHub 저장소 이름을 **`Choiwooyeol.github.io`** 로 변경해야 합니다. (이 경우를 "User Page"라고 합니다)

---

## 4. 자주 묻는 질문

**Q. 친구들이랑 하려는데 방이 안 보여요.**
A. 모든 친구가 **똑같은 하나의 주소**로 접속해야 합니다. 배포된 GitHub Pages 주소를 카톡으로 공유하세요.

**Q. 코드를 수정했어요. 어떻게 업데이트하나요?**
A. 코드를 고치고 저장한 뒤, 터미널에서 `npm run deploy`만 다시 입력하면 됩니다.

**Q. '권한이 없습니다(Permission denied)' 에러가 떠요.**
A. GitHub에 처음 push할 때 로그인 창이 뜰 수 있습니다. 브라우저에서 로그인 승인해 주세요.
