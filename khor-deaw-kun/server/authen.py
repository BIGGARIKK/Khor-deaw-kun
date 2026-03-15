from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required


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

    # เช็คว่ามี username นี้ในระบบหรือยัง
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'message': 'Username already exists!'}), 400

    # เช็คว่ามี email นี้ในระบบหรือยัง
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already exists!'}), 400

    # Hash รหัสผ่านก่อนเก็บลง Database
    hashed_password = generate_password_hash(password)
    
    # สร้างโครงสร้าง User เริ่มต้น
    new_user = {
        'username': username,
        'password': hashed_password,
        'email': email,
        'stats': {'postCount': 0, 'followerCount': 0, 'followingCount': 0},
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

    # ตรวจสอบรหัสผ่านที่ Hash ไว้
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username)
        return jsonify({'message': 'Sign in successful!', 'username': username, 'access_token': access_token}), 200
    else:
        return jsonify({'message': 'Invalid username or password!'}), 401


@app.route('/check-username',methods=['GET'])
def check_username():
    username = request.args.get('username')
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'exists': True}), 200
    else:
        return jsonify({'exists': False}), 200

#--- DELETE USER ---

@app.route('/users/<username>' , methods=['DELETE'])
def delete_user(username):
    result = mongo.db.users.delete_one({'username': username})
    if result.deleted_count > 0:
        return jsonify({'message': 'User deleted successfully!'}), 200
    else:
        return jsonify({'message': 'User not found!'}), 404



#----- Profile -----

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    # ดึง username จาก Token ที่ส่งมา
    username = get_jwt_identity() 
    
    # ค้นหาข้อมูลใน MongoDB (เลือกเฉพาะฟิลด์ที่ต้องการ)
    user = mongo.db.users.find_one({'username': username}, {'_id': 0, 'password': 0})
    
    if user:
        return jsonify(user), 200
    else:
        return jsonify({'message': 'User not found'}), 404




if __name__ == '__main__':
    app.run(debug=True)

