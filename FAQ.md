# RawGit Frequently Asked Questions

## Who runs RawGit?

Hi, I'm [Ryan Grove](http://wonko.com/).

## Why is this necessary? Can't I just load files from GitHub directly?

When you request certain types of files (like JavaScript, CSS, or HTML) from `raw.githubusercontent.com` or `gist.githubusercontent.com`, GitHub serves them with a `Content-Type` header set to `text/plain`. As a result, most modern browsers won't actually interpret these files as JavaScript, CSS, or HTML and will instead just display them as text.

GitHub does this because serving raw files from a git repo is inefficient and they want to discourage people from using their GitHub repos for static file hosting.

RawGit acts as a caching proxy. It forwards requests to GitHub, caches the responses, and relays them to your browser with an appropriate `Content-Type` header based on the extension of the file that was requested. The caching layer ensures that minimal load is placed on GitHub, and you get quick and easy static file hosting right from a GitHub repo. Everyone's happy!

## Is RawGit associated with GitHub?

No, RawGit is not associated with GitHub in any way. Please don't contact GitHub asking for help with RawGit.

## Should I use RawGit instead of GitHub Pages? Should I host my static website on RawGit?

No. [GitHub Pages](https://pages.github.com/) is a much better solution for hosting static files and static websites than RawGit is, so if it fits well in your workflow, you should use it instead of RawGit.

RawGit is not a good solution for hosting a full static website. RawGit is less reliable than GitHub Pages or other static hosts, and RawGit doesn't allow content to be indexed by search bots, so your SEO will suffer.

## What should I use RawGit for?

Use RawGit when you need to quickly and temporarily share some example code or a test page in a GitHub repo or gist, but you don't want to go through the trouble of setting up a full static site or a GitHub Pages branch.

Some people do rely on the RawGit CDN for serving files in production, but this isn't a great idea. RawGit proxies requests to GitHub on demand, and GitHub occasionally has service issues that cause RawGit requests to fail.

In production you'd be much better off using a dedicated static web host and CDN instead of RawGit. But if you're a cheapskate and want a robust and reliable free CDN, [jsDelivr](https://www.jsdelivr.com/) is a good option.

## What's the difference between development and CDN URLs?

When you make a request to a `rawgit.com` URL (a development URL), the RawGit server loads the requested file from GitHub, serves it to your browser, and caches it for a short time. If you push new changes to GitHub, you can reload and see them within a few minutes. This makes dev URLs useful for testing or sharing demos during development, but it also puts more server load on RawGit and GitHub.

Requests to `cdn.rawgit.com` (a CDN URL) are routed through [StackPath](https://stackpath.com/)'s super fast content delivery network and are cached **permanently** at the CDN layer based on the URL. This results in the best performance and reduces load on RawGit and on GitHub, but it means that reloading won't fetch new changes from GitHub.

During development, when traffic is low and freshness is more important than performance, use a development URL. For anything you share with the public, use a CDN URL to avoid putting unnecessary load on RawGit.

## Can I use a development URL on a production website or in public example code?

No. Only use development URLs for personal testing or for sharing temporary demos with a few people during development.

Don't use development URLs in example code or in public demos, because people often copy and paste that code and use it in production apps without realizing that they need to change the URLs. Then they send too much traffic to RawGit, get throttled, and their apps break.

Use CDN URLs for anything you share with the general public.

## What will happen if a development URL gets large amounts of traffic?

First, requests will be throttled and the URL will start to load very slowly. If the traffic continues even after automatic throttling is triggered, requests for that URL (or for your entire GitHub account) may be blocked permanently.

## What will happen if a CDN URL gets large amounts of traffic?

Usually this is fine.

However, some people have begun using RawGit to serve large collections of uniquely named files (often images). These unique URLs defeat the CDN's ability to efficiently cache files, which means requests can end up overloading RawGit's origin server. In cases like this, I may block the excessive traffic to prevent the service from being degraded for other users.

Please don't use RawGit for things like this.

## How long does the CDN cache files? How can I make it refresh my file?

The CDN caches files permanently based on their path. It ignores query strings. This is done to improve performance and to make it possible for the CDN to handle massive amounts of traffic without causing excessive load on RawGit or GitHub's servers.

To ensure that the CDN always serves the version of the file you want, use a git tag or commit hash in the file's path instead of a branch name, and update the URL if you push a new version of the file.

So, instead of a URL like `https://cdn.rawgit.com/user/repo/branch/file`, use a URL like `https://cdn.rawgit.com/user/repo/tag/file` or `https://cdn.rawgit.com/user/repo/commit/file`.

## I need guaranteed 100% uptime. Should I use cdn.rawgit.com?

No. RawGit is a free, best-effort service and cannot provide any uptime or support guarantees, even for the CDN.

While I do my best to keep things running, things sometimes go wrong. Sometimes there are network or provider issues outside my control. Sometimes abusive traffic temporarily affects response times. Sometimes things break while I'm asleep and I don't know there are problems until I wake up. And sometimes I break things by doing something dumb (although I try really hard not to).

Since I run RawGit in my spare time, with my own money and with CDN hosting generously donated by [StackPath](https://stackpath.com/), it has a budget that's probably less than you pay for coffee in a given month. My goal is to help other open source developers get their projects up and running, but if you need to serve files that are crucial to your business, you should pay for a host with well-funded infrastructure and uptime guarantees.

## Why does RawGit redirect requests for .jpg, .png, and other image files to GitHub?

GitHub already serves certain file types — such as .jpg and .png files — with the correct `Content-Type` headers, so there's no benefit to proxying these files through RawGit. RawGit will redirect requests for these file types to GitHub to avoid wasting bandwidth. You should update your URLs to request these files from GitHub directly.

## Why do anonymous gist URLs return 403 errors?

RawGit doesn't serve anonymous gists because they're frequently used for illegal or abusive content. Sorry.

## I moved a file in my repo and now old RawGit URLs are broken. Is there any way to redirect to the new file?

[There sure is](https://github.com/rgrove/rawgit/wiki/How-to-redirect-a-RawGit-URL-to-another-URL-or-GitHub-file) (for non-CDN URLs, anyway). But in the future, you might want to consider using URLs based on a tag or commit ref rather than a branch, since tags and commits always represent a single point in time and won't break if you move a file later.

## Does RawGit work for private repositories?

Nope. [I don't want your secrets flowing through RawGit](https://github.com/rgrove/rawgit/issues/62).

## Can I donate money/Bitcoin/pie to help you out?

It's super nice of you to offer, but I don't need any donations at this time. RawGit's server costs are minimal, and the lovely people at [StackPath](https://stackpath.com/) provide RawGit's CDN service free of charge. Thank you though!

## I have feedback or want to report a problem! Who can I contact?

-   To report a critical issue like RawGit being broken or to share general feedback, send a tweet to [@rawgit](https://twitter.com/rawgit) or [@yaypie](https://twitter.com/yaypie). I try to respond quickly when I'm awake and near a computer, but sometimes I do have to sleep. If you don't get a response, just wait longer.

-   To report a non-critical issue, please [file an issue](https://github.com/rgrove/rawgit/issues) on RawGit's GitHub project.

-   To report a security concern, please email `security@rawgit.com` privately. Expect a response within 48 hours.

-   To file a DMCA takedown notification or counter-notification, see [RawGit's DMCA Notice & Takedown Procedure](DMCA.md)
