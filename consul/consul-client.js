// consul-client.js
const consul = require('consul')()

class ConsulService {
    constructor() {
        this.consul = consul
        this.cache = new Map()
        this.cacheTTL = 30000
    }

    async registrarServicio(nombre, puerto, host = 'localhost', healthCheck = null) {
        return await registrarServicio.call(this, nombre, puerto, host, healthCheck)
    }

    async descubrirServicio(nombreServicio) {
        return await descubrirServicio.call(this, nombreServicio)
    }

    async desregistrarServicio(serviceId) {
        return await desregistrarServicio.call(this, serviceId)
    }

    async obtenerUrlServicio(nombreServicio) {
        return await obtenerUrlServicio.call(this, nombreServicio)
    }
}

async function registrarServicio(nombre, puerto, host, healthCheck) {
    const serviceId = `${nombre}-${host}-${puerto}`

    const serviceConfig = {
        id: serviceId,
        name: nombre,
        address: host,
        port: puerto,
        tags: [`version-1.0`, `env-development`]
    }

    if (healthCheck) {
        serviceConfig.check = {
            http: `http://${host}:${puerto}${healthCheck}`,
            interval: '10s',
            timeout: '5s'
        }
    }

    try {
        await this.consul.agent.service.register(serviceConfig)
        console.log(`✅ Servicio ${nombre} registrado en Consul con ID: ${serviceId}`)
        return serviceId
    } catch (error) {
        console.error(`❌ Error registrando servicio ${nombre}:`, error)
        throw error
    }
}

async function descubrirServicio(nombreServicio) {
    const cacheKey = `service:${nombreServicio}`

    if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data
        }
    }

    try {
        const services = await this.consul.health.service({
            service: nombreServicio,
            passing: true
        })

        if (!services || services.length === 0) {
            throw new Error(`No se encontraron instancias saludables de ${nombreServicio}`)
        }

        const randomService = services[Math.floor(Math.random() * services.length)]
        const serviceInfo = {
            host: randomService.Service.Address,
            port: randomService.Service.Port,
            id: randomService.Service.ID
        }

        this.cache.set(cacheKey, {
            data: serviceInfo,
            timestamp: Date.now()
        })

        console.log(`🔍 Servicio ${nombreServicio} descubierto: ${serviceInfo.host}:${serviceInfo.port}`)
        return serviceInfo
    } catch (error) {
        console.error(`❌ Error descubriendo servicio ${nombreServicio}:`, error)
        throw error
    }
}

async function desregistrarServicio(serviceId) {
    try {
        await this.consul.agent.service.deregister(serviceId)
        console.log(`✅ Servicio ${serviceId} desregistrado de Consul`)
    } catch (error) {
        console.error(`❌ Error desregistrando servicio ${serviceId}:`, error)
    }
}

async function obtenerUrlServicio(nombreServicio) {
    const service = await this.descubrirServicio(nombreServicio)
    return `http://${service.host}:${service.port}`
}

module.exports = ConsulService
