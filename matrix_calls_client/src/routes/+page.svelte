<script lang="ts">
    import ServerSocket from "$lib/messages";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import type { LayoutServerData } from "./$types";

    let peerConnection: RTCPeerConnection;

    onMount(() => {
    });
    
    function setup_peer_connection() {

        peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnection.onconnectionstatechange = (e) => {
            console.log("changed state: ", peerConnection.connectionState);
            if (peerConnection.connectionState == "connected") {
            }else if (peerConnection.connectionState == "disconnected") {
                disconnect();
            }
        };
    }

    type Message = { sender: string; text: string };
    let contacts_write = writable<{ name: string; email: string }[]>([]);

    onMount(() => {
        return contacts_write.subscribe((data) => (contacts = data));
    });

    let contacts: { name: string; email: string }[] = [];

    let messages_write = writable<Map<string, Message[]>>(new Map());
    let messages = new Map();
    onMount(() => {
        return messages_write.subscribe((data) => (messages = data));
    });
    export let data: LayoutServerData;

    let selected_contact: string | null = null;

    let current_message: string = "";

    let socket_write = writable<ServerSocket | null>(null);

    let socket: ServerSocket | null = null;

    socket_write.subscribe((x) => (socket = x));

    let callers_write = writable<Map<string, any>>(new Map());

    let callers: Map<string | null, any> = new Map();

    onMount(() => {
        return callers_write.subscribe((data) => (callers = data));
    });

    onMount(() => {
        if (data.jwt) {
            let sock = new ServerSocket(data.jwt);
            socket_write.set(sock);
            return sock.subscribe((message) => {
                console.log(message);
                handle_message(message);
            });
        }
    });

    async function handle_message(data: string) {
        let obj: null | any = null;
        try {
            obj = JSON.parse(data);
        } catch (e) {}
        if (!obj) return;
        if (obj.liveUsers) {
            contacts_write.set(
                obj.liveUsers as [{ name: string; email: string }],
            );
        } else if (obj.sender && obj.text) {
            append_message(obj.sender, {
                sender: obj.sender,
                text: obj.text,
            });
        } else if (obj.call_from && obj.no) {
            // peerConnection.close();
            cleanup_call();
        } else if (obj.call_from && obj.offer) {
            setup_peer_connection();
            // this is the reviever of the call
            // let res = window.confirm(`call from ${obj.call_from} + ${Math.random()}`);
            // decline_call(obj);
            callers_write.update((data) => {
                data.set(obj.call_from, obj.offer);
                return data;
            });
            // await accecpt_call(obj);
        } else if (obj.call_from && obj.answer) {
            // initiative of the call
            peerConnection.setRemoteDescription(
                new RTCSessionDescription(obj.answer),
            );
        } else if (obj.icecandidate) {
            // setup_video_track();
            await peerConnection.addIceCandidate(obj.icecandidate);
        }
    }

    function decline_call(obj: { offer: any; call_from: string }) {
        callers_write.update((data) => {
            data.delete(obj.call_from!);
            return data;
        });
        console.log("call declined");
        socket?.sendMessage({ call_to: obj.call_from, no: "no" });
        cleanup_call();
        return;
    }

    async function accecpt_call(obj: { offer: any; call_from: string | null }) {
        callers_write.update((data) => {
            data.delete(obj.call_from!);
            return data;
        });
        peerConnection.restartIce();
        const media = await navigator.mediaDevices.getUserMedia({
            video: true,
        });
        if (media) {
            media_write.set(media);
            myVideo.srcObject = media;
            media?.getTracks().forEach((track) => {
                peerConnection.addTrack(track, media);
                console.log("added track", track);
            });
        }
        setup_icecandidate();
        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(obj.offer),
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        selected_contact;
        socket?.sendMessage({ call_to: obj.call_from, answer: answer });
        setup_icecandidate();
    }

    function setup_icecandidate() {
        setup_video_track();

        peerConnection.onicecandidateerror = (_) => {
            console.log("error !!!");
        };
        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                console.log("have ice candidate");
                // await peerConnection?.addIceCandidate(event.candidate);
                socket?.sendMessage({
                    call_to: selected_contact,
                    icecandidate: event.candidate,
                });
            } else {
                console.log("null ice_candidate");
            }
        };
        console.log("setting up ice_candidate");
    }

    function append_message(selected_user: string, message: Message) {
        messages_write.update((messages) => {
            if (messages.get(selected_user)) {
                messages.get(selected_user)?.push(message);
            } else {
                messages.set(selected_user, []);
                append_message(selected_user, message);
            }
            return messages;
        });
    }
    async function sendMessage() {
        console.log(current_message);
        socket?.sendMessage({ message: current_message, to: selected_contact });
        append_message(selected_contact!, {
            text: current_message,
            sender: data.session!.user!.name!,
        });
        current_message = "";
        setTimeout(() => {
            current_message = "";
        });
    }
    function setup_video_track() {
        console.log("setting up video tracks");
        peerConnection.ontrack = (a) => {
            console.log("got track! from remote");
            const [video] = a.streams;
            remote_tracks_write.update((a) => {
                a.push(video);
                return a;
            });
        };
    }
    function cleanup_call() {
        media_stream?.getTracks().forEach(function (track) {
            track.stop();
        });
        remote_tracks_write.update((_) => []);
        media_write.update((_) => null);
        peerConnection.close();
    }
    const remote_tracks_write = writable<MediaStream[]>([]);

    let remote_tracks: MediaStream[] = [];

    onMount(() => {
        remote_tracks_write.subscribe((a) => (remote_tracks = a));
    });

    const media_write = writable<null | MediaStream>(null);

    let media_stream: null | MediaStream = null;

    onMount(() => {
        return media_write.subscribe((stream) => (media_stream = stream));
    });

    let myVideo: HTMLVideoElement;

    let video_div: HTMLDivElement;

    let remote_videos: HTMLDivElement;

    onMount(() => {
        return remote_tracks_write.subscribe((a) => {
            if (remote_videos) {
                remote_videos.innerHTML = "";
                console.log(a);
                // console.log("length of remote div", remote_videos.children.length);
                a.forEach((a, i) => {
                    const child = document.createElement("video");
                    child.className = myVideo.className;
                    child.srcObject = a;
                    // child.autoplay = true;
                    console.log(a);
                    remote_videos.appendChild(child);
                    child.play();
                });
            }
        });
    });

    async function start_call(target: string) {
        setup_peer_connection();
        peerConnection.restartIce();
        const media = await navigator.mediaDevices.getUserMedia({
            video: {
                // frameRate: 10 + Math.random() * 100,
                width: Math.random() * 10 + 90,
                height: Math.random() * 10 + 90,
            },
        });
        if (media) {
            media_write.set(media);
            myVideo.srcObject = media;
            media?.getTracks().forEach((track) => {
                console.log("adding track im caller", track);
                peerConnection.addTrack(track, media);
            });
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket?.sendMessage({
                call_to: target,
                offer: offer,
            });
            setup_icecandidate();
            alert("done with stat_call funtion");
        } else {
            alert("error, try again!");
        }
    }
    async function disconnect() {
        media_write.set(null);
        peerConnection.close();
        myVideo.srcObject = null;
        remote_tracks_write.set([]);
    }
