import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages, hospitals, treatments, specialities } = await req.json();

    const systemPrompt = `You are MuftMadad's intelligent medical assistant. MuftMadad is a healthcare platform that helps patients find free or subsidized medical treatments, hospitals, and doctors in India.

Your job:
1. Listen carefully to user's symptoms or health concerns
2. Ask follow-up questions to understand better (age, duration, severity, location of pain, etc.)
3. Suggest relevant medical specialities from our platform
4. Recommend specific treatments available on our platform
5. Show relevant hospitals from our platform
6. Always be empathetic, professional, and clear
7. Always remind users this is not a substitute for professional medical advice
8. Respond in the same language the user writes in (Hindi or English)
9. Use simple, easy-to-understand language

Available Specialities on our platform:
${JSON.stringify(specialities?.map(s => s.name_en || s.name || s.title) || [])}

Available Treatments on our platform:
${JSON.stringify(treatments?.map(t => ({ name: t.name, specialty_id: t.specialty_id })) || [])}

Available Hospitals on our platform:
${JSON.stringify(hospitals?.map(h => ({ name: h.name, city: h.city, state: h.state, specialities: h.available_specialities })) || [])}

Rules:
- ONLY suggest hospitals, treatments, specialities that exist in the lists above
- Always ask at least 1-2 follow-up questions before making suggestions
- Format suggestions clearly with names and details
- If user writes in Hindi, respond in Hindi. If English, respond in English.
- Be warm, caring and professional
- Never make up hospitals or treatments not in the list
- NEVER show your thinking or reasoning process in the response
- NEVER use "Okay, the user said..." or "Let me think..." type text
- Keep responses SHORT and CONCISE — max 5-6 lines per response
- Use simple bullet points, avoid long paragraphs
- Get to the point quickly`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'MuftMadad Health Assistant',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
  const err = await response.text();
  console.error('OpenRouter error:', err);
  // Fallback reply instead of crashing
  return NextResponse.json({ 
    reply: 'I am experiencing high traffic right now. Please try again in a moment. 🙏' 
  });
}

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}