const https = require('https');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // CORS Preflight 처리
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // POST가 아닌 요청에 대한 처리 (진단용)
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 200, // 405 대신 200을 주고 메시지로 안내
      headers, 
      body: JSON.stringify({ 
        success: false, 
        error_message: `POST 방식으로 요청해야 합니다. (현재 방식: ${event.httpMethod})` 
      }) 
    };
  }

  try {
    const { section_id, user_keywords, apiKey } = JSON.parse(event.body);

    if (!apiKey) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error_message: "API Key가 없습니다." }) };
    }

    const promptMaps = {
      "sec26": "다중 관점 분석 프롬프트 작성",
      "sec27": "CoT 사고 유도 프롬프트 작성",
      "sec28": "APE 자동 최적화 프롬프트 작성",
      "default": "일반 프롬프트 작성"
    };

    const systemPrompt = promptMaps[section_id] || promptMaps["default"];
    const postData = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `주제: ${user_keywords}` }
      ]
    });

    // https 내장 모듈을 사용하여 외부 라이브러리 의존성 제거
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let resData = '';
        res.on('data', (chunk) => { resData += chunk; });
        res.on('end', () => {
          const parsedData = JSON.parse(resData);
          if (res.statusCode === 200) {
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, generated_prompt: parsedData.choices[0].message.content })
            });
          } else {
            resolve({
              statusCode: res.statusCode,
              headers,
              body: JSON.stringify({ success: false, error_message: parsedData.error ? parsedData.error.message : "OpenAI API 오류" })
            });
          }
        });
      });

      req.on('error', (e) => {
        resolve({ statusCode: 500, headers, body: JSON.stringify({ success: false, error_message: e.message }) });
      });

      req.write(postData);
      req.end();
    });

  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error_message: "서버 오류: " + error.message }) };
  }
};