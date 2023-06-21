const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.has('domain') || !urlParams.has('extension') || !urlParams.has('password')) {
    document.querySelector('#mainMessage').innerText = 'Missing requied parameters';
    throw new Error('Missing requied parameters')
}

const domain = urlParams.get('domain');
const extension = urlParams.get('extension');
const password = urlParams.get('password');

let socket = new JsSIP.WebSocketInterface('wss://' + domain + ':8089/ws');

// Getting elements
let videoElement = document.querySelector('#videoCall');
let audioElement = document.querySelector('#audioCall');
let answerBtn = document.querySelector('#answerBtn')
let cancelBtn = document.querySelector('#cancelBtn')
let isCalling = document.querySelector('#isCalling')
var isPushSent = false;

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


function setEvents(userAgent) {
    userAgent.on('newRTCSession', data => {
        let session = data.session;
        isCalling.innerText = 'CALLING...'

        if (!isPushSent) {
            isPushSent = true;

            fetch('https://sip-miniapp.hiplabs.dev/send-push/' + extension)
            .then((response) => {
                console.log('Fetch response', response)

                setTimeout(() => {
                    isPushSent = false;
                }, 5000)
            })
            .catch((data) => {
                setTimeout(() => {
                    isPushSent = false;
                }, 5000)
                
                console.log('Fetch error', data);
            });
        }

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
        })

        session.on('peerconnection', (connectionEvent) => {
            console.log('peerconnection', connectionEvent)

            session.connection.addEventListener('track', event => {
                event.streams.forEach(stream => {
                    audioElement.srcObject = stream;
                    videoElement.srcObject = stream;
                })
            })
        })

        answerBtn.addEventListener('click', event => {
            session.answer({
                mediaConstraints: {
                    audio: true,
                    video: true
                }
            });
        })

        cancelBtn.addEventListener('click', event => {
            session.terminate();
        })

        
    })

    userAgent.on('registered', data => {
        console.log('registered!!!', data);
    })

    userAgent.on('registration failed', data => {
        console.log('registration failed', data);
    })
}

function processStream(stream) {
    const mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/mp4'});
    console.log('MEDIASTREAM', mediaRecorder);

    mediaRecorder.ondataavailable = (data) => {
        console.log('dataRecorder', data)
        const formData = new FormData();
        formData.append('file', data.data)
        if (data.data.size > 0) {
            videoElement.srcObject = data.data;
        }
        // videoElement.play();
        // fetch('http://127.0.0.1:5001/test/upload', {
        //     method: 'POST',
        //     body: formData
        // }).then(response => {
        //     console.log('fetchResponse', response)
        // }).catch(error => {
        //     console.log('fetchError', error)
        // });
    }

    mediaRecorder.start();

    setInterval(() => {
        mediaRecorder.requestData();
    }, 1000)
}