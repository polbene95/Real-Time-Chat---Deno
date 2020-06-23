import {v4} from 'https://deno.land/std/uuid/mod.ts';
import { isWebSocketCloseEvent } from 'https://deno.land/std/ws/mod.ts';


const userMap = new Map();
const groupsMap = new Map();
const messagesMap = new Map();

export default async function chat (ws) {    
    const userId = v4.generate();
    for await (let data of ws) {
        const {name, group, event, message} = typeof data === 'string' ? JSON.parse(data) : data;
        let userObject = {};
        if(isWebSocketCloseEvent(data)) {            
            leaveGroup(userId);
            break;
        }
        
        switch(event) {
            case 'join':
                userObject = {
                    userId,
                    name,
                    group,
                    ws
                };
                userMap.set(userId,userObject);
                const users = groupsMap.get(group) || [];
                users.push(userObject);
                groupsMap.set(group, users);

                emitUserList(group);
                emitPreviousMessages(group, ws);
                break;
            case 'message' :
                userObject = userMap.get(userId)
                const messageObj = {
                    userId,
                    name: userObject.name,
                    message,
                }
                const messages = messagesMap.get(userObject.group) || [];
                messages.push(messageObj);
                messagesMap.set(userObject.group, messages);
                emitMessage(userObject.group, messageObj, userId)
                break;
            case 'leave' :
                // leaveGroup(userId);
                break;
        }
    }
}


function emitUserList(group) {
    const users = groupsMap.get(group) || [];
    for (let user of users) {
        const event = {
            event: 'users',
            data: getDisplayUsers(group)
        }
        user.ws.send(JSON.stringify(event))
    }
} 

function emitMessage(group, message, senderId) {
    const users = groupsMap.get(group) || [];
    for (let user of users) {
        const templateMessage = {
            ...message,
            sender: user.userId === senderId ? 'me' : senderId
        }
        const event = {
            event: 'message',
            data: templateMessage,
            
        }
        user.ws.send(JSON.stringify(event))
    }
} 

function emitPreviousMessages(group, ws) {
    const messages = messagesMap.get(group) || [];
    const event = {
        event: 'previousMessages',
        data: messages
    }
    ws.send(JSON.stringify(event))
}

function getDisplayUsers(group) {
    const users = groupsMap.get(group) || [];
    return users.map(user => {
        const {userId, name} = user;
        return {userId,name}
    })
}

function leaveGroup(userId) {
    const userObj = userMap.get(userId);  
    let users = groupsMap.get(userObj.group) || [];    
    users = users.filter(user => user.userId !== userId);
    groupsMap.set(userObj.group, users);
    emitUserList(userObj.group);
    userMap.delete(userId);
    
}