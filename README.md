# Cloud Service

[![Actions Status](https://github.com/panosc-portal/cloud-service/workflows/Node%20CI/badge.svg)](https://github.com/panosc-portal/cloud-service/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The Cloud Service is a microservice of the PaNOSC Common Portal.

The Cloud Service performs two main tasks: firstly, it provides a catalogue of data analysis environment Plans (Remote Desktop and Notebook) and currently available Instances (analysis machines). Secondly it works as a proxy to concrete Cloud Providers where the data analysis environments are running.

A data analysis Plan is a combination of an Image and a Flavour: for example a Plan could be a Remote Desktop Image have 2 CPUs and 8GB memory.

The catalogue of Plans is built up from data provided by the Cloud Providers. All metadata associated to Plans and Instances from all providers is stored in a local PostgreSQL database.

A user-initiated request to instantiate a Plan is then forwarded to the relevant provider which will in turn create a container or virtual machine. The IP:PORT of the instance is returned and stored in the Instance table of the Cloud Service database.

Early implementations of the Cloud Service will regularly poll all active instances to obtain their states: the state is then stored in the local database (a UI is then able to show current instance states). Later iterations will use a dedicated messaging microservice of the Portal Architecture.

Documentation can be found at https://confluence.panosc.eu/display/wp4/Common+Portal+-+Cloud+Service

## Installation
```
 npm install
 ```

## Run
```
npm start
```
Access explorer at: http://localhost:3000/api/v1/explorer/

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
