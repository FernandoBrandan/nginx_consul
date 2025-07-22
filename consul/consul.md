// ===== CLIENTE CONSUL HELPER =====
// ===== SERVICIO DE USUARIOS (Puerto 3001) =====
// ===== SERVICIO DE PEDIDOS (Puerto 3002) =====
// ===== DOCKER COMPOSE CON CONSUL =====
// ===== PACKAGE.JSON =====
// ===== COMANDOS PARA PROBAR =====

## 1. Iniciar Consul

docker run -d --name consul -p 8500:8500 -p 8600:8600/udp \
 consul:1.15 consul agent -server -ui -node=server-1 \
 -bootstrap-expect=1 -client=0.0.0.0 -bind=0.0.0.0

## 2. Instalar dependencias

npm install express axios consul

## 3. Ejecutar servicios (en terminales separadas)

node servicio-usuarios.js
node servicio-pedidos.js

## 4. Probar endpoints

curl http://localhost:3001/usuario/1
curl http://localhost:3002/pedido/1/completo
curl http://localhost:3002/pedidos/usuario/1

## 5. Ver Consul UI

Abrir http://localhost:8500 en el navegador

## 6. Ver servicios registrados

curl http://localhost:8500/v1/agent/services

## 7. Ver health checks

curl http://localhost:8500/v1/health/service/servicio-usuarios

# Características principales de este ejemplo con Consul:

### Service Discovery Automático

- Los servicios se registran automáticamente al iniciar
- Consul mantiene un registro actualizado de servicios saludables
- Load balancing automático con selección aleatoria

### Health Checks

- Consul verifica cada 10 segundos que los servicios estén saludables
- Solo devuelve servicios que pasan los health checks
- Si un servicio falla, se retira automáticamente del registry

### Cache Inteligente

- Cache local de 30 segundos para evitar consultas repetidas
- Mejora el rendimiento y reduce la carga en Consul

### Graceful Shutdown

- Los servicios se desregistran automáticamente al cerrarse
- Evita que Consul mantenga referencias a servicios inactivos

## Ventajas de usar Consul:

- Alta Disponibilidad: Consul puede correr en cluster para evitar puntos únicos de fallo
- UI Web: Interfaz gráfica en http://localhost:8500 para monitorear servicios
- KV Store: Almacén clave - valor para configuración distribuida
- Multi - datacenter: Soporte nativo para múltiples centros de datos
- Seguridad: ACLs, encriptación, y autenticación integrada

## Para probarlo:

- Instalar dependencias: npm install express axios consul
- Iniciar Consul: docker run - d--name consul - p 8500: 8500 consul: 1.15 consul agent - server - ui - bootstrap - expect=1 - client=0.0.0.0
- Ejecutar servicios: node servicio - usuarios.js y node servicio - pedidos.js
- Probar: curl http://localhost:3002/pedido/1/completo
- Ver UI: Abrir http://localhost:8500
