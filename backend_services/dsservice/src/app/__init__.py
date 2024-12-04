import os

from flask import Flask
from flask import request, jsonify
from kafka import KafkaProducer
from dotenv import load_dotenv
import json

from app.service.messageService import MessageService

# Current session Name (default)
app = Flask(__name__)
app.config.from_pyfile("./config.py")

messageService = MessageService()
kafka_host = os.getenv('KAFKA_HOST', 'localhost')
kafka_port = os.getenv('KAFKA_PORT', '9092')
kafka_bootstrap_servers = f"{kafka_host}:{kafka_port}"

print("Kafka Server is " + kafka_bootstrap_servers)
print("\n")

# producer = KafkaProducer(bootstrap_servers=kafka_bootstrap_servers,
#                          value_serializer=lambda v: json.dumps(v).encode("utf-8"))


@app.route("/v1/ds/message", methods=["POST"])
def handle_message():
    message = request.json.get("message")
    result = messageService.process_message(message)
    serialized_result = result.serialize()  # Not Stringify

    # producer.send("expense_service", serialized_result)

    return "Hello"


@app.route("/", methods=["GET"])
def hello_world():
    print("Hello World!")
    return "Testing"
    
    
# If Session is main
if __name__ == "__main__":
    load_dotenv()
    app.run(host="localhost", port=8010, debug=True)
    
# { "message": "You Spent Rs. 100 in Starbucks on Your Card XXXX3214" }
