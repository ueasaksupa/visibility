from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, send
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from datetime import timedelta
import os

mongohost = os.getenv('MONGO_HOST') or '127.0.0.1'
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
cors = CORS(app)
client = MongoClient(f'mongodb://{mongohost}:27017', username="root", password="dbpass")
notiftcationDB = client.notification
serviceDB = client.services
linkAlertCollection = notiftcationDB.link_alert


@socketio.on('connect', namespace='/notification/subscribe')
def connect():
    emit('msg', {'data': 'Connected'})


@socketio.on('disconnect', namespace='/notification/subscribe')
def disconnect():
    print('Client disconnected')


##########
# NOTIFICATION
##################################################################################
# GET LAST 6 NOTIFICATION
@app.route('/notifications', methods=['GET'])
def get_notification():
    return jsonify({"data": [{k: v for k, v in x.items() if k != '_id'}
                             for x in linkAlertCollection.find({}).sort('created_on', -1).limit(6)]})

# RECEIVE NOTIFICATION TRIGGER
@app.route('/trigger', methods=['POST'])
def trigger():
    data = request.json["data"]
    alertType = request.json["type"]
    print(request.json["data"])
    if alertType == "linkalert":
        #
        # prepare post data
        #
        post_data = data
        post_data['created_on'] = datetime.utcnow()
        post_data["type"] = alertType
        #
        # update database
        #
        result = linkAlertCollection.insert_one(post_data)
        print('Data ID: {0} has been inserted'.format(result.inserted_id))
        #
        # send notification data to frontend page
        #
        socketio.emit('msg',
                      {'type': alertType, 'source': post_data['source']},
                      namespace='/notification/subscribe')
        return jsonify({"message": 'message ID {0} has been sent via websocket'.format(result.inserted_id)})
    else:
        return jsonify({"message": "nothing changed."})


##########
# SERVICES
##################################################################################
# GET ALL SERVICE
@app.route('/services/<service>', methods=['GET'])
def get_services(service):
    return jsonify({"response": [{k: v for k, v in x.items() if k != '_id'}
                                 for x in serviceDB[service].find()]})


# GET COUNT OF SERVICE STATUS
@app.route('/services/status/<service>', methods=['GET'])
def get_services_status(service):
    pipeline = [
        {
            '$group': {
                '_id': '$status', 
                'count': {
                    '$sum': 1
                }
            }
        }
    ]
    result = serviceDB[service].aggregate(pipeline)
    return jsonify(list(result))

# CREATE
@app.route('/services/<service>', methods=['POST'])
def new_service(service):
    data = request.json
    result = serviceDB[service].insert_one(data)
    print('Data ID: {0} has been inserted to service {1}'.format(
        result.inserted_id, service))
    return jsonify({"data": "OK"})

# DELETE
@app.route('/services/<service>/<name>', methods=['DELETE'])
def delete_service(service=None, name=None):
    query = {"name": name}

    result = serviceDB[service].delete_one(query)
    print('Data name: {0} has been deleted'.format(
        name))
    return jsonify({"data": "OK"})

# PATCH : for update
@app.route('/services/<service>/<name>', methods=['PATCH'])
def update_service(service=None, name=None):
    data = request.json
    status = data["changeStatusTo"]

    query = {"name": name}
    newvalues = {"$set": {"status": status}}

    result = serviceDB[service].update_one(query, newvalues)
    return jsonify({"data": "OK"})

# POST : create new history for new optimizLSP commit action
@app.route('/lsp-optimize', methods=["POST"])
def create_optimize():
    collection = "lspOptimize"
    data = request.json
    print(data)

    result = serviceDB[collection].insert_one(
        {
            "re-routed-lsps": data["re-routed-lsps"], 
            "created_on": datetime.utcnow(),
            "perform-opt-on":data["perform-opt-on"],
            "result": data["result"]
        }
    )
    return jsonify({"data": "OK"})

# GET : GET history
@app.route('/lsp-optimize', methods=["GET"])
def get_optimize_history():
    collection = "lspOptimize"
    return jsonify(
        {
            "response": [
                            {k: str(v) if k == '_id' else v for k, v in x.items()} for x in serviceDB[collection].find()
                        ]
        }
    )

# DELETE : DELETE history
@app.route('/lsp-optimize/<history_id>', methods=["DELETE"])
def delete_optimize_history(history_id):
    collection = "lspOptimize"
    print(history_id)
    result = serviceDB[collection].delete_one({ "_id": ObjectId(history_id) })
    if result.deleted_count > 0 :
        return "",204
    else:
        return "",404


if __name__ == '__main__':
    socketio.init_app(app, cors_allowed_origins="*")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
