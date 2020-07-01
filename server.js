import { listenAndServe } from 'https://deno.land/std/http/server.ts';
import { serveFile } from 'https://deno.land/std@0.58.0/http/file_server.ts';
import { acceptWebSocket, acceptable } from 'https://deno.land/std/ws/mod.ts';
import { parse } from 'https://deno.land/std@0.59.0/flags/mod.ts'
import chat from './chat.js';

const PORT = parse(Deno.args).port ? parseInt(parse(Deno.args).port) : 3000;


listenAndServe({port : PORT}, async (request)=>{

    const path = `${Deno.cwd()}/public/${modifyUrl(request.url)}`;
    if (await fileExist(path)) {
        const content = await serveFile(request,path);
        request.respond(content);
        return;
    }

    if (acceptable(request))
        acceptWebSocket({
            conn: request.conn,
            bufReader: request.r,
            bufWriter: request.w,
            headers: request.headers
        })
        .then(chat);
})


async function fileExist(path) {
    try {
        const stats = await Deno.lstat(path);
        return stats && stats.isFile;
    } catch (error) {
        if (error && error instanceof Deno.errors.NotFound) {
            return false;
        } else {
            throw error;
        }
    }
}

function modifyUrl(url) {
    if (url === '/') {
        url = '/index.html';
    }
    const position = url.indexOf('?');
    if (position > -1) {
        url = url.substring(0,position)
    }
    return url;
}

console.log(`Server started on port ${PORT}`);
