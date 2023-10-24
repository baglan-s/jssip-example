const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.has('domain') || !urlParams.has('extension') || !urlParams.has('password')) {
    document.querySelector('#mainMessage').innerText = 'Missing requied parameters';
    throw new Error('Missing requied parameters')
}

if (!urlParams.has('host')) {
    throw new Error('Missing requied parameter: host')
}

const mainHost = urlParams.get('host');
const domain = urlParams.get('domain');
const extension = urlParams.get('extension');
const password = urlParams.get('password');

let socket = new JsSIP.WebSocketInterface('wss://' + domain + ':8089/ws');

// Getting elements
let videoElement = document.querySelector('#videoCall');
let audioElement = document.querySelector('#audioCall');
let isCalling = document.querySelector('#isCalling')
var isPushEnabled = true;
var pushTimeOut = false;
const pushInterval = 6;
var pushSentTime = new Date();
const reRegistrationInterval = 7100 * 1000;

audioElement.autoplay = true;
videoElement.autoplay = true;

let param = {
    sockets: [socket],
    uri: 'sip:' + extension + '@' + domain,
    password: password,
};

let userAgents = [];
let userAgentIndex = 0;

const userAgent = new JsSIP.UA(param);
setEvents(userAgent);
userAgent.start();
setReRegistration(userAgent);


function setEvents(userAgent) {
    userAgent.on('newRTCSession', data => {
        let session = data.session;
        isCalling.innerText = 'Calling...';

        sendPush();

        session.on('accepted', (accepted) => {
            console.log('accepted', accepted)
        })

        session.on('confirmed', (confirmed) => {
            console.log('confirmed', confirmed)
        })

        session.on('ended', (ended) => {
            console.log('ended', ended)
            isCalling.innerText = '';
        })

        session.on('failed', (failed) => {
            console.log('failed', failed)
            isCalling.innerText = '';
        })
    })

    userAgent.on('registered', data => {
        console.log('registered!!!', data);
    })

    userAgent.on('registration failed', data => {
        console.log('registration failed', data);
    })
}

function sendPush() {
    let currentTime = new Date();
    let timeDifference = (currentTime.getTime() - pushSentTime.getTime()) / 1000;
    
    if (timeDifference > pushInterval) {
        fetch(mainHost + '/send-push/' + extension)
        .then((response) => {
            console.log('Fetch response', response)
        })
        .catch((data) => {
            console.log('Fetch error', data);
        });
    }

    pushSentTime = currentTime;
}

function setReRegistration(userAgent) {
    setInterval(() => {
        userAgent.stop();

        setTimeout(() => {
            userAgent.start();
        }, 2000)
    }, reRegistrationInterval)
}