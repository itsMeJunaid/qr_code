
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Generate QR Code
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', async () => {
        const text = document.getElementById('qr-text').value;
        if (!text) {
            alert('Please enter some text or URL');
            return;
        }

        try {
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: text }),
            });

            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }

            const img = document.getElementById('qr-image');
            img.src = `data:image/png;base64,${data.qr_code}`;
            
            const downloadLink = document.getElementById('download-link');
            downloadLink.href = img.src;
            downloadLink.style.display = 'inline-block';
        } catch (error) {
            alert('Error generating QR code');
        }
    });

    // QR Code Reader
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2196F3';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ddd';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    async function handleFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/read-qr', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            const resultDiv = document.getElementById('reader-result');
            
            if (data.error) {
                resultDiv.innerHTML = `<p class="error">${data.error}</p>`;
                return;
            }

            resultDiv.innerHTML = `<p><strong>Decoded content:</strong> ${data.data}</p>`;
        } catch (error) {
            alert('Error reading QR code');
        }
    }
});
