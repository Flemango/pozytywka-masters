# Aplikacja webowa dla gabinetu psychologicznego z modułem uczenia maszynowego

## Technologie

### MERN stack 

- MySQL
- Express.js
- React
- Node.js
- Python Virtual Environment

### Wymagane

- [Node.js](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)
- [MySQL](https://dev.mysql.com/downloads/)

## ⚙️ Instalacja

### 1. Pobranie zależności

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Środowisko Python (venv)

Tworzenie i aktywacja wirtualnego środowiska Python (venv) w folderze `server` oraz instalacja zależności:

```bash
cd server
py -m venv myenv
# Linux/macOS:
source myenv/bin/activate
# Windows:
source myenv/Scripts/activate

py -m pip install -r requirements.txt
```

### 3. Baza danych

Struktura bazy danych znajduje się w pliku `db.sql`. Należy uruchomić zawarte tam polecenia SQL, aby utworzyć wymagane tabele przed uruchomieniem aplikacji.

## Uruchomienie

W dwóch terminalach:

```bash
cd client && npm run start
cd server && npm run start
```
