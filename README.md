# Introduction
RPG Maker MZ의 플러그인 매개변수 데이터를 툴 없이 읽어낼 수 있는 파싱 도구입니다.

기본적으로는 웹에서 동작합니다.

![IMG](./public/img/screenshot.png)

파싱은 서버에 파일을 업로드 한 후, 서버측에서 진행됩니다.

그러나 이걸 올릴 서버가 있을 리가 없습니다.

따라서 Node.js를 설치한 후, 다음 명령을 통해 명령 프롬프트에서 서버를 직접 실행시켜주셔야 합니다. 

```bat
npm install -D
start-server.bat
```

설치가 완료된 후, ```start-server.bat``` 파일을 실행하면 서버가 시작됩니다.

서버가 실행되었다면, http://localhost:9010 에 접속하면 파싱 도구를 이용할 수 있습니다.

파싱이 끝나면 분석 결과가 화면에 출력됩니다.