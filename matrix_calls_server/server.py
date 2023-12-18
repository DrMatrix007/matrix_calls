from flask import Flask
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)


class MessagesResource(Resource):
    def get(self):
        return [{"message": "hello world"}]


class ContactsResource(Resource):
    def get(self):
        return [{"name": "dr matrix", "email": "drmatrix@matrix.mail"}]


api.add_resource(MessagesResource, "/api/messages")
api.add_resource(ContactsResource, "/api/contacts")


def main():
    app.run(debug=True)


if __name__ == "__main__":
    main()
