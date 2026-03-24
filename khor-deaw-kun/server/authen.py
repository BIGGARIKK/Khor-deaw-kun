from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import random # 🌟 นำเข้า random มาใช้สุ่มรูป
from datetime import datetime # 🌟 นำเข้า datetime มาใช้เก็บเวลาของ Quest

app = Flask(__name__)
CORS(app)
# เชื่อมต่อ Database
app.config["MONGO_URI"] = "mongodb+srv://admin:123@cluster0.azgr14u.mongodb.net/khor_deaw_kun_db"
app.config["JWT_SECRET_KEY"] = "my-super-secret-key"
jwt = JWTManager(app)
mongo = PyMongo(app)

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
        'profile_image': default_avatar, # เก็บชื่อไฟล์หรือ URL
        'badge': 'NEWCOMER 🌊', # ฉายา
        'vibe_status': 'chill', # อารมณ์ปัจจุบัน (chill, tipsy, wasted)
        
        # 2. สถิติ
        'stats': {
            'postCount': 0, 
            'cheersCount': 0, # จำนวนครั้งที่ไปชนแก้วคนอื่น
            'followerCount': 0, 
            'followingCount': 0
        },
        
        # 3. ระบบ Daily Quest (เก็บเป็น Object)
        'daily_quest': {
            'last_updated': today_str, # เก็บวันที่ล่าสุดที่ทำเควสต์
            'cheers_today': 0,         # ความคืบหน้าวันนี้
            'target': 5,               # เป้าหมาย
            'is_completed': False      # ทำสำเร็จหรือยัง
        },
        
        # 4. ความสัมพันธ์
        'followers': [],
        'following': []
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
        # 🌟 ส่งรูปโปรไฟล์กลับไปด้วยเผื่อเอาไปโชว์ที่ Navbar
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
        # 🌟 เช็คว่า Quest ของเมื่อวานหรือเปล่า ถ้าใช่ให้ Reset ก่อนส่งให้หน้าบ้าน
        today_str = datetime.now().strftime("%Y-%m-%d")
        if user.get('daily_quest', {}).get('last_updated') != today_str:
            # ข้ามวันแล้ว รีเซ็ตเควสต์!
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
    
if __name__ == '__main__':
    app.run(debug=True)