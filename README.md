# Team Navigator

Artsy's internal team directory.

Team Nav started off as a hackathon project way back in 2015. It's evolved a lot over the years. This repo is its latest iteration, written in 2020 (see the original project [here](https://github.com/artsy/team-navigator)).

## Getting started

**Note**: Team Nav isn't yet configured to be runnable by the open source community

_For Artsy Employees_

1. Copy down the `.env` file from citadel (You'll need proper access)

```
aws s3 cp s3://artsy-citadel/dev/.env.team .env
```

2. Install dependencies and start the service in dev mode

```
yarn && yarn dev
```

## Deploying

Merged PRs to `artsy/team#master` are automatically deployed to staging; PRs from `staging` to `release` are automatically deployed to production. [Start a deploy...](https://github.com/artsy/team/compare/release...staging?expand=1)

## About Artsy

<a href="https://www.artsy.net/">
  <img align="left" src="https://avatars2.githubusercontent.com/u/546231?s=200&v=4"/>
</a>

This project is the work of engineers at [Artsy][footer_website], the world's
leading and largest online art marketplace and platform for discovering art.
One of our core [Engineering Principles][footer_principles] is being [Open
Source by Default][footer_open] which means we strive to share as many details
of our work as possible.

You can learn more about this work from [our blog][footer_blog] and by following
[@ArtsyOpenSource][footer_twitter] or explore our public data by checking out
[our API][footer_api]. If you're interested in a career at Artsy, read through
our [job postings][footer_jobs]!

[footer_website]: https://www.artsy.net/
[footer_principles]: culture/engineering-principles.md
[footer_open]: culture/engineering-principles.md#open-source-by-default
[footer_blog]: https://artsy.github.io/
[footer_twitter]: https://twitter.com/ArtsyOpenSource
[footer_api]: https://developers.artsy.net/
[footer_jobs]: https://www.artsy.net/jobs
