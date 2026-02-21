# Build stage
FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application and build
COPY . .
RUN npm run build -- --configuration production

# Final stage: serve with Nginx
FROM nginx:alpine
# Copy the build output to Nginx's html folder
# For Angular v17+, the output is usually in dist/[project-name]/browser
COPY --from=build /app/dist/web-app/browser /usr/share/nginx/html

# Copy a basic nginx config to handle Angular routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
