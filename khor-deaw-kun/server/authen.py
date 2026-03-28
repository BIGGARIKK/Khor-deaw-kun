from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import random 
from datetime import datetime 
from bson.objectid import ObjectId
import uuid
from extensions import socketio
import events
import string

app = Flask(__name__)
CORS(app)

# เชื่อมต่อ Database (ตรวจสอบ URI ให้ถูกต้อง)
app.config["MONGO_URI"] = "mongodb+srv://admin:123@cluster0.azgr14u.mongodb.net/khor_deaw_kun_db"
app.config["JWT_SECRET_KEY"] = "my-super-secret-key"
jwt = JWTManager(app)
mongo = PyMongo(app)

socketio.init_app(app)

# ==========================================
# 👤 USER SYSTEM (SIGNUP / SIGNIN / PROFILE)
# ==========================================

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if mongo.db.users.find_one({'username': username}):
        return jsonify({'message': 'Username already exists!'}), 400
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already exists!'}), 400

    hashed_password = generate_password_hash(password)
    default_avatar = f"{random.randint(1, 9)}.png"
    today_str = datetime.now().strftime("%Y-%m-%d")

    new_user = {
        'username': username,
        'password': hashed_password,
        'email': email,
        'profile_image': default_avatar,
        'badge': 'NEWCOMER 🌊',
        'vibe_status': 'chill',
        'stats': {'postCount': 0, 'cheersCount': 0, 'followerCount': 0, 'followingCount': 0},
        'daily_quest': {'last_updated': today_str, 'cheers_today': 0, 'target': 5, 'is_completed': False},
        'followers': [],
        'following': [],
        'socials': {'line': '', 'facebook': '', 'instagram': ''},
        'vibe_sliders': {'sleepy': 0, 'hungry': 0, 'energy': 0}
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
    
    if 'profile_image' in data:
        update_fields['profile_image'] = data['profile_image']
        mongo.db.posts.update_many(
            {'author_username': current_user},
            {'$set': {'author_image': data['profile_image']}}
        )
    if 'vibe' in data:
        update_fields['vibe'] = data['vibe'].strip()
        
    if update_fields:
        mongo.db.users.update_one({'username': current_user}, {'$set': update_fields})
        return jsonify({'message': 'Profile updated successfully!'}), 200
    return jsonify({'message': 'No data provided to update'}), 400

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
    
    if not text and not image_url:
        return jsonify({'message': 'Post cannot be empty!'}), 400
    
    new_post = {
        'author_username': current_user,
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

# 🌟 NEW: ลบโพสต์ (เช็คความเป็นเจ้าของ)
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

# 🌟 NEW: แก้ไขโพสต์ (เช็คความเป็นเจ้าของ + รองรับรูปภาพ)
@app.route('/posts/<post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    new_text = data.get('text', '').strip()
    new_image_url = data.get('image_url') # รับค่ารูปภาพมาด้วย

    # เช็คว่าห้ามลบจนว่างเปล่าทั้งคู่
    if not new_text and not new_image_url:
        return jsonify({'message': 'ข้อความหรือรูปภาพห้ามว่างทั้งหมด!'}), 400

    post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    if not post:
        return jsonify({'message': 'ไม่พบโพสต์นี้!'}), 404
    if post.get('author_username') != current_user:
        return jsonify({'message': 'คุณไม่มีสิทธิ์แก้ไขโพสต์คนอื่น!'}), 403

    # อัปเดตข้อมูล (ทั้งข้อความและรูปภาพ)
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
        return jsonify({'message': 'Liked', 'liked': True}), 200

@app.route('/posts/<post_id>/comment', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    comment_text = data.get('text', '').strip()
    if not comment_text: return jsonify({'message': 'Comment cannot be empty!'}), 400
    
    new_comment = {
        'comment_id': str(uuid.uuid4()),
        'author': current_user,
        'text': comment_text,
        'create_at': datetime.utcnow()
    }
    mongo.db.posts.update_one({'_id': ObjectId(post_id)}, {'$push': {'comment': new_comment}})
    return jsonify({'message': 'Comment added successfully!', 'comment': new_comment}), 201

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
# 🤝 TOGGLE FOLLOW
# ==========================================
@app.route('/users/<username>/follow', methods=['POST'])
@jwt_required()
def toggle_follow(username):
    current_user = get_jwt_identity() # คนที่กดปุ่ม
    
    if current_user == username:
        return jsonify({'message': 'You cannot follow yourself!'}), 400
        
    target_user = mongo.db.users.find_one({'username': username}) # คนที่ถูกกดฟอล
    
    if not target_user:
        return jsonify({'message': 'User not found'}), 404
        
    # เช็คว่าเราฟอลเขาอยู่หรือยัง
    if current_user in target_user.get('followers', []):
        # Unfollow: เอาเราออกจาก followers เขา และเอาเขาออกจาก following เรา
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
        # Follow: เพิ่มเราเข้าไปใน followers เขา และเพิ่มเขาใน following เรา
        mongo.db.users.update_one(
            {'username': username},
            {'$push': {'followers': current_user}}
        )
        mongo.db.users.update_one(
            {'username': current_user},
            {'$push': {'following': username}}
        )
        return jsonify({'message': 'Followed', 'is_following': True}), 200

# 🌟 ดูโพสต์ของใครก็ได้ (รวมถึงของตัวเองด้วย)
@app.route('/posts/<username>', methods=['GET'])
def get_user_posts(username):
    try:
        # ค้นหาโพสต์ของ username นั้นๆ เรียงจากใหม่ไปเก่า
        posts_cursor = mongo.db.posts.find({'author_username': username}).sort("create_at", -1)
        
        posts_list = []
        for post in posts_cursor:
            post["_id"] = str(post['_id']) # แปลง _id เป็น String
            posts_list.append(post)
            
        return jsonify(posts_list), 200
    except Exception as e:
        print(f"Error fetching posts for {username}: {e}")
        return jsonify({"error": "เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์"}), 500


@app.route('/profile/<username>', methods=['GET'])
def get_other_profile(username):
    # ดึงข้อมูล user โดยไม่เอา password และ _id ออกมา
    user = mongo.db.users.find_one({'username': username}, {'_id': 0, 'password': 0})
    if user:
        return jsonify(user), 200
    return jsonify({'message': 'User not found'}), 404

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)