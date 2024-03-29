let server = '';
let extension = '';
let password = '';

let socket = new JsSIP.WebSocketInterface(`wss://${server}:8089/ws`);

// Getting elements
let videoElement = document.querySelector('#videoCall');
let audioElement = document.querySelector('#audioCall');
let isCalling = document.querySelector('#isCalling')

audioElement.autoplay = true;
videoElement.autoplay = true;

let param = [
    {
        sockets: [socket],
        uri: `sip:${extension}@${server}`,
        password: password,
    }
];

let userAgent = new JsSIP.UA(param);
setEvents(userAgent)
userAgent.start();


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

        session.on('sdp', (data) => {
            console.log('sdp', data)
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

        session.answer({
            mediaConstraints: {
                audio: true,
                video: true
            }
        });
    })

    userAgent.on('registered', data => {
        console.log('registered!!!', data);
    })

    userAgent.on('registration failed', data => {
        console.log('registration failed', data);
    })
}