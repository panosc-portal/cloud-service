PaNOSC Cloud Service CLI Client
================================

A PaNOSC Cloud Service CLI client to test the Cloud Service API


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->

Note: The <i>cloud-service</i> command is equialent to ./bin/run

```sh-session
$ npm install
$ cloud-service COMMAND
running command...
$ cloud-service (-v|--version|version)
cloud-service-cli-client/1.0.0 darwin-x64 node-v10.15.3
$ cloud-service --help [COMMAND]
USAGE
  $ cloud-service COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cloud-service provider:COMMAND`](#cloud-service-instance-command)

## `cloud-service provider:COMMAND`

perform provider related operations

```
USAGE
  $ cloud-service provider:COMMAND

COMMANDS
  provider:add     Adds a provider to the cloud service
  provider:delete  Deletes a provider from the cloud service
  provider:list    List providers of the cloud service
```

## `cloud-service help [COMMAND]`

display help for cloud-service

```
USAGE
  $ cloud-service help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


<!-- commandsstop -->
