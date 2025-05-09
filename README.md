# Aplikacja webowa dla gabinetu psychologicznego z modułem uczenia maszynowego w Pythonie

## Wymagania

- [Node.js](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)
- [MySQL](https://dev.mysql.com/downloads/)

# Instalacja

## Pobranie dependencies

```bash
cd client && npm install
cd ../server && npm install
```

## Środowisko Python (venv)

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

## Baza danych

Struktura bazy danych znajduje się w pliku `db.sql`. Należy uruchomić zawarte tam polecenia SQL, aby utworzyć wymagane tabele przed uruchomieniem aplikacji.

# Uruchomienie

W dwóch terminalach:

```bash
cd client && npm run start
cd server && npm run start
```
