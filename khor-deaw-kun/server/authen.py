from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from bson.objectid import ObjectId
import random 
from datetime import datetime 
import uuid
import re
from collections import Counter
import string

from extensions import socketio
import events

app = Flask(__name__)
CORS(app)

# ==========================================
# ⚙️ APP CONFIGURATION
# ==========================================
app.config["MONGO_URI"] = "mongodb+srv://admin:123@cluster0.azgr14u.mongodb.net/khor_deaw_kun_db"
app.config["JWT_SECRET_KEY"] = "my-super-secret-key"

jwt = JWTManager(app)
mongo = PyMongo(app)

socketio.init_app(app)
events.init_db(mongo)

# ==========================================
# 🎨 CONSTANTS
# ==========================================
BANNER_PRESETS = [
    {"id": 1, "color": "#ffb8b8", "pattern": "repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 15px, transparent 15px, transparent 30px)", "size": "100% 100%"},
    {"id": 2, "color": "#6de6e6", "pattern": "radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%), radial-gradient(rgba(255,255,255,0.6) 15%, transparent 16%)", "size": "20px 20px", "position": "0 0, 10px 10px"},
    {"id": 3, "color": "#ffe066", "pattern": "linear-gradient(rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.5) 2px, transparent 2px)", "size": "20px 20px"},
    {"id": 4, "color": "#84e045", "pattern": "linear-gradient(45deg, rgba(255,255,255,0.5) 2px, transparent 2px), linear-gradient(-45deg, rgba(255,255,255,0.5) 2px, transparent 2px)", "size": "15px 15px"},
    {"id": 5, "color": "#50ade2", "pattern": "repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 15px, transparent 15px, transparent 30px)", "size": "100% 100%"},
    {"id": 6, "color": "#b088f9", "pattern": "radial-gradient(circle at 0 0, rgba(255,255,255,0.4) 50%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 50%, transparent 50%)", "size": "30px 30px"},
    {"id": 7, "color": "#ff99c8", "pattern": "repeating-radial-gradient(circle, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)", "size": "100% 100%"},
    {"id": 8, "color": "#a0c4ff", "pattern": "linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))", "size": "20px 20px", "position": "0 0, 10px 10px"},
    {"id": 9, "color": "#fdffb6", "pattern": "repeating-linear-gradient(transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)", "size": "100% 100%"},
    {"id": 10, "color": "#caffbf", "pattern": "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 15px, transparent 15px, transparent 30px)", "size": "100% 100%"},
    {"id": 11, "color": "#ffd6a5", "pattern": "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 10px, transparent 10px, transparent 20px)", "size": "100% 100%"},
    {"id": 12, "color": "#30795d", "pattern": "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 5px, transparent 5px, transparent 10px)", "size": "100% 100%"}
]

# ==========================================
# 🔔 NOTIFICATION HELPER
# ==========================================
def create_notification(recipient, sender, notif_type, message, post_id=None):
    if recipient == sender:
        return 
        
    sender_data = mongo.db.users.find_one({'username': sender})
    sender_image = sender_data.get('profile_image', '1.png') if sender_data else '1.png'
    sender_display_name = sender_data.get('display_name', sender) if sender_data else sender

    notification = {
        'recipient_username': recipient,
        'sender_username': sender,
        'sender_display_name': sender_display_name,
        'sender_image': sender_image,
        'type': notif_type, 
        'message': message,
        'post_id': str(post_id) if post_id else None,
        'is_read': False,
        'created_at': datetime.utcnow()
    }
    mongo.db.notifications.insert_one(notification)

# ==========================================
# 👤 USER SYSTEM (SIGNUP / SIGNIN / PROFILE)
# ==========================================

