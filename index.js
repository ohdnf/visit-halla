require('dotenv').config();
const axios = require('axios');
const fs = require('fs/promises');

(async () => {
  try {
    // 예약 인원 조회
    const formData = new FormData();
    formData.append('courseSeq', process.env.COURSE_SEQ);
    formData.append('visitDt', process.env.VISIT_DATE);
    formData.append('visitTm', process.env.VISIT_TIME);
    const jejuResponse = await axios({
      method: 'post',
      url: process.env.VISIT_HALLA_API_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    });
    if (!jejuResponse?.data || jejuResponse.data?.result !== 'SUCCESS') {
      return;
    }
    const coursePerson = jejuResponse.data.coursePerson;
    if (!coursePerson) return;
    const reserveCnt = +coursePerson.reserveCnt; // 현재 예약 인원
    const limitCnt = +coursePerson.limitCnt; // 총 예약 가능 인원
    // 주소록 관리
    const fsData = await fs.readFile('./address_book.csv', {
      encoding: 'utf-8',
    });
    const addressBook = fsData.split('\n').reduce((prev, curr) => {
      if (curr) {
        prev.push(curr.split(','));
      }
      return prev;
    }, []);
    if (!addressBook?.length) return; // 메시지 보낼 사람이 없음
    if (reserveCnt >= limitCnt) return; // 정원 초과
    // 예약 정원이 비었을 때 텔레그램 봇으로 예약 가능 메시지 보내기
    const lastSentList = []; // 마지막으로 보낸 일시 업데이트 배열
    for (const user of addressBook) {
      const [chatId, msString] = user; // 텔레그램 ID, 마지막으로 보낸 시간(ms)
      if (msString !== 'null') {
        // 이전에 전송한 이력이 존재할 경우
        const ms = new Date(+msString).getTime();
        if (Date.now() - ms > 1000 * 60 * 60) {
          // 보낸지 1시간이 넘은 경우만 새로 전송
          lastSentList.push(`${chatId},null`);
        } else {
          // 1시간 이내일 경우 메시지 전송 보류
          lastSentList.push(`${chatId},${ms}`);
          continue;
        }
      } else {
        // 처음 보내는 경우
        lastSentList.push(`${chatId},${Date.now()}`);
      }
      await axios({
        method: 'get',
        url: `${process.env.TELEGRAM_BOT_API_URL}/sendMessage`,
        data: {
          chat_id: chatId,
          text: `현재예약인원 ${reserveCnt}/${limitCnt}
  ${process.env.VISIT_HALLA_MAIN_URL}`,
        },
      });
    }
    // 주소록 업데이트
    await fs.writeFile('./address_book.csv', lastSentList.join('\n'));
  } catch (err) {
    console.error(err);
  }
})();
