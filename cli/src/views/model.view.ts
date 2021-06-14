import {Instance, Image, Flavour, Provider, Plan} from "../models"

export function mapInstance(instance: Instance): any {
  return {
    Id: instance.id,
    Name: instance.name,
    'Cloud Provide': instance.plan.provider.name,
    'Cloud Id': instance.cloudId,
    Status: instance.state.status,
    Plan: instance.plan.name,
    Image: instance.image.name,
    Flavour: `${instance.flavour.name} (${instance.flavour.cpu} Cores, ${instance.flavour.memory}MB RAM)`,
    Host: instance.hostname,
    Protocols: instance.protocols ? instance.protocols.map(protocol => `${protocol.name} (${protocol.port})`).join(', ') : ''
  }
}

export function mapImage(image: Image): any {
  return {
    Id: image.id,
    Name: image.name,
    Type: image.environmentType,
    Protocols: image.protocols.map(protocol => `${protocol.protocol.name} (${protocol.port})`).join(', ')
  }
}

export function mapFlavour(flavour: Flavour): any {
  return {
    Id: flavour.id,
    Name: flavour.name,
    'CPU Cores': flavour.cpu,
    'Memory MB': flavour.memory
  }
}

export function mapPlan(plan: Plan): any {
  return {
    Id: plan.id,
    Name: plan.name,
    Provider: plan.provider.name,
    Image: plan.image.name,
    Flavour: plan.flavour.name
  }
}

export function mapProvider(provider: Provider): any {
  return {
    Id: provider.id,
    Name: provider.name,
    URL: provider.url
  }
}
