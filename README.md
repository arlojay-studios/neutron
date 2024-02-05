# Neutron
[//]: <### ![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/release/atom)>
[//]: <todo: badge + workflows + banner>
Express powered server module for [Atomic](github.com/arlojay-studios/atomic).    

Runs with the [`proton`](github.com/arlojay-studios/proton) API and serves our default web client, [`electron`](github.com/arlojay-studios/atomic)

## Internals
[`neutronServer`](github.com/arlojay-studios/neutron/blob/main/index.ts#L16) is primarily based off of an express server, and holds the handle to the [`protonDB`](github.com/arlojay-studios/neutron/blob/main/cpre.ts#L18)  before passing it off to Atomic's [`Wrapper`](github.com/arlojay-studios/atomic/blob/main/index.ts#L34)  class for production

## NPM Package
Our npm package is hosted on github's npm package repository, as it is still in development, and cannot be installed directly.
