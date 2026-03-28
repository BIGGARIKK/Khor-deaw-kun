from extensions import socketio
from flask_socketio import emit, join_room, leave_room
from flask import request
import time

timer_thread = None

def background_timer():
    """ 🕰️ นาฬิกากลาง: เดินทุก 1 วินาที """
    while True:
        socketio.sleep(1)
        socketio.emit('server_tick')

# ==========================================
# 🌟 สมุดจดประจำร้านหมูกระทะ (เก็บข้อมูลถาวร)
# ==========================================
room_members = {}  # เก็บคนที่กำลังออนไลน์อยู่ตอนนี้ (หายตอนออก/รีเฟรช)
room_scores = {}   # 🌟 สมุดจดคะแนนสะสม { room_id: { username: score } } (จำตลอดไป)
room_chats = {}    # 🌟 สมุดจดประวัติแชท { room_id: [ msg1, msg2, ... ] } (จำตลอดไป)

# ==========================================
# 🚪 ระบบจัดการการเชื่อมต่อและแยกห้อง
# ==========================================

@socketio.on('connect')
def handle_connect():
    global timer_thread
    if timer_thread is None:
        timer_thread = socketio.start_background_task(background_timer)
    print(f"🔥 มีคนหยิบตะเกียบเข้าร่วมเซิร์ฟเวอร์! (ID: {request.sid})")

@socketio.on('join_game_room')
def handle_join_game_room(data):
    room_id = data.get('room_id')
    username = data.get('username')
    profile_image = data.get('profile_image', '')
    sid = request.sid
    
    if not room_id or not username:
        return

    join_room(room_id)
    
    # 🌟 เตรียมหน้ากระดาษให้ห้องใหม่ (ถ้ายังไม่มี)
    if room_id not in room_members: room_members[room_id] = {}
    if room_id not in room_scores: room_scores[room_id] = {}
    if room_id not in room_chats: room_chats[room_id] = []
        
    # ==========================================
    # 🌟 ตัวแก้บั๊กร่างแยก (กำจัดร่างเก่า เก็บความทรงจำไว้)
    # ==========================================
    keys_to_delete = []
    
    # 1. ค้นหาว่าในห้องนี้ มีชื่อเรานั่งอยู่ก่อนแล้วหรือเปล่า? (เผื่อรีเฟรช)
    for existing_sid, player_info in room_members[room_id].items():
        if player_info.get('username') == username:
            keys_to_delete.append(existing_sid)

    # 2. ลบร่างเก่าทิ้งให้หมด
    for k in keys_to_delete:
        del room_members[room_id][k]

    # 🌟 3. ดึงคะแนนเดิมจากสมุดจดถาวร (ถ้าไม่เคยมีให้เริ่มที่ 0)
    current_score = room_scores[room_id].get(username, 0)

    # 4. สร้างร่างใหม่ พร้อมโอนคะแนนใส่จาน
    room_members[room_id][sid] = {
        'username': username,
        'profile_image': profile_image,
        'score': current_score
    }
    
    # 🌟 ส่งอัปเดตรายชื่อใหม่ล่าสุดให้ทุกคนในห้อง
    current_players = list(room_members[room_id].values())
    emit('update_player_list', current_players, to=room_id)
    
    # 🌟 ส่ง "ประวัติแชท" คืนให้คนที่เพิ่งเข้ามา (ส่งให้แค่คนเดียว)
    emit('load_chat_history', room_chats[room_id], to=sid)
    
    # ถ้าไม่มีร่างเก่า (แปลว่าเพิ่งเข้าห้องครั้งแรก ไม่ใช่การรีเฟรช) ค่อยประกาศลงแชท
    if not keys_to_delete: 
        msg = {
            'id': f'sys-in-{room_id}-{time.time()}',
            'type': 'system',
            'text': f'--- {username} นั่งลงที่โต๊ะแล้ว 🥩 ---'
        }
        room_chats[room_id].append(msg) # จดลงสมุด
        if len(room_chats[room_id]) > 50: room_chats[room_id].pop(0) # กันเมมเต็ม
        emit('chat_message', msg, to=room_id)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    for room_id, members in room_members.items():
        if sid in members:
            user_data = members[sid]
            username = user_data.get('username', 'Unknown')
            
            # ลบคนนี้ออกจากโต๊ะ (แต่คะแนนยังถูกเซฟอยู่ใน room_scores นะ!)
            del members[sid] 
            
            # ส่งรายชื่อใหม่ให้คนที่เหลือเห็น
            current_players = list(members.values())
            emit('update_player_list', current_players, to=room_id)
            
            # แชทบอกคนอื่นว่าเพื่อนหลุด/ออก
            msg = {
                'id': f'sys-out-{sid}-{time.time()}',
                'type': 'system',
                'text': f'--- {username} ลุกจากโต๊ะไปแล้ว 🏃‍♂️ ---'
            }
            if room_id in room_chats:
                room_chats[room_id].append(msg) # จดลงสมุดด้วย
                if len(room_chats[room_id]) > 50: room_chats[room_id].pop(0)
            
            emit('chat_message', msg, to=room_id)
            break

