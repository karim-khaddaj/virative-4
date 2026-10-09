// Forward only the public visitor API. Never proxy dashboard or identity headers.
export default async function handler(request){
 const origin=new URL(request.url).origin;
 const headers={'Cache-Control':'no-store','Content-Type':'application/json'};
 const fail=(error,status)=>Response.json({error},{status,headers});
 if(!['GET','POST'].includes(request.method))return fail('Method not allowed.',405);
 if(request.method==='POST'&&request.headers.get('origin')!==origin)return fail('Invalid origin.',403);
 const upstream=process.env.VIRATIVE_DESK_ORIGIN,token=process.env.VIRATIVE_DESK_SERVICE_TOKEN;
 if(!upstream||!token)return fail('Chat is unavailable. Please email hello@virative.media.',503);
 let body;if(request.method==='POST'){if(Number(request.headers.get('content-length')||0)>4000)return fail('Message too long.',413);body=await request.text();if(body.length>4000)return fail('Message too long.',413);}
 const session=request.headers.get('cookie')?.match(/(?:^|;\s*)virative_chat=([a-f0-9-]{36})/)?.[1];
 const forwarded={'Origin':upstream,'Content-Type':'application/json','OAI-Sites-Authorization':`Bearer ${token}`};
 if(session)forwarded.Cookie=`virative_chat=${session}`;
 try{
  const response=await fetch(new URL('/api/chat',upstream),{method:request.method,headers:forwarded,body,redirect:'manual',signal:AbortSignal.timeout(35000)});
  if(!response.headers.get('content-type')?.includes('application/json'))return fail('Chat is unavailable. Please email hello@virative.media.',502);
  const resultHeaders=new Headers(headers);const cookie=response.headers.get('set-cookie');if(cookie)resultHeaders.set('Set-Cookie',cookie);
  return new Response(await response.text(),{status:response.status,headers:resultHeaders});
 }catch{return fail('Could not connect. Please try again or email hello@virative.media.',502);}
}
export const config={path:'/api/chat'};
