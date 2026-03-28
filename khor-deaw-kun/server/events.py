from extensions import socketio
from flask_socketio import emit, join_room, leave_room
from flask import request
import time

# ==========================================
# 🌟 ระบบรับ Database จากไฟล์หลัก
# ==========================================
db = None

def init_db(mongo_instance):
    global db
    db = mongo_instance
    print("✅ Database เชื่อมต่อกับ events.py สำเร็จ พร้อมลุย!")

timer_thread = None

def background_timer():
    while True:
        socketio.sleep(1)
        
        # 🌟 1. ให้ Server ช่วยนับเวลาย่างหมูในสมุดจดด้วย!
        for room_id, meats in room_meats.items():
            for meat_id, item in meats.items():
                active_side = item.get('activeSide', 'A')
                
                # เพิ่มความสุกทีละ 1 วิ ตามด้านที่ย่างอยู่
                if active_side == 'A':
                    item['sideA'] = item.get('sideA', 0) + 1
                else:
                    item['sideB'] = item.get('sideB', 0) + 1
                
                # เช็คว่าสุกหรือไหม้แล้วหรือยัง
                side_a = item['sideA']
                side_b = item['sideB']
                
                if side_a > 10 or side_b > 10:
                    item['status'] = 'burnt'
                elif side_a >= 4 and side_b >= 4:
                    item['status'] = 'cooked'
                elif side_a >= 1 or side_b >= 1:
                    item['status'] = 'cooking'
                    
        # 🌟 2. กระจายจังหวะ 1 วิ ให้หน้าเว็บเหมือนเดิม
        socketio.emit('server_tick')

# ==========================================
# 🌟 สมุดจดประจำร้านหมูกระทะ (RAM)
# ==========================================
room_members = {}  
room_scores = {}   
room_chats = {}
room_meats = {} 
room_music = {} # 🌟 เพิ่มสมุดจดสำหรับ "ตู้เพลง"

# ==========================================
# 🚪 ระบบจัดการการเชื่อมต่อ
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
    
    if not room_id or not username: return
    join_room(room_id)
    
    # เตรียมห้องใน RAM
    if room_id not in room_members: room_members[room_id] = {}
    if room_id not in room_scores: room_scores[room_id] = {}
    if room_id not in room_chats: room_chats[room_id] = []
    if room_id not in room_meats: room_meats[room_id] = {}
    if room_id not in room_music: room_music[room_id] = None # 🌟 เตรียมโต๊ะวางเครื่องเล่นเพลง
        
    # ลบร่างเก่าถ้ารีเฟรช
    keys_to_delete = [k for k, v in room_members[room_id].items() if v.get('username') == username]
    for k in keys_to_delete: del room_members[room_id][k]

    # ดึงคะแนนเดิม
    current_score = room_scores[room_id].get(username, 0)
    room_members[room_id][sid] = {
        'username': username,
        'profile_image': profile_image,
        'score': current_score
    }
    
    if len(keys_to_delete) == 0: 
        msg = {
            'id': f'sys-in-{room_id}-{time.time()}',
            'type': 'system',
            'text': f'--- {username} นั่งลงที่โต๊ะแล้ว 🥩 ---'
        }
        room_chats[room_id].append(msg)
        if len(room_chats[room_id]) > 50: room_chats[room_id].pop(0) 
        emit('chat_message', msg, to=room_id)

    def delayed_sync(target_sid, target_room, players_data, chats_data):
        socketio.sleep(0.8) 
        socketio.emit('update_player_list', players_data, to=target_room)
        socketio.emit('load_chat_history', chats_data, to=target_sid)
        
        # 🌟 ถ้าโต๊ะนี้กำลังเปิดเพลงอยู่ ให้ส่งชื่อเพลงไปให้คนที่เพิ่งเข้าห้องด้วย
        if target_room in room_music and room_music[target_room]:
            socketio.emit('youtube_started', room_music[target_room], to=target_sid)

    current_players = list(room_members[room_id].values())
    current_chats = list(room_chats[room_id])
    
    socketio.start_background_task(delayed_sync, sid, room_id, current_players, current_chats)

@socketio.on('request_pan_sync')
def handle_request_pan_sync(data):
    room_id = data.get('room_id')
    sid = request.sid
    if room_id in room_meats:
        emit('load_pan_state', list(room_meats[room_id].values()), to=sid)

@socketio.on('request_chat_sync')
def handle_chat_sync(data):
    room_id = data.get('room_id')
    sid = request.sid
    if room_id in room_chats:
        emit('load_chat_history', room_chats[room_id], to=sid)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    target_room_id = None
    user_to_remove = None
    
    for room_id, members in room_members.items():
        if sid in members:
            target_room_id = room_id
            user_to_remove = members[sid].get('username', 'Unknown')
            break
            
    if not target_room_id: return

    def delayed_cleanup(r_id, disconnected_sid, username):
        socketio.sleep(3)
        if r_id not in room_members: return
        
        if disconnected_sid in room_members[r_id]:
            del room_members[r_id][disconnected_sid]
            
            socketio.emit('update_player_list', list(room_members[r_id].values()), to=r_id)
            
            msg = {'id': f'sys-out-{disconnected_sid}-{time.time()}', 'type': 'system', 'text': f'--- {username} แวะไปเดินเล่นริมหาด (พับจอ) 🏃‍♂️ ---'}
            if r_id in room_chats:
                room_chats[r_id].append(msg)
                if len(room_chats[r_id]) > 50: room_chats[r_id].pop(0)
            socketio.emit('chat_message', msg, to=r_id)

    socketio.start_background_task(delayed_cleanup, target_room_id, sid, user_to_remove)    

