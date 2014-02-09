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

TODO

## api

For now, I'm not trying to emulate the existing npm api. I'm just prototyping out an idea.

### `GET /dependencies?name=#{name}&version=#{version}`

Returns the dependencies of a module. Version must be a resolved (non-expression) version.

Highly cacheable.

Returns

`200 OK`

```javascript
{
  dependencies: [
    {
      name: String,
      version: SemverExpression
    }
  ] // dev dependencies could be included here as well, but for now skipping
}
```

### `GET /versions?name=#{name}`

Returns all versions of module. Use this to turn a SemverExpression into a resolved version number.

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

### `PUT /module`

Puts a module into the registry. No authentication for now. Errors if you try to publish an existing module-version

Payload

```javascript
// application/json
{
  name: String,
  version: Semver,
  dependencies: [
    {
      name: String,
      version: SemverExpression
    }
  ],
  tarball: Base64
}
```

Returns

`201 No Content`

### `GET /mirrors`

Gets a list of mirrors that host tarballs.

Returns

`200 OK`

```javascript
{
  mirrors: [
    'http://mirror.example.com/basepath'
  ]
}
```

## client

The current npm client will not integrate with this server. Though, I could probably change the api (or build an mnpm-proxy) to accomodate the npm client.

For prototyping, I'm shipping `mnpm` as a client. It will only install packages to your current working directory's `node_modules` folder.

## license

BSD-2
