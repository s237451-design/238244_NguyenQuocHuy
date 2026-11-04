\# He Thong Quan Ly Thiet Bi Phong Hoc



\## 1. Mo ta de tai

He thong gom frontend React, backend Express va MongoDB Atlas.



\## 2. Cong nghe

React, Node.js, Express, MongoDB Atlas, Git/GitHub, Docker, Render.



\## 3. Cau truc thu muc

\- backend/: Ma nguon Backend API

\- frontend/: Ma nguon Frontend

\- .gitignore: File bo qua file nhay cam

\- README.md: Tai lieu du an


## 5. Huong dan chay Backend bang Docker
```bash
docker pull quochuy2k5/backend:latest
docker run -d -p 5000:5000 --name backend-app -e PORT=5000 -e MONGODB_URI="your_mongodb_connection_string" quochuy2k5/backend:latest
```

## 5. Huong dan chay Backend bang Docker
```bash
docker pull quochuy2k5/backend:latest
docker run -d -p 5000:5000 --name backend-app -e PORT=5000 -e MONGODB_URI="your_mongodb_connection_string" quochuy2k5/backend:latest
```

## 6. Huong dan chay Frontend bang Docker
```bash
docker pull quochuy2k5/frontend:latest
docker run -d -p 3000:80 --name frontend-app quochuy2k5/frontend:latest
```
