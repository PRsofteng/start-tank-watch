# ─────────────────────────────────────────────────────────────
# Dockerfile  (constrói imagem Linux para tank_reader.py)
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim

# 1. diretório de trabalho
WORKDIR /app

# 2. dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. código-fonte
COPY tank-readerv2.py .

# 4. porta exposta (pode mudar via -p host:container)
EXPOSE 8000

# 5. entrypoint
CMD ["python", "tank-readerv2.py"]
