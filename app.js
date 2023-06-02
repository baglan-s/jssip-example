let socket = new JsSIP.WebSocketInterface('wss://sip.mysandbox.kz:8089/ws');

// Getting elements
let videoElement = document.querySelector('#videoCall');
let audioElement = document.querySelector('#audioCall');
let answerBtn = document.querySelector('#answerBtn')
let cancelBtn = document.querySelector('#cancelBtn')
let isCalling = document.querySelector('#isCalling')
var isPushSent = false;

audioElement.autoplay = true;
videoElement.autoplay = true;

let params = [
    {
        sockets: [socket],
        uri: 'sip:223001@sip.mysandbox.kz',
        password: 'Hiplabs123!',
    }
];

params.forEach(param => {
    let userAgent = new JsSIP.UA(param);

    setEvents(userAgent)
    userAgent.start();
})


function setEvents(userAgent) {
    userAgent.on('newRTCSession', data => {
        let session = data.session;
        isCalling.innerText = 'CALLING...'

        // if (!isPushSent) {
            // isPushSent = true;

            fetch('https://sip-miniapp.hiplabs.dev/send-push/223001')
            .then((response) => {
                console.log('Fetch response', response)

                // setTimeout(() => {
                //     isPushSent = false;
                // }, 5000)
            })
            .catch((data) => {
                console.log('Fetch error', data);
            });
        // }

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
                    console.log('streamOBJECT', stream)
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