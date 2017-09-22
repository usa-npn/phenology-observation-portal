# USA-NPN Phenology Observation Portal

This repository contains the front end [angular2](https://angular.io/) code for the USA-NPN phenology observation portal. The main purpose of this project is to guide a user through downloading USA-NPN phenology observations.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

To run the phenology observation portal the following need to be installed:

* [nodejs](https://nodejs.org/en/) - it is recommended to use [nvm](https://github.com/creationix/nvm) to manage multiple versions of nodejs

All additional dependancies are managed through [npm](https://www.npmjs.com/), the node package manager which is included with node.

### Installing

After cloning the project you will need to take the following steps.

cd into the main directory and install all dependancies through npm. 

```
cd phenology-observation-portal
npm install
```
The command installs all dependencies listed in the package.json file into a folder called node_modules.

[Webpack](https://webpack.github.io/) is used to build and bundle the project.

```
cd phenology-observation-portal
npm run build
```

If you are not running the project a webserver like apache or nginx, you can use the webpack dev server to serve the pages

```
cd phenology-observation-portal
npm start
```

## Deployment

A common deployment will look like this
```
cd phenology-observation-portal
sudo git pull
sudo npm install - this is only needed if the commit added a new npm package
sudo npm run build
```

## Related Projects

This repository only contains one of three main peices used to deliver phenology observations to public. The following repositories contain the other two pieces.

* [USA-NPN Phenology Observation Portal Nodejs Server](https://github.com/usa-npn/pop-service) - the nodejs server used to serve the phenology observations
* USA-NPN Rest Services (currently in svn) - rest services to interface with NPN data

## Authors

* **Jeff Switzer** - [NPN](https://github.com/usa-npn)
* **Lee Marsh** - [NPN](https://github.com/usa-npn)

See also the list of [contributors](https://www.usanpn.org/about/staff) who participated in this project.
