let ws;
let chatUsersContainer = document.querySelector('#chatUsers');
let chatUsersCount = document.querySelector('#chatUsersCount');
let messageSendForm = document.querySelector('#messageSendForm');
let messageInput = document.querySelector('#messageInput');
let chatMessages = document.querySelector('#chatMessages');
let leaveGroupBtn = document.querySelector('#leaveGroupBtn');
let groupName = document.querySelector('#groupName');

window.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss': 'ws'}://${window.location.host}/ws`);
    ws.addEventListener('open', onConnectionOpen);
    ws.addEventListener('message', onMessageRecived);
})

messageSendForm.onsubmit = ev => {
    ev.preventDefault();
    if (messageInput.value === '' )
        return '';
    const event = {
        event: 'message',
        message: messageInput.value
    }

    ws.send(JSON.stringify(event));
    messageInput.value = '';
}

leaveGroupBtn.addEventListener('click', () => {
    const event = {
        event: 'leave',
        ...getQueryParams()
    }

    ws.send(JSON.stringify(event));
    window.location.href = 'chat.html';
})

function onConnectionOpen() {
    console.log(`Connection Opened`);
    const queryParams = getQueryParams();
    if (!queryParams['name'] || !queryParams['group']) {
        window.location.href = 'chat.html';
    }
    groupName.innerHTML = queryParams['group'];
    const event = { 
        event: 'join',
        ...queryParams
    }

    ws.send(JSON.stringify(event));
    
}

function onMessageRecived(ev){
    const {data, event} = JSON.parse(ev.data);
    console.log(event, data);
    
    if (event === 'users') {
        chatUsersCount.innerHTML = data.length;
        chatUsersContainer.innerHTML = '';
        data.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'chat-user';
            userElement.innerHTML = user.name;
            chatUsersContainer.appendChild(userElement);
        });
    }
    if (event === 'message') {
        const scrollValue = Math.floor(chatMessages.offsetHeight + chatMessages.scrollTop) === chatMessages.scrollHeight
        appendMessage(data);
        if (scrollValue) {
            chatMessages.scrollTop = chatMessages.scrollHeight
        }
    }
    if (event === 'previousMessages') {
        data.forEach(message => {
            appendMessage(message)
        })
    }

    

}   

function getQueryParams() {
    const search = window.location.search.substring(1);
    const arraySearch = search.split("&");
    const object = {};
    for (let el of arraySearch) {
        const parts = el.split("=");        
        object[parts[0]] = parts[1];
    }

    return object;
}

function appendMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${data.sender === 'me' ? 'to': 'from'}`;
    messageElement .innerHTML = `
    ${data.sender === 'me' ? '' : `<h4>${data.name}</h4>`}
    <p class="message-text">${data.message}</p>
    `;
    chatMessages.appendChild(messageElement)
}