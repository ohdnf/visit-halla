# 한라산탐방 예약시스템 인원체크 프로그램

산 한 번 가는게 왜 이리 힘든지...

## How to start

0. Git Clone

```bash
cd
git clone git@github.com:ohdnf/visit-halla.git
cd visit-halla/
npm ci --omit=dev
```

1. `.env` 파일 만들기

```bash
cp .env.sample .env
vi .env # 내용 채우기
```

2. `address_book.csv` 파일 만들기

```bash
echo '${TELEGRAM_CHAT_ID},null' >> address_book.csv
```

3. cron 설정

```bash
crontab -e
```

```bash
* * * * * .nvm/versions/node/v20.10.0/bin/node ~/visit-halla/index.js >> ~/logfile.log 2>&1
```