@socketio.on('leave_game_room')
def handle_leave_game_room(data):
    room_id = data.get('room_id')
    sid = request.sid

    if room_id in room_members and sid in room_members[room_id]:
        user_data = room_members[room_id][sid]
        username = user_data.get('username', 'Unknown')
        
        del room_members[room_id][sid]
        
        current_players = list(room_members[room_id].values())
        emit('update_player_list', current_players, to=room_id)
        
        # ข้อความแชทตอนกดปุ่มออกจากห้อง
        msg = {
            'id': f'sys-leave-{sid}-{time.time()}',
            'type': 'system',
            'text': f'--- {username} เก็บจานลุกจากโต๊ะไปแล้ว 👋 ---'
        }
        if room_id in room_chats:
            room_chats[room_id].append(msg)
            if len(room_chats[room_id]) > 50: room_chats[room_id].pop(0)
            
        emit('chat_message', msg, to=room_id)
        leave_room(room_id)

# ==========================================
# 💬 ระบบ Room Chat (แยกตามห้อง)
# ==========================================

@socketio.on('send_message')
def handle_send_message(data):
    room_id = data.get('room_id')
    print(f"💬 [ห้อง {room_id}] แชทจาก {data.get('sender')}: {data.get('text')}")
    
    # 🌟 จดแชทลงสมุดก่อนแจกจ่าย
    if room_id not in room_chats: room_chats[room_id] = []
    room_chats[room_id].append(data)
    if len(room_chats[room_id]) > 50: 
        room_chats[room_id].pop(0)
        
    emit('chat_message', data, to=room_id)

# ==========================================
# 🥩 ระบบย่างหมู Real-time (แยกตามห้อง)
# ==========================================

@socketio.on('add_meat')
def handle_add_meat(data):
    room_id = data.get('room_id')
    emit('meat_added', data, to=room_id, include_self=False)

@socketio.on('move_meat')
def handle_move_meat(data):
    room_id = data.get('room_id')
    emit('meat_moved', data, to=room_id, include_self=False)

@socketio.on('flip_meat')
def handle_flip_meat(data):
    room_id = data.get('room_id')
    emit('meat_flipped', data, to=room_id, include_self=False)

@socketio.on('remove_meat')
def handle_remove_meat(data):
    room_id = data.get('room_id')
    emit('meat_removed', data, to=room_id, include_self=False)

# ==========================================
# 🎯 ระบบป้อนหมูและอัปเดตคะแนน
# ==========================================

@socketio.on('feed_friend')
def handle_feed_friend(data):
    room_id = data.get('room_id')
    target_username = data.get('targetId') 
    point_change = data.get('pointChange', 0)
    
    if room_id not in room_scores: 
        room_scores[room_id] = {}
        
    # 🌟 1. อัปเดตลงสมุดจดถาวร
    current = room_scores[room_id].get(target_username, 0)
    room_scores[room_id][target_username] = current + point_change
        
    # 🌟 2. อัปเดตในรายชื่อคนที่ออนไลน์อยู่
    if room_id in room_members:
        for sid, p in room_members[room_id].items():
            if p['username'] == target_username:
                p['score'] = room_scores[room_id][target_username]
                break
    
    # 🌟 ประกาศบอกทุกคนว่าคะแนนเปลี่ยน
    emit('score_updated', {'targetId': target_username, 'pointChange': point_change}, to=room_id)

# 🌟 ระบบตู้เพลง YouTube
@socketio.on('play_youtube')
def handle_play_youtube(data):
    room_id = data.get('room_id')
    youtube_url = data.get('url')
    requester = data.get('username')
    song_title = data.get('title', 'ไม่ทราบชื่อเพลง')
    print(f"🎵 [ห้อง {room_id}] {requester} ขอเพลง: {youtube_url}")
    
    # ส่งลิงก์เพลงไปให้ทุกคนในห้อง (รวมถึงคนที่ส่งมาด้วย)
    emit('youtube_started', {
        'url': youtube_url,
        'requester': requester,
        'title': song_title
    }, to=room_id)
    
    # แอบส่งข้อความลงแชทด้วยว่ามีคนเปิดเพลง
    emit('chat_message', {
        'id': f'sys-music-{time.time()}',
        'type': 'system',
        'text': f'🎵 {requester} เปิดเพลงจาก YouTube!'
    }, to=room_id)