@app.route('/check-username', methods=['GET'])
def check_username():
    username = request.args.get('username')
    
    if not username:
        return jsonify({'message': 'ไม่ได้ส่งค่า username มา'}), 400

    existing_user = mongo.db.users.find_one({'username': username})
    
    if existing_user:
        return jsonify({'exists': True, 'message': 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว'}), 200
    else:
        return jsonify({'exists': False, 'message': 'ชื่อผู้ใช้นี้สามารถใช้งานได้'}), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # 🌟 ดักจับข้อมูลว่าง (ป้องกัน Error 500 ตอนสร้าง Hash)
    if not username or not password or not email:
        return jsonify({'message': 'กรุณากรอกข้อมูลให้ครบถ้วน!'}), 400

    random_banner = random.choice(BANNER_PRESETS)

    if mongo.db.users.find_one({'username': username}):
        return jsonify({'message': 'Username already exists!'}), 400
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already exists!'}), 400

    hashed_password = generate_password_hash(password)
    default_avatar = f"{random.randint(1, 9)}.png"
    today_str = datetime.now().strftime("%Y-%m-%d")

    new_user = {
        'username': username,
        'display_name': username,
        'password': hashed_password,
        'email': email,
        'profile_image': default_avatar,
        'banner': random_banner,
        'badge': 'NEWCOMER 🌊',
        'vibe_status': 'chill',
        'stats': {'postCount': 0, 'cheersCount': 0, 'followerCount': 0, 'followingCount': 0},
        'daily_quest': {'last_updated': today_str, 'cheers_today': 0, 'target': 5, 'is_completed': False},
        'followers': [],
        'following': [],
        'socials': {'line': '', 'facebook': '', 'instagram': ''},
        'vibe_sliders': {'sleepy': 0, 'hungry': 0, 'energy': 0},
        'online_status': 'online'
        # ไม่ต้องมี array notifications ในนี้แล้ว เพราะเราแยกไป Collection ใหม่แล้ว
    }
    
    mongo.db.users.insert_one(new_user)
    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = mongo.db.users.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username)
        return jsonify({
            'message': 'Sign in successful!', 
            'username': username, 
            'profile_image': user.get('profile_image'),
            'access_token': access_token
        }), 200
    return jsonify({'message': 'Invalid username or password!'}), 401

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    username = get_jwt_identity() 
    user = mongo.db.users.find_one({'username': username}, {'_id': 0, 'password': 0})
    
    if user:
        today_str = datetime.now().strftime("%Y-%m-%d")
        if user.get('daily_quest', {}).get('last_updated') != today_str:
            mongo.db.users.update_one(
                {'username': username},
                {'$set': {
                    'daily_quest.cheers_today': 0,
                    'daily_quest.is_completed': False,
                    'daily_quest.last_updated': today_str
                }}
            )
            user['daily_quest']['cheers_today'] = 0
            user['daily_quest']['is_completed'] = False
            user['daily_quest']['last_updated'] = today_str
        return jsonify(user), 200
    return jsonify({'message': 'User not found'}), 404

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    data = request.get_json()
    update_fields = {}

    if 'display_name' in data:
        update_fields['display_name'] = data['display_name'].strip()
        mongo.db.posts.update_many(
            {'author_username': current_user},
            {'$set': {'author_display_name': data['display_name'].strip()}}
        )
    
    if 'profile_image' in data:
        update_fields['profile_image'] = data['profile_image']
        mongo.db.posts.update_many(
            {'author_username': current_user},
            {'$set': {'author_image': data['profile_image']}}
        )
        
    if 'vibe' in data:
        update_fields['vibe'] = data['vibe'].strip()

    if 'bio' in data:
        update_fields['bio'] = data['bio'].strip()
        
    if 'banner' in data:
        update_fields['banner'] = data['banner']

    if 'online_status' in data:
        update_fields['online_status'] = data['online_status']
        
    if 'vibe_sliders' in data:
        update_fields['vibe_sliders'] = data['vibe_sliders']
        
    if 'socials' in data:
        update_fields['socials'] = data['socials']
        
    if 'stories' in data:
        update_fields['stories'] = data['stories']

    if update_fields:
        mongo.db.users.update_one({'username': current_user}, {'$set': update_fields})
        return jsonify({'message': 'Profile updated successfully!', 'new_username': update_fields.get('username', current_user)}), 200
        
    return jsonify({'message': 'No data provided to update'}), 400

@app.route('/profile/<username>', methods=['GET'])
def get_other_profile(username):
    user = mongo.db.users.find_one({'username': username}, {'_id': 0, 'password': 0})
    if user:
        return jsonify(user), 200
    return jsonify({'message': 'User not found'}), 404

# ==========================================
# 🤝 FOLLOW SYSTEM
# ==========================================
@app.route('/users/<username>/follow', methods=['POST'])
@jwt_required()
def toggle_follow(username):
    current_user = get_jwt_identity() 
    
    if current_user == username:
        return jsonify({'message': 'You cannot follow yourself!'}), 400
        
    target_user = mongo.db.users.find_one({'username': username})
    
    if not target_user:
        return jsonify({'message': 'User not found'}), 404
        
    if current_user in target_user.get('followers', []):
        mongo.db.users.update_one(
            {'username': username},
            {'$pull': {'followers': current_user}}
        )
        mongo.db.users.update_one(
            {'username': current_user},
            {'$pull': {'following': username}}
        )
        return jsonify({'message': 'Unfollowed', 'is_following': False}), 200
    else:
        mongo.db.users.update_one(
            {'username': username},
            {'$push': {'followers': current_user}}
        )
        mongo.db.users.update_one(
            {'username': current_user},
            {'$push': {'following': username}}
        )
        
        # แจ้งเตือนเมื่อกดติดตาม
        create_notification(username, current_user, 'follow', 'เริ่มติดตามคุณแล้ว')
        
        return jsonify({'message': 'Followed', 'is_following': True}), 200

# ==========================================
# 📢 POST SYSTEM (CREATE / GET / EDIT / DELETE)
# ==========================================
@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    current_user = get_jwt_identity()
    data = request.get_json()
    text = data.get('text', '').strip()
    image_url = data.get('image_url', None)
    
    user = mongo.db.users.find_one({'username': current_user})
    author_image = user.get('profile_image', '1.png') if user else '1.png'
    author_display_name = user.get('display_name', current_user) if user else current_user
    
    if not text and not image_url:
        return jsonify({'message': 'Post cannot be empty!'}), 400
    
    new_post = {
        'author_username': current_user,
        'author_display_name': author_display_name,
        'author_image': author_image,
        'text': text,
        'image_url': image_url,
        'likes': [],
        'comment': [],
        'create_at': datetime.utcnow()
    }

    result = mongo.db.posts.insert_one(new_post)
    mongo.db.users.update_one({'username': current_user}, {'$inc': {'stats.postCount': 1}})

    return jsonify({'message': 'Shout successful!', 'post_id': str(result.inserted_id)}), 201

@app.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    posts_cursor = mongo.db.posts.find().sort("create_at", -1)
    posts_list = []
    for post in posts_cursor:
        post["_id"] = str(post['_id'])
        posts_list.append(post)
    return jsonify(posts_list), 200

@app.route('/posts/<username>', methods=['GET'])
def get_user_posts(username):
    try:
        posts_cursor = mongo.db.posts.find({'author_username': username}).sort("create_at", -1)
        posts_list = []
        for post in posts_cursor:
            post["_id"] = str(post['_id']) 
            posts_list.append(post)
        return jsonify(posts_list), 200
    except Exception as e:
        print(f"Error fetching posts for {username}: {e}")
        return jsonify({"error": "เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์"}), 500

@app.route('/posts/<post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user = get_jwt_identity()
    post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    
    if not post:
        return jsonify({'message': 'ไม่พบโพสต์นี้!'}), 404
    if post.get('author_username') != current_user:
        return jsonify({'message': 'คุณไม่มีสิทธิ์ลบโพสต์คนอื่น!'}), 403

    mongo.db.posts.delete_one({'_id': ObjectId(post_id)})
    mongo.db.users.update_one({'username': current_user}, {'$inc': {'stats.postCount': -1}})
    return jsonify({'message': 'ลบโพสต์เรียบร้อยแล้ว!'}), 200

@app.route('/posts/<post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    new_text = data.get('text', '').strip()
    new_image_url = data.get('image_url')

    if not new_text and not new_image_url:
        return jsonify({'message': 'ข้อความหรือรูปภาพห้ามว่างทั้งหมด!'}), 400

    post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    if not post:
        return jsonify({'message': 'ไม่พบโพสต์นี้!'}), 404
    if post.get('author_username') != current_user:
        return jsonify({'message': 'คุณไม่มีสิทธิ์แก้ไขโพสต์คนอื่น!'}), 403

    update_data = {
        'text': new_text,
        'image_url': new_image_url,
        'updated_at': datetime.utcnow()
    }

    mongo.db.posts.update_one({'_id': ObjectId(post_id)}, {'$set': update_data})
    return jsonify({'message': 'แก้ไขโพสต์เรียบร้อยแล้ว!'}), 200

# ==========================================
# 🍻 INTERACTION (LIKE / COMMENT)
# ==========================================
@app.route('/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    current_user = get_jwt_identity()
    post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    if not post: return jsonify({'message': 'Post not found'}), 404
    
    current_likes = post.get('likes', [])
    if current_user in current_likes:
        mongo.db.posts.update_one({'_id': ObjectId(post_id)}, {'$pull': {'likes': current_user}})
        return jsonify({'message': 'Unliked', 'liked': False}), 200
    else:
        mongo.db.posts.update_one({'_id': ObjectId(post_id)}, {'$push': {'likes': current_user}})
        
        create_notification(post.get('author_username'), current_user, 'like', 'ถูกใจโพสต์ของคุณ', post_id)
        
        return jsonify({'message': 'Liked', 'liked': True}), 200

@app.route('/posts/<post_id>/comment', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    comment_text = data.get('text', '').strip()
    if not comment_text: return jsonify({'message': 'Comment cannot be empty!'}), 400
    
    post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    if not post: return jsonify({'message': 'Post not found'}), 404
    
    new_comment = {
        'comment_id': str(uuid.uuid4()),
        'author': current_user,
        'text': comment_text,
        'create_at': datetime.utcnow()
    }
    mongo.db.posts.update_one({'_id': ObjectId(post_id)}, {'$push': {'comment': new_comment}})
    
    create_notification(post.get('author_username'), current_user, 'comment', 'คอมเมนต์ในโพสต์ของคุณ', post_id)
    
    return jsonify({'message': 'Comment added successfully!', 'comment': new_comment}), 201

# ==========================================
# 🔔 GET NOTIFICATIONS
# ==========================================
@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user = get_jwt_identity()
    
    notifs_cursor = mongo.db.notifications.find({'recipient_username': current_user}).sort('created_at', -1).limit(30)
    
    notifs_list = []
    unread_count = 0
    
    for n in notifs_cursor:
        n['_id'] = str(n['_id'])
        if not n.get('is_read', False):
            unread_count += 1
        notifs_list.append(n)
        
    return jsonify({
        'notifications': notifs_list,
        'unread_count': unread_count
    }), 200

@app.route('/notifications/read', methods=['PUT'])
@jwt_required()
def mark_notifications_read():
    current_user = get_jwt_identity()
    
    mongo.db.notifications.update_many(
        {'recipient_username': current_user, 'is_read': False},
        {'$set': {'is_read': True}}
    )
    return jsonify({'message': 'ทำเครื่องหมายว่าอ่านแล้วทั้งหมด'}), 200

# ==========================================
# 🔥 TRENDING HASHTAGS
# ==========================================
@app.route('/trending', methods=['GET'])
def get_trending():
    try:
        posts = mongo.db.posts.find({}, {"text": 1}).sort("create_at", -1).limit(100)
        all_tags = []
        for post in posts:
            text = post.get('text', '')
            tags = re.findall(r'#[^\s#]+', text)
            all_tags.extend(tags)
            
        top_tags = Counter(all_tags).most_common(5)
        trending_data = [{"tag": tag, "count": count} for tag, count in top_tags]
        
        return jsonify(trending_data), 200
    except Exception as e:
        print(f"Error fetching trending tags: {e}")
        return jsonify({"error": "Failed to fetch trending"}), 500

# ==========================================
# 🏠 ROOMS SYSTEM
# ==========================================
def generate_room_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route('/create-room', methods=['POST'])
@jwt_required()
def create_room():
    current_user = get_jwt_identity()
    data = request.get_json()
    room_id = generate_room_id()
    new_room = {
        'room_id': room_id,
        'room_name': data.get('room_name', f"โต๊ะของ {current_user}"),
        'host_username': current_user,
        'players': [current_user],
        'max_players': int(data.get('max_players', 6)),
        'status': data.get('status', 'public'),
        'password': data.get('password', ''),
        'created_at': datetime.utcnow()
    }
    mongo.db.rooms.insert_one(new_room)
    return jsonify({'message': 'สร้างห้องสำเร็จ!', 'room_id': room_id}), 201

@app.route('/join-room', methods=['POST'])
@jwt_required()
def join_room_api():
    current_user = get_jwt_identity()
    data = request.get_json()
    room = mongo.db.rooms.find_one({'room_id': data.get('room_id')})
    if not room: return jsonify({'message': 'ไม่พบห้อง!'}), 404
    if len(room['players']) >= room['max_players']: return jsonify({'message': 'โต๊ะเต็ม!'}), 400
    if room['status'] == 'private' and room['password'] != data.get('password', ''):
        return jsonify({'message': 'รหัสผ่านไม่ถูกต้อง!'}), 403
    
    if current_user not in room['players']:
        mongo.db.rooms.update_one({'room_id': room['room_id']}, {'$push': {'players': current_user}})
    return jsonify({'message': 'เข้าร่วมสำเร็จ!', 'room_id': room['room_id']}), 200

@app.route('/rooms', methods=['GET'])
@jwt_required()
def get_all_rooms():
    rooms = list(mongo.db.rooms.find().sort("created_at", -1))
    for r in rooms: 
        r["_id"] = str(r['_id'])
        if 'password' in r: del r['password']
    return jsonify(rooms), 200

# ==========================================
# 🚀 MAIN RUN
# ==========================================
if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)