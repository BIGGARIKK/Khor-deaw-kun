from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import random # 🌟 นำเข้า random มาใช้สุ่มรูป
from datetime import datetime # 🌟 นำเข้า datetime มาใช้เก็บเวลาของ Quest
from bson.objectid import ObjectId
import uuid
from extensions import socketio
import events
import string

app = Flask(__name__)
CORS(app)
# เชื่อมต่อ Database
app.config["MONGO_URI"] = "mongodb+srv://admin:123@cluster0.azgr14u.mongodb.net/khor_deaw_kun_db"
app.config["JWT_SECRET_KEY"] = "my-super-secret-key"
jwt = JWTManager(app)
mongo = PyMongo(app)

socketio.init_app(app)

# --- SIGNUP ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # เช็คว่ามี username หรือ email นี้ในระบบหรือยัง
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'message': 'Username already exists!'}), 400
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already exists!'}), 400

    hashed_password = generate_password_hash(password)
    
    # 🌟 สุ่มรูปโปรไฟล์เริ่มต้นจาก 1.png ถึง 9.png
    default_avatar = f"{random.randint(1, 9)}.png"
    
    # 🌟 วันที่ปัจจุบัน (เอาไว้เช็ค Reset Quest)
    today_str = datetime.now().strftime("%Y-%m-%d")

    # 🌟 สร้างโครงสร้าง User ฉบับจัดเต็ม
    new_user = {
        'username': username,
        'password': hashed_password,
        'email': email,
        
        # 1. รูปโปรไฟล์และสถานะ
        'profile_image': default_avatar, 
        'badge': 'NEWCOMER 🌊', 
        'vibe_status': 'chill', 
        
        # 2. สถิติ
        'stats': {
            'postCount': 0, 
            'cheersCount': 0, 
            'followerCount': 0, 
            'followingCount': 0
        },
        
        # 3. ระบบ Daily Quest (เก็บเป็น Object)
        'daily_quest': {
            'last_updated': today_str, 
            'cheers_today': 0,         
            'target': 5,               
            'is_completed': False      
        },
        
        # 4. ความสัมพันธ์ และข้อมูลที่เพิ่มมาใหม่
        'followers': [],
        'following': [],
        'socials': {'line': '', 'facebook': '', 'instagram': ''},
        'vibe_sliders': {'sleepy': 0, 'hungry': 0, 'energy': 0}
    }
    
    mongo.db.users.insert_one(new_user)
    return jsonify({'message': 'User created successfully!'}), 201

# --- SIGNIN ---
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
    else:
        return jsonify({'message': 'Invalid username or password!'}), 401


# ----- Profile -----
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
    else:
        return jsonify({'message': 'User not found'}), 404

# --- เช็ค Username ---
@app.route('/check-username',methods=['GET'])
def check_username():
    username = request.args.get('username')
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'exists': True}), 200
    else:
        return jsonify({'exists': False}), 200

# --- DELETE USER ---
@app.route('/users/<username>' , methods=['DELETE'])
def delete_user(username):
    result = mongo.db.users.delete_one({'username': username})
    if result.deleted_count > 0:
        return jsonify({'message': 'User deleted successfully!'}), 200
    else:
        return jsonify({'message': 'User not found!'}), 404


#------ CREATE POST --------
@app.route('/posts' , methods=['POST'])
@jwt_required()
def create_post():
    current_user = get_jwt_identity()
    data = request.get_json()
    text = data.get('text' , '').strip()
    image_url = data.get('image_url' , None)
    user = mongo.db.users.find_one({'username': current_user})
    author_image = user.get('profile_image', '1.png') if user else '1.png'
    if not text and not image_url:
        return jsonify({'message' : 'Post cannot be empty!'}) , 400
    
    new_post = {
        'author_username' : current_user,
        'author_image': author_image,
        'text' : text,
        'image_url' : image_url,
        'likes' : [],
        'comment' : [],
        'create_at' : datetime.utcnow()
    }

    result = mongo.db.posts.insert_one(new_post)

    mongo.db.users.update_one(
        {'username' : current_user},
        {'$inc': {'stats.postCount': 1}}
    )

    return jsonify({
        'message': 'Shout successful!',
        'post_id': str(result.inserted_id)
    }), 201


#--------- GET POST ------------
@app.route('/posts' ,methods=['GET'])
@jwt_required()
def get_posts():
    posts_cursor = mongo.db.posts.find().sort("create_at" ,-1)
    posts_list = []
    for post in posts_cursor:
        post["_id"] = str(post['_id'])
        posts_list.append(post)
    return jsonify(posts_list) , 200

