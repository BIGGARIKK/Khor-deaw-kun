

export const apiRequest = async (endpoint, method = 'GET', data = null) => {

  const BASE_URL = 'https://khor-deaw-kun.onrender.com'; // URL ของ Flask

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const token = user?.access_token;

  const config = {
    method,
    headers: { 'Content-Type': 'application/json' ,
              ...(token && { 'Authorization' : `Bearer ${token}`  })
    },

  };
  if (data) config.body = JSON.stringify(data);

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const result = await response.json();
  
  if (response.status == 401) {
    localStorage.removeItem('user'); // ลบข้อมูลผู้ใช้จาก localStorage
    window.location.href = '/signin'; // เปลี่ยนเส้นทางไปยังหน้า Sign In
    return; // หยุดการทำงานของฟังก์ชัน
  }

  if (!response.ok) throw result; // โยน Error กลับไปถ้า API ตอบกลับมาว่าไม่สำเร็จ
  return result;
};