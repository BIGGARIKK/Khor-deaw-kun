from extensions import socketio
from flask_socketio import emit, join_room, leave_room # 🌟 เพิ่ม join_room และ leave_room
from flask import request
import time # อย่าลืม import time ไว้บนสุดนะครับ
timer_thread = None

def background_timer():
    """ 🕰️ นาฬิกากลาง: เดินทุก 1 วินาที """
    while True:
        socketio.sleep(1)
        # 🌟 สั่งอัปเดตทุกห้องพร้อมกัน (server_tick ยังเป็น Global ได้)
        socketio.emit('server_tick')

# ==========================================
# 🚪 ระบบจัดการการเชื่อมต่อและแยกห้อง
# ==========================================

@socketio.on('connect')
def handle_connect():
    global timer_thread
    if timer_thread is None:
        timer_thread = socketio.start_background_task(background_timer)
    print(f"🔥 มีคนหยิบตะเกียบเข้าร่วมเซิร์ฟเวอร์! (ID: {request.sid})")


# 🌟 สร้าง Dictionary เก็บรายชื่อคนในแต่ละห้องไว้เช็ค (นอกฟังก์ชัน)
# 🌟 เก็บข้อมูล: { room_id: { sid: username, sid2: username2 } }
room_members = {}

@socketio.on('join_game_room')
def handle_join_game_room(data):
    room_id = data.get('room_id')
    username = data.get('username')
    # 🌟 1. รับรูปโปรไฟล์ที่ส่งมาด้วย (ถ้าไม่มีให้เป็นค่าว่าง)
    profile_image = data.get('profile_image', '') 
    sid = request.sid
    
    join_room(room_id)
    
    if room_id not in room_members:
        room_members[room_id] = {}
        
    # 🌟 2. เก็บข้อมูลเป็น Object { username, profile_image }
    room_members[room_id][sid] = {
        'username': username,
        'profile_image': profile_image
    }
        
    current_players = list(room_members[room_id].values())
    emit('update_player_list', current_players, to=room_id)
    
    # ... (โค้ดแจ้งเตือนแชทเหมือนเดิม)

# 🌟 เพิ่มระบบ "เช็คคนออกจากโต๊ะ" (Disconnect)
@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    # ไล่หาว่า sid นี้เคยอยู่ห้องไหน
    for room_id, members in room_members.items():
        if sid in members:
            username = members[sid]
            del members[sid] # ลบชื่อคนนี้ออก
            
            # ส่งรายชื่อใหม่ให้คนที่เหลือในห้องเห็น
            current_players = list(members.values())
            emit('update_player_list', current_players, to=room_id)
            
            # (Optional) แชทบอกคนอื่นว่าเพื่อนอิ่มแล้ว
            emit('chat_message', {
                'id': f'sys-out-{sid}',
                'type': 'system',
                'text': f'--- {username} ลุกจากโต๊ะไปแล้ว 🏃‍♂️ ---'
            }, to=room_id)
            break
# ==========================================
# 💬 ระบบ Room Chat (แยกตามห้อง)
# ==========================================

@socketio.on('send_message')
def handle_send_message(data):
    room_id = data.get('room_id') # 🌟 หน้าบ้านต้องแนบ room_id มาด้วย
    print(f"💬 [ห้อง {room_id}] แชทจาก {data.get('sender')}: {data.get('text')}")
    
    # 🌟 ส่งเฉพาะคนใน room_id
    emit('chat_message', data, to=room_id)

# ==========================================
# 🥩 ระบบย่างหมู Real-time (แยกตามห้อง)
# ==========================================

@socketio.on('add_meat')
def handle_add_meat(data):
    room_id = data.get('room_id')
    # ส่งให้เพื่อนในห้องเดียวกันเห็นหมูชิ้นใหม่
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

@socketio.on('feed_friend')
def handle_feed_friend(data):
    room_id = data.get('room_id')
    # อัปเดตคะแนนให้ทุกคนในห้องเห็นพร้อมกัน
    emit('score_updated', data, to=room_id)