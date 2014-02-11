# mnpm-server

prototype to implement the purpose of npm in a simpler, more scalable, way.

## why

Because I haven't written a package manager for NodeJS yet.

I think that NPM is great, but does too much. I think it can be just as powerful while embracing a simpler implementation.

Ultimately, I want the NPM registry to be dumber, the tarballs to be distributed via dumb http/rsync mirroing, and the NPM client to be smarter in utilizing the registry and mirrors for ultimate speed.

## how

The following tasks are implemented by the registry:

* what versions of a package exist
* what is the tarball checksum of a package

That is it!

I'm not building in user authentication or uploading packages (yet). Since NPM is still the source of truth, a separate process should tail NPM and pull the registry updates and tarballs over to the mnpm system.

### mirroring

Following the linux package mirrors: there should be a seed host that a limited number of trusted hosts should rsync themselves from. From these trusted hosts, others may then coordinate to rsync from them.

As a new package in inserted into the existing NPM system, a tailing process should notice new packages, and add the tarball to the seed host (as well as inserting the data into the registry e.g. name, version, and tarball checksum).

## api

### `GET /versions?name=#{name}`

Returns all versions of module. Use this to turn a SemverExpression into a resolved version number.

I'm convinced that a client can do this themselved (by looking at a mirror). That's if we can enforce a common path format for hosting modules, and http is the only medium (might be trickier with systems that don't have a good idea of a directory listing).

Volatile.

Returns

`200 OK`

```javascript
{
  versions: [
    '0.0.0',
    '0.0.1'
  ]
}
```

### `GET /checksum?name=#{name}&version=#{version}`

Gets a checksum of a tarball for a packaged module at a specific version. Highly cacheable.

## client

The current npm client will not integrate with this server. Though, I could probably change the api (or build an mnpm-proxy) to accomodate the npm client.

For prototyping, I'm shipping `mnpm` as a client. It will only install packages to your current working directory's `node_modules` folder.

## license

BSD-2
