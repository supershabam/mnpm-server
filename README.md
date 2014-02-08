# mnpm-server

prototype to implement npm based on linux package mirroring

## why

npm does two tasks that should be separated: registry tasks, and mirroring tasks. Npm should just serve as a registry and point at where to get mirrored tarballs. This is an experiment to just implement a registry.

## how

The registry has the following tasks:

* manage what exists in mnpm
* serve as authority for checksums of tarballs
* accept new modules and ensure the tarball gets seeded into the mirrors

The main difference between mnpm and npm is where tarballs are stored. It's a bad idea (nomatter what database you use) to put large binary files into your business logic database.

Replication of large files isn't a new task, so let's use tried-and-true technologies for managing fanning out of large sets of immutable data: rsync.

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
      version: Semver
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
