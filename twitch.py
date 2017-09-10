#!/usr/bin/env python3
import sys, os, errno, re, socket, random, time, atexit

irc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
log_fh = None
log_name = ''
ts_re = re.compile(r'[tmi-]?sent-ts=(\d+)')

@atexit.register
def goodbye():
    if irc:
        irc.close()
    if log_fh:
        log_fh.close()

def update_log_fh(ts):
    global log_name, log_fh
    ts = time.strftime('logs/%Y/%B/%Y-%m-%d.txt', time.localtime(int(ts) / 1000))
    if ts != log_name:
        log_name = ts
        if log_fh:
            log_fh.close()
            log_fh = None

        if not os.path.exists(log_name):
            if not os.path.exists(os.path.dirname(log_name)):
                try:
                    os.makedirs(os.path.dirname(log_name), exist_ok=True)
                except OSError as exc:
                    if exc.errno != errno.EEXIST:
                        raise
            log_fh = open(log_name, 'wb')
        else:
            log_fh = open(log_name, 'ab')

def send(msg):
    irc.send("{}\r\n".format(msg).encode())

def try_connect():
    while True:
        try:
            user = 'justinfan' + ''.join(random.choice("0123456789") for _ in range(10))
            irc.connect(("irc.chat.twitch.tv", 6667))
            send("USER {} 0 0 :{}".format(user, user))
            send("NICK {}".format(user))
            send("CAP REQ :twitch.tv/membership")
            send("CAP REQ :twitch.tv/tags")
            send("CAP REQ :twitch.tv/commands")
            send("JOIN #darksydephil")
            break
        except:
            time.sleep(10)

try_connect()
split_msg_buf = None
while True:
    try:
        txt = irc.recv(512).decode('utf-8').split('\r\n')
    except KeyboardInterrupt as e:
        break
    except:
        try_connect()

    if split_msg_buf:
        txt[0] = split_msg_buf + txt[0]
        split_msg_buf = None

    if txt[-1]:
        split_msg_buf = txt.pop()

    for msg in txt:
        if msg:
            if msg[:3] == "@ba": # All the interesting messages start with "@ba"
                ts = ts_re.findall(msg)
                if ts or not log_fh:
                    update_log_fh(ts[1] if len(ts) >= 2 else ts[0])
                if log_fh:
                    log_fh.write((msg + "\n").encode('utf-8'))
            elif msg[:4] == "PING":
                send("PO" + msg[2:])
