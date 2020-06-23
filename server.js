import { listenAndServe } from 'https://deno.land/std/http/server.ts';
import { acceptWebSocket, acceptable } from 'https://deno.land/std/ws/mod.ts';

import chat from './chat.js';

listenAndServe({port: 3000}, async (request)=>{
    if (acceptable(request))
        acceptWebSocket({
            conn: request.conn,
            bufReader: request.r,
            bufWriter: request.w,
            headers: request.headers
        })
        .then(chat);
})

console.log(`Server started on port 3000`);
