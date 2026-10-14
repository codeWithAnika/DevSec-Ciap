# Multi-stage / Minimal Production Web Server Image
# Official Nginx Alpine Linux image pinned to a specific stable release
FROM nginx:1.27.4-alpine

# Set metadata labels for traceability and DevSecOps compliance
LABEL maintainer="Talavadekar Anika Vinit <anika.talavadekar24@sakec.ac.in>" \
      student.id="124BTCS1036" \
      course="DevSecOps Lab" \
      project="CIAP Online Examination Prototype" \
      version="1.0.0"

# Remove default Nginx static assets to avoid serving extraneous files
RUN rm -rf /usr/share/nginx/html/*

# Copy only the verified application static frontend assets into Nginx web root
COPY src/ /usr/share/nginx/html/

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure the container is serving requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Run Nginx in foreground to keep container active
CMD ["nginx", "-g", "daemon off;"]
