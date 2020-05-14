# ais-visibility-portal
This poject was bootstapped from create-react-app, and this project is the web portal for **AIS 5G PoC** (thailand). 
The portal main objective:
- showing/retriving data from **SR_PCE** and vistualize the network topology, sr-lsp. 
- receive notification from MDT when traffic crossing threshold and prepare **lsp-reoptimization**
- service creation (be the UI of NSO)

## Portal Installation
*prerequisite **docker** and **docker-compose** are required*

1. Clone
```bash
# clone the repo
$ git clone https://wwwin-github.cisco.com/nueasaks/ais-visibility-portal.git <project_name>
# go into app's directory
$ cd <project_name>
```
2. Create persistent volume for db-data (use the exact name "**db-data**" *without quote*)
or if you want to change directory or name please change it in docker-compose.yml too.
```bash
mkdir db-data
```
4. Install using docker-compose
```bash
docker-compose up -d
```
ALL GOOD !!!

## docker-compose
In the installation step if you change db-data name or path please change it in **volumes** section also.  The default mongoDB password is **dbpass**

```yaml
version: "3.7"

services:
  mongo:
    image: mongo
    restart: always
    volumes:
      - ./db-data:/data/db ### dont foget to chage to correct path ####
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: dbpass

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: dbpass

  backend:
    build:
      context: ./backend
    ports:
      - 5000:5000
    restart: always

  frontend:
    build:
      context: ./frontend
    ports:
      - 3000:3000
    restart: always

```

## vscode Setting
Here is the setting of vscode i currently use. (with extension **prettier**)

```json
{
"editor.formatOnSave": true,
"editor.tabSize": 2,
"python.linting.enabled": true,
"prettier.printWidth": 130,
"prettier.tabWidth": 2,
"prettier.trailingComma": "all"
}
```
