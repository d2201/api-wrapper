# API Wrapper

**This project should not be used directly. Refer to my other public tools.**

It's the base for creating `SDKs` to other services

## Installation

In `dependencies` add line and run `yarn` or `npm install`.

```
"@sdk/base": "d2201/api-wrapper"
```

## Usage

API Wrapper as a base for `SDKs` should be only extended in classes

```typescript
import ApiBase from '@sdk/base'

class FooSDK extends ApiBase {
  ...code
}
```

## Contributing
Changes in the base may have a big impact on the other projects. Please write an `issue` first.

Pull requests in this repository may require higher quality.

## License
[GPL 3.0](https://choosealicense.com/licenses/gpl-3.0)
