# app.py
from flask import Flask, render_template, request, jsonify, send_file
import qrcode
from PIL import Image
from pyzbar.pyzbar import decode
import io
import base64
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    data = request.json.get('data')
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Add data to QR code
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create image from QR code
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    qr_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    # Convert to base64 for frontend display
    img_str = base64.b64encode(img_byte_arr.getvalue()).decode()
    
    return jsonify({'qr_code': img_str})

@app.route('/read-qr', methods=['POST'])
def read_qr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Read QR code
        image = Image.open(file)
        decoded_objects = decode(image)
        
        if not decoded_objects:
            return jsonify({'error': 'No QR code found in image'}), 400
        
        # Return decoded data
        return jsonify({'data': decoded_objects[0].data.decode('utf-8')})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
