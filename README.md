# Docker instruction

1. Check image
   docker images
2. build production image from Dockerfile
   docker build -f Dockerfile.production -t minhnhat1104/backend:1.0 .
3. push image
   docker push minhnhat1104/backend:1.0

# Run Docker on server

1. Change image of backend service in docker/-compose.prod.yml to: minhnhat1104/backend:1.0
2. npm run docker: production

# Docker command

- Show stoped container: docker ps -a
- Stop container: docker kill [TÊN_HOẶC_ID_CONTAINER]
- Remove container: docker rm [TÊN_HOẶC_ID_CONTAINER]
- Work with docker-compose.yml: docker compose -f [COMPOSE .yml file] push/pull/build/up/down
- Work iwth Dockerfile: docker push/pull/build -t [IMAGE_NAME]