@app.route('/posts/me' ,methods=['GET'])
@jwt_required()
def get_my_posts():
    current_user = get_jwt_identity()
    posts_cursor = mongo.db.posts.find({'author_username': current_user}).sort("create_at" ,-1)
    posts_list = []
    for post in posts_cursor:
        post["_id"] = str(post['_id'])
        posts_list.append(post)
    return jsonify(posts_list) , 200
    
# ==========================================
# 💬 COMMENT ON A POST
# ==========================================
@app.route('/posts/<post_id>/comment' ,  methods=['POST'])
@jwt_required()
def add_comment(post_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    comment_text = data.get('text' , '').strip()

    if not comment_text:
        return jsonify({'message' : 'Comment cannot be empty!'}) , 400
    
    new_comment = {
        'comment_id' : str(uuid.uuid4()),
        'author' : current_user,
        'text': comment_text,
        'create_at' : datetime.utcnow()
    }

    result = mongo.db.posts.update_one(
        {'_id' : ObjectId(post_id)},
        {'$push' : {'comment' : new_comment}}
    )

    if result.matched_count == 0 :
        return jsonify({'message' : 'Post not fond'});
    
    return jsonify({'message': 'Comment added successfully!', 'comment': new_comment}), 201

# ==========================================
# 🛠️ UPDATE PROFILE (อัปเดตข้อมูลโปรไฟล์ Vibe และ Socials)
# ==========================================
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
        
    # 🌟 เพิ่มการอัปเดตช่องทางติดต่อ
    if 'socials' in data:
        update_fields['socials'] = data['socials']
        
    # 🌟 เพิ่มการอัปเดตแถบพลังงาน
    if 'vibe_sliders' in data:
        update_fields['vibe_sliders'] = data['vibe_sliders']

    if 'stories' in data:
        update_fields['stories'] = data['stories']
        
    if update_fields:
        mongo.db.users.update_one(
            {'username': current_user},
            {'$set': update_fields}
        )
        return jsonify({'message': 'Profile updated successfully!'}), 200
        
    return jsonify({'message': 'No data provided to update'}), 400

# ==========================================
# 🍻 TOGGLE LIKE 
# ==========================================
@app.route('/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    current_user = get_jwt_identity() 
    
    post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    if not post:
        return jsonify({'message': 'Post not found'}), 404
        
    current_likes = post.get('likes', [])
    
    if current_user in current_likes:
        mongo.db.posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$pull': {'likes': current_user}}
        )
        return jsonify({'message': 'Unliked', 'liked': False}), 200
    else:
        mongo.db.posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$push': {'likes': current_user}}
        )
        return jsonify({'message': 'Liked', 'liked': True}), 200

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
    status = data.get('status', 'public') 
    password = data.get('password', '')
    
    new_room = {
        'room_id': room_id,
        'room_name': data.get('room_name', f"โต๊ะของ {current_user}"),
        'host_username': current_user,
        'players': [current_user], 
        'max_players': int(data.get('max_players', 6)),
        'status': status,
        'password': password, 
        'created_at': datetime.utcnow()
    }
    
    mongo.db.rooms.insert_one(new_room)
    
    return jsonify({
        'message': 'สร้างห้องสำเร็จ!', 
        'room_id': room_id,
        'room_name': new_room['room_name']
    }), 201

@app.route('/join-room', methods=['POST'])
@jwt_required()
def join_room_api():
    current_user = get_jwt_identity()
    data = request.get_json()
    room_id = data.get('room_id')
    password_attempt = data.get('password', '')

    room = mongo.db.rooms.find_one({'room_id': room_id})
    if not room:
        return jsonify({'message': 'ไม่พบห้องนี้ในระบบ!'}), 404

    if len(room['players']) >= room['max_players']:
        return jsonify({'message': 'โต๊ะเต็มแล้วจ้า!'}), 400

    if room['status'] == 'private' and room['password'] != password_attempt:
        return jsonify({'message': 'รหัสผ่านห้องไม่ถูกต้อง!'}), 403

    if current_user not in room['players']:
        mongo.db.rooms.update_one(
            {'room_id': room_id},
            {'$push': {'players': current_user}}
        )

    return jsonify({
        'message': 'เข้าร่วมโต๊ะสำเร็จ!', 
        'room_id': room_id
    }), 200

@app.route('/rooms', methods=['GET'])
@jwt_required()
def get_all_rooms():
    rooms_cursor = mongo.db.rooms.find().sort("created_at", -1)
    rooms_list = []
    for room in rooms_cursor:
        room["_id"] = str(room['_id'])
        if 'password' in room:
            del room['password'] 
        rooms_list.append(room)

    return jsonify(rooms_list), 200

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

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)