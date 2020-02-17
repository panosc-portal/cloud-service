import { CloudImage, CloudFlavour } from "../../models";
import { SimplifiedCloudInstance } from "./simplified-cloud-instance.model";
import * as fs from 'fs';

export interface CloudProviderMockServerData {
  port: number;
  images: CloudImage[];
  flavours: CloudFlavour[];
  instances: SimplifiedCloudInstance[];
}

const rawCloudProviderData = fs.readFileSync('./resources/__tests__/cloudProviderData.json', 'utf8');
export const cloudProviderData = JSON.parse(rawCloudProviderData) as CloudProviderMockServerData[];
