const fs = require('fs')
const Consul = require('consul')
const consul = new Consul({ host: process.env.CONSUL_HOST || '0.0.0.0' })

const ms = [
  "gateway",
  "orderServiceAsync",
  "payment",
]

ms.forEach(name => {
  const cfg = JSON.parse(fs.readFileSync(`../config-files/${name}/development.json`))
  consul.kv.set(`config/${name}`, JSON.stringify(cfg), err => {
    if (err) console.error(err)
    else console.log(`Config ${name} subida a Consul`)
  })
})


/**
 * docker-compose

services:
  consul:
    image: consul:1.15
    container_name: consul_service
    ports:
      - "8500:8500"
    command: consul agent -dev -client=0.0.0.0
 */

// {
//   "PORT": "3001",
//   "APP_URL": "http://localhost",
//   "APP_NAME": "apigateway",
//   "NODE_ENV": "development", 
//   "MONGO_URI": "mongodb://mongo:27017/backup",
//   "MONGO_USERNAME": "root",
//   "MONGO_PASSWORD": " ",
//   "MYSQL_HOST": "mysql_ms",
//   "MYSQL_USER": "root",
//   "MYSQL_PASSWORD": " ",
//   "MYSQL_DB": "backup",
//   "SEQUELIZE": "",
//   "SEQUELIZE_NAME": "root",
//   "SEQUELIZE_USER": "gateway",
//   "SEQUELIZE_PASSWORD": " ",
//   "MERCADOPAGO_PUBLIC_KEY": " ",
//   "MERCADOPAGO_ACCESS_TOKEN": " ",
//   "RABBITMQ_URL": "amqp://rabbitmq:5672",
//   "REDIS_URL": "",
//   "JWT_TOKEN_SECRET": " ",
//   "JWT_EXPIRE": "1h",
//   "JWT_COOKIE_EXPIRE": "",
//   "REDIS_HOST": "",
//   "REDIS_PORT": "",
//   "REDIS_PASSWORD": "",
//   "REDIS_DB": "",
//   "SMTP_HOST": "",
//   "SMTP_PORT": "",
//   "SMTP_EMAIL": ""
// }