</script>

<div class="container">
    <div class="contact-list">
        {#each contacts as contact}
            <button
                class="contact"
                on:click={() => (selected_contact = contact.name)}
            >
                <p>{contact.name}</p>
                <p>{contact.email}</p>
            </button>
        {/each}
    </div>
    <div class="chat">
        {#if selected_contact}
            <div class="chat-header">
                <p>Chatting with {selected_contact}</p>
                <button
                    on:click={() =>
                        selected_contact ? start_call(selected_contact) : null}
                    >call</button
                >
            </div>
            <h1>(call)</h1>
            <div
                bind:this={video_div}
                class="chat-header"
                hidden={!media_stream ? true : false}
                style="margin:10px;display: flex"
            >
                {#if callers.get(selected_contact)}
                    <div>
                        <button
                            on:click={() => {
                                accecpt_call({
                                    call_from: selected_contact,
                                    offer: callers.get(selected_contact),
                                });
                            }}>accecpt</button
                        >
                        <button>decline</button>
                    </div>
                {/if}
                <div>
                    <video
                        autoplay={true}
                        class="chat-video"
                        bind:this={myVideo}><track kind="captions" /></video
                    >
                </div>
                {#if remote_videos?.children.length}
                    <!-- content here -->
                    <div>remote vid</div>
                    <button on:click={()=>disconnect()}>disconnect</button>
                {/if}
                <div bind:this={remote_videos}>
                    <!-- {#each remote_tracks as remote_track}{/each} -->
                </div>
            </div>
            <div class="message-list">
                {#each messages.get(selected_contact) || [] as message, i (i)}
                    <div class="message">
                        <p>{message.sender}</p>
                        <p>{message.text}</p>
                    </div>
                {/each}
            </div>
            <div class="message-input">
                <textarea
                    placeholder="Type your message..."
                    bind:value={current_message}
                    on:keydown={(event) => {
                        if (event.key == "Enter" && !event.shiftKey) {
                            sendMessage();
                        }
                    }}
                />
                <button
                    on:click={() => {
                        sendMessage();
                    }}>Send</button
                >
            </div>
        {:else}
            <div class="chat-header">
                <p>Select a contactname</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .chat {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .chat-header {
        background-color: #333;
        color: white;
        padding: 10px;
        text-align: center;
    }
    .chat-video {
        width: 400px;
    }
    .message-list {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
    }

    .message {
        margin-bottom: 10px;
    }

    .message-input {
        display: flex;
        align-items: center;
        padding: 10px;

        /* background-color: #eee; */
    }

    .message-input textarea {
        flex-grow: 1;
        margin-right: 10px;
        padding: 5px;
        background-color: #333;
        border: 0;
        border-radius: 5px;
        box-shadow: 0 0 3px black;
    }

    .message-input button {
        cursor: pointer;
        padding: 5px 10px;
        background-color: #333;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .container {
        width: 100%;
        height: 100%;
        display: flex;
        padding: 0;
        margin: 0;
        flex-grow: 1;
        flex-direction: row;
    }

    .contact-list {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 200px;
        padding: 20px;
        /* margin-left: 15px; */
        margin-right: 15px;
        /* box-shadow: 0 0 10px black; */
        background-color: #333; /* Dark background color */
    }

    .contact {
        cursor: pointer;
        color: white;
        margin-bottom: 15px;
        padding: 10px;
        background-color: #666;
        border-radius: 5px;
        border: none;
        text-align: left;
        font-size: 1rem;
        overflow-x: hidden;
        transition: background-color 0.3s ease;
    }

    /* .contact:hover { */
    /* } */
</style>
