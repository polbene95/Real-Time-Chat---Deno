import { listenAndServe } from 'https://deno.land/std/http/server.ts';
// import * as flags from 'https://deno.land/std/flags/mod.ts';
import { acceptWebSocket, acceptable } from 'https://deno.land/std/ws/mod.ts';
// import { Application } from "https://deno.land/x/oak/mod.ts";

import chat from './chat.js';

// const { args, exit } = Deno;
// const DEFAULT_PORT = 3000;
// const argPort = flags.parse(args).port;
// const port = argPort ? Number(argPort) : DEFAULT_PORT;

// if (isNaN(port)) {
//     console.log('port is not a number');
    
//     exit(1)
// } 



// const app = new Application();


// app.use(async (context) => {
//     await send(context, context.request.url.pathname, {
//       root: `${Deno.cwd()}/public`,
//       index: "chat.html",
//     });
// });


listenAndServe({port}, async (request)=>{
    if (acceptable(request))
        acceptWebSocket({
            conn: request.conn,
            bufReader: request.r,
            bufWriter: request.w,
            headers: request.headers
        })
        .then(chat);
    // app.listen({port})
})

console.log(`Server started on port 3000`);
