import { CloudImage, CloudFlavour, CloudInstance } from "../../models";

export interface CloudProviderMockServerData {
  port: number;
  images: CloudImage[];
  flavours: CloudFlavour[];
  instances: CloudInstance[];
}

export const cloudProviderData: CloudProviderMockServerData[] = [{
  port: 4000,
  images: [{
    id: 1,
    name: "image 1.1",
    description: "Remote Desktop image",
    protocols: [{
      name: 'RDP',
      port: 3389
    }, {
      name: 'GUACD',
      port: 4482
    }]
  }, {
    id: 2,
    name: "image 1.2",
    description: "Jupyter Notebook image",
    protocols: [{
      name: 'HTTP',
      port: 8080
    }]
  }],
  flavours: [{
    id: 1,
    name: 'small',
    description: 'a small flavour',
    cpu: 1,
    memory: 1024
  }, {
    id: 2,
    name: 'medium',
    description: 'a medium flavour',
    cpu: 4,
    memory: 4096
  }, {
    id: 3,
    name: 'large',
    description: 'a large flavour',
    cpu: 16,
    memory: 65536
  }],
  instances: []
}, {
  port: 4001,
  images: [{
    id: 1,
    name: "image 2.1",
    description: "Remote Desktop image with GPU",
    protocols: [{
      name: 'RDP',
      port: 3389
    }, {
      name: 'GUACD',
      port: 4482
    }]
  }, {
    id: 2,
    name: "image 2.2",
    description: "Jupyter Notebook image with GPU",
    protocols: [{
      name: 'HTTP',
      port: 8080
    }]
  }],
  flavours: [{
    id: 1,
    name: 'small GPU',
    description: 'a small flavour with GPU',
    cpu: 2,
    memory: 2048
  }, {
    id: 2,
    name: 'medium GPU',
    description: 'a medium flavour with GPU',
    cpu: 8,
    memory: 8192
  }, {
    id: 3,
    name: 'large GPU',
    description: 'a large flavour with GPU',
    cpu: 32,
    memory: 131072
  }],
  instances: []
}];

