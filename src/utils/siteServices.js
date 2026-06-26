import { allServices } from '../data/services'

const iconById = new Map(allServices.map((service) => [service.id, service.icon]))

export function getServicesFromContent(content) {
  return (content?.services || [])
    .filter((service) => service.enabled !== false)
    .map((service) => ({
      ...service,
      icon: iconById.get(service.id),
      custom: service.id === 'custom',
    }))
    .filter((service) => service.icon)
}

export function getServiceFromContent(content, serviceId) {
  return getServicesFromContent(content).find((service) => service.id === serviceId) ?? null
}
