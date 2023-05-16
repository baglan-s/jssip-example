let socket = new JsSIP.WebSocketInterface('wss://sip.mysandbox.kz:8089/ws');

// Getting elements
let videoElement = document.querySelector('#videoCall');
let audioElement = document.querySelector('#audioCall');
let answerBtn = document.querySelector('#answerBtn')
let isCalling = document.querySelector('#isCalling')

let params = [
    {
        sockets: [socket],
        uri: 'sip:223001@sip.mysandbox.kz',
        password: 'Hiplabs123!',
    }
];

params.forEach(param => {
    let userAgent = new JsSIP.UA(param);
    initPlayer();
    userAgent.start();
    setEvents(userAgent)
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
            isCalling.innerText = '';
        })

        session.on('peerconnection', (connectionEvent) => {
            console.log('peerconnection', connectionEvent)

            session.connection.addEventListener('track', event => {
                event.streams.forEach(stream => {
                    audioElement.srcObject = stream;
                    // videoElement.srcObject = stream;
                    window.player.decode(new Uint8Array(stream));
                    console.log('streamDataRaw', stream)
                    console.log('streamDataEncoded', new Uint8Array(stream))
                })
            })

            session.connection.addEventListener('addstream', event => {
                audioElement.srcObject = event.stream;
                // videoElement.srcObject = event.stream;
                window.player.decode(new Uint8Array(event.stream));
                console.log('streamDataRaw', event.stream)
                console.log('streamDataEncoded', new Uint8Array(event.stream))
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

function initPlayer() {
    var player = new Player({
        // useWorker: true,
        webgl: 'auto',
        size: {width: 300, height: 150},
        // workerFile: './Broadway-master/Player/Decoder.js'
    })

    var playerElement = document.getElementById('player');
    playerElement.appendChild(player.canvas)
}