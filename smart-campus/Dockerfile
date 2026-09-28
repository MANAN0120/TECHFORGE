# ============================================
# Stage 1: Build the React Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build


# ============================================
# Stage 2: Python Backend + Serve Frontend
# ============================================
FROM python:3.11-slim

# Set working directory to the smart-campus root
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend source code
COPY backend/ /app/backend/

# Copy campus data, database schema, scripts
COPY campus-data/ /app/campus-data/
COPY database/ /app/database/
COPY scripts/ /app/scripts/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create uploads directory
RUN mkdir -p /app/uploads/events /app/uploads/shops

# Set environment defaults
ENV DATABASE_URL=sqlite:///./smart_campus.db
ENV CAMPUS_DATA_DIR=/app/campus-data
ENV DEFAULT_CAMPUS_ID=cu-gharaun
ENV UPLOAD_DIR=/app/uploads
ENV HOST=0.0.0.0

# Expose the port Railway provides
EXPOSE ${PORT:-8000}

# Seed the database and start the server
CMD cd /app/backend && \
    python -c "import sys; sys.path.insert(0,'.'); from seed_prod import seed; seed()" && \
    uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
