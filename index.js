require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    // 예약인원 조회
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
    const reserveCnt = +coursePerson.reserveCnt;
    const limitCnt = +coursePerson.limitCnt;
    if (reserveCnt >= limitCnt) return;
    // 예약 정원이 비었을 때 텔레그램 봇으로 나에게 메시지 보내기
    await axios({
      method: 'get',
      url: process.env.TELEGRAM_BOT_API_URL,
      data: {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `현재예약인원 ${reserveCnt}/${limitCnt}
${process.env.VISIT_HALLA_MAIN_URL}`,
      },
    });
  } catch (err) {
    console.error(err);
  }
})();
