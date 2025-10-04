from flask import Flask, request, jsonify, render_template
import psycopg2
from pymongo import MongoClient
from gridfs import GridFS
import base64
import io
from flask import send_file
from bson import ObjectId

app = Flask(__name__)

# ---------- PostgreSQL ----------
conn_pg = psycopg2.connect(
    host="localhost",
    database="personas_db",
    user="postgres",       
    password="2205",
    port="5432",
    options="-c client_encoding=UTF8"
)
cur_pg = conn_pg.cursor()

# ---------- MongoDB ----------
client_mongo = MongoClient("mongodb://localhost:27017/")
db_mongo = client_mongo["personas_db"]
fs = GridFS(db_mongo)

# ---------- Rutas ----------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    data = request.json

    id_persona = data['id']
    nombre = data['nombre']
    apellido = data['apellido']
    foto_base64 = data['foto']

    # Decodificar la imagen Base64
    foto_bytes = base64.b64decode(foto_base64.split(",")[1])

    # Guardar la foto en MongoDB (GridFS)
    foto_id = fs.put(foto_bytes, filename=f"{nombre}_{apellido}.jpg")

    # Guardar los datos en PostgreSQL
    cur_pg.execute(
        "INSERT INTO personas (id_persona, nombre, apellido, foto_gridfs_id) VALUES (%s, %s, %s, %s)",
        (id_persona, nombre, apellido, str(foto_id))
    )
    conn_pg.commit()

    return jsonify({"mensaje": "✅ Persona guardada correctamente", "foto_id": str(foto_id)})

@app.route('/personas', methods=['GET'])
def get_personas():
    cur_pg.execute("SELECT * FROM personas")
    rows = cur_pg.fetchall()

    data = []
    for row in rows:
        data.append({
            "id_persona": row[0],
            "nombre": row[1],
            "apellido": row[2],
            "foto_id": row[3]
        })

    return jsonify(data)
@app.route("/ver_foto/<foto_id>", methods=["GET"])
def ver_foto(foto_id):
    try:
        # Buscar la imagen en MongoDB (GridFS)
        file = fs.get(ObjectId(foto_id))
        return send_file(io.BytesIO(file.read()), mimetype="image/jpeg")
    except Exception as e:
        return jsonify({"error": str(e)}), 404

if __name__ == '__main__':
    app.run(debug=True)