@socketio.on('leave_game_room')
def handle_leave_game_room(data):
    room_id = data.get('room_id')
    sid = request.sid
    if room_id in room_members and sid in room_members[room_id]:
        username = room_members[room_id][sid].get('username', 'Unknown')
        del room_members[room_id][sid]
        
        emit('update_player_list', list(room_members[room_id].values()), to=room_id)
        msg = {'id': f'sys-leave-{sid}-{time.time()}', 'type': 'system', 'text': f'--- {username} เก็บจานลุกจากโต๊ะไปแล้ว 👋 ---'}
        if room_id in room_chats:
            room_chats[room_id].append(msg)
            if len(room_chats[room_id]) > 50: room_chats[room_id].pop(0)
        emit('chat_message', msg, to=room_id)
        leave_room(room_id)
        
        if db:
            try:
                db.db.rooms.update_one({'room_id': room_id}, {'$pull': {'players': username}})
                if len(room_members.get(room_id, {})) == 0:
                    if room_id in room_members: del room_members[room_id]
                    if room_id in room_meats: del room_meats[room_id] 
                    if room_id in room_music: del room_music[room_id] # 🌟 ล้างเพลงเมื่อโต๊ะว่าง
                    db.db.rooms.delete_one({'room_id': room_id})
            except Exception as e: print(f"DB Error: {e}")

@socketio.on('send_message')
def handle_send_message(data):
    room_id = data.get('room_id')
    if room_id not in room_chats: room_chats[room_id] = []
    room_chats[room_id].append(data)
    if len(room_chats[room_id]) > 50: room_chats[room_id].pop(0)
    emit('chat_message', data, to=room_id)

# ==========================================
# 🥩 ระบบย่างหมู Real-time
# ==========================================
@socketio.on('add_meat')
def handle_add_meat(data):
    room_id = data.get('room_id')
    meat_id = data.get('uniqueId') 
    if room_id not in room_meats: room_meats[room_id] = {}
    if meat_id: room_meats[room_id][meat_id] = data 
    emit('meat_added', data, to=room_id, include_self=False)

@socketio.on('move_meat')
def handle_move_meat(data):
    room_id = data.get('room_id')
    meat_id = data.get('uniqueId') 
    if room_id in room_meats and meat_id in room_meats[room_id]:
        room_meats[room_id][meat_id].update({'x': data.get('x'), 'y': data.get('y')})
    emit('meat_moved', data, to=room_id, include_self=False)

@socketio.on('flip_meat')
def handle_flip_meat(data):
    room_id = data.get('room_id')
    meat_id = data.get('uniqueId') 
    if room_id in room_meats and meat_id in room_meats[room_id]:
        current_side = room_meats[room_id][meat_id].get('activeSide', 'A')
        room_meats[room_id][meat_id]['activeSide'] = 'B' if current_side == 'A' else 'A'
        current_flip = room_meats[room_id][meat_id].get('flip', 1)
        room_meats[room_id][meat_id]['flip'] = current_flip * -1
    emit('meat_flipped', data, to=room_id, include_self=False)

@socketio.on('remove_meat')
def handle_remove_meat(data):
    room_id = data.get('room_id')
    meat_id = data.get('uniqueId') 
    if room_id in room_meats and meat_id in room_meats[room_id]:
        del room_meats[room_id][meat_id]
    emit('meat_removed', data, to=room_id, include_self=False)

# ==========================================
# 🎯 ระบบป้อนหมูและอัปเดตคะแนน
# ==========================================
@socketio.on('feed_friend')
def handle_feed_friend(data):
    room_id, target, point = data.get('room_id'), data.get('targetId'), data.get('pointChange', 0)
    if room_id not in room_scores: room_scores[room_id] = {}
    room_scores[room_id][target] = room_scores[room_id].get(target, 0) + point
    if room_id in room_members:
        for sid, p in room_members[room_id].items():
            if p['username'] == target:
                p['score'] = room_scores[room_id][target]
                break
    emit('score_updated', {'targetId': target, 'pointChange': point}, to=room_id)

# ==========================================
# 🎵 ระบบตู้เพลง YouTube
# ==========================================
@socketio.on('play_youtube')
def handle_play_youtube(data):
    room_id = data.get('room_id')
    
    # 🌟 แพ็กข้อมูลเพลงเตรียมส่ง
    music_data = {
        'url': data.get('url'), 
        'requester': data.get('username'), 
        'title': data.get('title', 'ไม่ทราบชื่อเพลง')
    }
    
    # 🌟 1. จดลงสมุดของโต๊ะนั้นๆ (เผื่อมีคนรีเฟรชจะได้ส่งให้ใหม่)
    room_music[room_id] = music_data
    
    # 🌟 2. กระจายเสียงให้ทุกคนในห้องฟังทันที
    emit('youtube_started', music_data, to=room_id)
    emit('chat_message', {'id': f'sys-music-{time.time()}', 'type': 'system', 'text': f"🎵 {data.get('username')} เปิดเพลง: {data.get('title', '')}"}, to=room_id)

# ==========================================
# 🍻 ระบบชนแก้ว (Cheers!)
# ==========================================
@socketio.on('send_cheers')
def handle_send_cheers(data):
    room_id = data.get('room_id')
    sender = data.get('sender')
    target = data.get('target')

    if not room_id or not sender or not target: return

    emit('receive_cheers', {
        'sender': sender,
        'target': target,
        'message': f'🍻 {sender} ขอชนแก้วกับ {target}!'
    }, to=room_id)

    if db:
        try:
            db.db.users.update_one(
                {'username': target},
                {'$inc': {'stats.cheersCount': 1}}
            )
            db.db.users.update_one(
                {'username': sender},
                {'$inc': {'daily_quest.cheers_today': 1}}
            )
        except Exception as e:
            print(f"Cheers DB Error: {e}")