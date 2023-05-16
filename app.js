let socket = new JsSIP.WebSocketInterface('wss://sip.domain.com:8089/ws');

// Getting elements
let videoElement = document.querySelector('#videoCall');
let audioElement = document.querySelector('#audioCall');
let answerBtn = document.querySelector('#answerBtn')
let isCalling = document.querySelector('#isCalling')

audioElement.autoplay = true;
videoElement.autoplay = true;

let params = [
    {
        sockets: [socket],
        uri: 'sip:000000@sip.domain.com',
        password: 'YourPassword!',
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
    })

    userAgent.on('registered', data => {
        console.log('registered!!!', data);
    })

    userAgent.on('registration failed', data => {
        console.log('registration failed', data);
    })
}