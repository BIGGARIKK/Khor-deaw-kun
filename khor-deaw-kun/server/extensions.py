from flask_socketio import SocketIO

# สร้างตัวเปล่าๆ ไว้ก่อน ยังไม่ผูกกับแอป Flask
socketio = SocketIO(cors_allowed_origins="*")